"""
인증 관련 API 라우트
로그인, 로그아웃, 회원가입 등의 인증 기능을 담당
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import os
import sys

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

@router.post("/login")
async def login(request: LoginRequest):
    """사용자 로그인"""
    try:
        log_manager.logger.info(f"로그인 시도: {request.username}")
        
        # 간단한 인증 로직 (실제 환경에서는 데이터베이스와 연동 로직 추가 필요)
        if request.username == "root" and request.password == "1234":
            # 로그인 성공
            log_manager.logger.info(f"로그인 성공: {request.username}")
            
            return BaseResponse.success_response(
                data=LoginResponse(
                    access_token="demo_token_12345",
                    user_id="root_001",
                    username=request.username,
                    expires_in=3600
                ).dict(),
                message="로그인에 성공했습니다."
            )
        else:
            # 로그인 실패
            log_manager.logger.warning(f"로그인 실패: {request.username}")
            raise HTTPException(
                status_code=401,
                detail="사용자명 또는 비밀번호가 올바르지 않습니다."
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
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """사용자 로그아웃"""
    try:
        log_manager.logger.info("로그아웃 요청")
        
        # 토큰 무효화 로직 (실제 환경에서는 토큰 블랙리스트에 추가)
        return BaseResponse.success_response(
            message="로그아웃되었습니다."
        )
        
    except Exception as e:
        log_manager.logger.error(f"로그아웃 처리 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="로그아웃 처리 중 오류가 발생했습니다."
        )


@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """현재 사용자 정보 조회"""
    try:
        log_manager.logger.info("현재 사용자 정보 조회 요청")
        
        # 토큰 검증 로직 (실제 환경에서는 JWT 토큰 검증)
        if credentials.credentials == "demo_token_12345":
            user_info = UserInfoResponse(
                user_id="root_001",
                username="root",
                email="root@test.com",
                full_name="관리자"
            )
            return BaseResponse.success_response(data=user_info.dict())
        else:
            raise HTTPException(
                status_code=401,
                detail="유효하지 않은 토큰입니다."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 정보 조회 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="사용자 정보 조회 중 오류가 발생했습니다."
        )
