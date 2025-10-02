"""
인증 관련 API 라우트
로그인, 로그아웃, 회원가입 등의 인증 기능을 담당
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import text
from sqlalchemy.orm import Session
from db.database import get_db
import os
import sys
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from datetime import datetime, timedelta
import secrets

current_file = os.path.abspath(__file__) 
project_root = os.path.abspath(os.path.join(current_file, "..", ".."))
sys.path.append(project_root)

try:
    from logs import log_manager
    from models.base_response import BaseResponse
    from models.auth import LoginRequest, LoginResponse, LogoutResponse, UserInfoResponse
except Exception as e:
    print(f"임포트 실패: {e}")

# 라우터 생성
router = APIRouter(prefix="/api/auth", tags=["auth"])

# 보안 스키마
security = HTTPBearer()

async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials

    # 1. 세션 테이블에서 토큰 조회
    session = db.execute(text(
        """
        SELECT user_id, expires_at
        FROM sessions
        WHERE session_token = :token
        ORDER BY id DESC
        LIMIT 1
        """), {'token': token}).first()

    if not session:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

    # 2. 세션 만료 여부 확인
    if datetime.utcnow() > session.expires_at:
        # 만료된 세션은 DB에서 삭제
        db.execute(text(
            """
            DELETE FROM sessions WHERE session_token = :token
            """), {'token': token})
        db.commit()
        raise HTTPException(status_code=401, detail="세션이 만료되었습니다. 다시 로그인해주세요.")

    # 3. 사용자 정보 조회
    user = db.execute(text(
        """
        SELECT id, username, email, role
        FROM users
        WHERE id = :user_id
        """), {'user_id': session.user_id}).first()

    if not user:
        # 세션은 있지만 해당 유저가 없는 경우 (예: 유저 삭제됨)
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다.")

    return user

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """사용자 로그인"""
    try:
        user = db.execute(text(
            """
            SELECT id, username, email, password_hash
            FROM users
            WHERE username = :username
            """), {'username': request.username}).first()
        if not user:
            # 존재하지 않는 사용자 로그인 시도 기록
            db.execute(text(
                """
                INSERT INTO user_login_logs (user_id, ip_address, login_success, failure_reason, created_at)
                VALUES (NULL, :ip_address, FALSE, '존재하지 않는 사용자', NOW())
                """), {
                    'ip_address': request.client.host if hasattr(request, 'client') else None
                })
            db.commit()
            
            raise HTTPException(
                status_code=401,
                detail="사용자명 또는 비밀번호가 올바르지 않습니다."
            )

        # argon2id 해시 검증
        ph = PasswordHasher()
        try:
            ph.verify(user.password_hash, request.password)
        except VerifyMismatchError:
            log_manager.logger.warning(f"로그인 실패: {request.username} (잘못된 비밀번호)")
            
            # 로그인 실패 기록을 user_login_logs 테이블에 저장
            db.execute(text(
                """
                INSERT INTO user_login_logs (user_id, ip_address, login_success, failure_reason, created_at)
                VALUES (:user_id, :ip_address, FALSE, '잘못된 비밀번호', NOW())
                """), {
                    'user_id': user.id,
                    'ip_address': request.client.host if hasattr(request, 'client') else None
                })
            db.commit()
            
            raise HTTPException(
                status_code=401,
                detail="사용자명 또는 비밀번호가 올바르지 않습니다."
            )

        # 비밀번호가 맞으면 로그인 성공 처리
        log_manager.logger.info(f"로그인 성공: {request.username}")

        # 1. 세션 토큰 생성
        session_token = secrets.token_hex(32)

        # 2. 만료 시간 계산
        expires_at = datetime.utcnow() + timedelta(hours=4) # 4시간 후
        if (request.remember_me):
            expires_at = datetime.utcnow() + timedelta(days=7) # 7일 후

        # 3. 데이터베이스에 세션 저장
        db.execute(text(
            """
            INSERT INTO sessions (session_token, user_id, expires_at)
            VALUES (:session_token, :user_id, :expires_at)
            """), {
                'session_token': session_token,
                'user_id': user.id,
                'expires_at': expires_at
            })

        # 4. 로그인 기록을 user_login_logs 테이블에 저장
        db.execute(text(
            """
            INSERT INTO user_login_logs (user_id, ip_address, login_success, created_at)
            VALUES (:user_id, :ip_address, TRUE, NOW())
            """), {
                'user_id': user.id,
                'ip_address': request.client.host if hasattr(request, 'client') else None
            })

        # 5. users 테이블의 last_login 필드 업데이트
        db.execute(text(
            """
            UPDATE users SET last_login = NOW() WHERE id = :user_id
            """), {'user_id': user.id})

        db.commit()

        # 4. 생성된 토큰 반환
        return BaseResponse.success_response(
            data=LoginResponse(
                access_token=session_token,
                user_id=str(user.id),
                username=user.username,
                expires_in=int((expires_at - datetime.utcnow()).total_seconds())
            ).dict(),
            message="로그인에 성공했습니다."
        )
            
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"로그인 처리 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="로그인 처리 중 오류가 발생했습니다."
        )

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """사용자 로그아웃"""
    token = credentials.credentials

    # 로그아웃 전에 사용자 정보 조회
    session = db.execute(text(
        """
        SELECT user_id FROM sessions WHERE session_token = :token
        """), {'token': token}).first()

    # 세션 테이블에서 토큰 삭제
    result = db.execute(text(
        """
        DELETE FROM sessions WHERE session_token = :token
        """), {'token': token})

    if result.rowcount > 0 and session:
        # 로그아웃 성공 기록
        db.execute(text(
            """
            INSERT INTO user_login_logs (user_id, ip_address, login_success, failure_reason, created_at)
            VALUES (:user_id, NULL, TRUE, '로그아웃', NOW())
            """), {'user_id': session.user_id})
        log_manager.logger.info(f"로그아웃 성공: 사용자 ID {session.user_id}")
    else:
        log_manager.logger.warning("로그아웃 시도: 유효하지 않은 토큰 또는 이미 만료된 토큰")

    db.commit()

    return BaseResponse.success_response(
        message="로그아웃되었습니다."
    )


@router.post("/update-status")
async def update_user_status(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """사용자 상태 업데이트 (1분 간격으로 호출)"""
    token = credentials.credentials

    try:
        # 세션에서 사용자 정보 조회
        session = db.execute(text(
            """
            SELECT user_id FROM sessions WHERE session_token = :token
            """), {'token': token}).first()

        if not session:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

        # 사용자의 last_login 시간 업데이트 (활성 상태 유지)
        db.execute(text(
            """
            UPDATE users SET last_login = NOW() WHERE id = :user_id
            """), {'user_id': session.user_id})

        db.commit()

        return BaseResponse.success_response(
            message="사용자 상태가 업데이트되었습니다."
        )

    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 상태 업데이트 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="사용자 상태 업데이트 중 오류가 발생했습니다."
        )

@router.get("/me")
async def get_current_user(current_user: dict = Depends(get_current_user_from_token)):
    """현재 사용자 정보 조회"""
    user_info = {
        "user_id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.username,
        "role": current_user.role
    }
    return BaseResponse.success_response(data=user_info)
