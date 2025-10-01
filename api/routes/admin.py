"""
관리자 관련 API 라우트
사용자 관리, 권한 관리 등의 관리자 기능을 담당
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from argon2 import PasswordHasher
import os
import sys
import uuid
from datetime import datetime

current_file = os.path.abspath(__file__) 
project_root = os.path.abspath(os.path.join(current_file, "..", ".."))
sys.path.append(project_root)

from logs import log_manager
from models.base_response import BaseResponse
from models.admin import (
    UserCreate, UserUpdate, UserDelete, User, UserList, 
    UserResponse, AdminStats
)
from db.database import get_db
from services.admin_service import AdminDatabaseService

# 라우터 생성
router = APIRouter(prefix="/api/admin", tags=["admin"])

# 보안 스키마
security = HTTPBearer()

async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """관리자 권한 확인 - 실제 데이터베이스 사용"""
    from api.routes.auth import get_current_user_from_token
    
    try:
        # 기존 인증 함수 사용
        current_user = await get_current_user_from_token(credentials, db)
        
        # 관리자 권한 확인
        if current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="관리자 권한이 필요합니다."
            )
        
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"관리자 권한 확인 중 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail="권한 확인 중 오류가 발생했습니다."
        )

@router.get("/stats", response_model=BaseResponse)
async def get_admin_stats(
    current_user: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """관리자 통계 조회"""
    try:
        log_manager.logger.info("관리자 통계 조회 요청")
        
        # 실제 데이터베이스에서 통계 조회
        admin_service = AdminDatabaseService(db)
        stats_data = admin_service.get_dashboard_stats()
        
        stats = AdminStats(
            total_users=stats_data.get("total_users", 0),
            active_users=stats_data.get("active_users", 0),
            admin_users=stats_data.get("admin_users", 0),
            recent_logins=stats_data.get("recent_logins", 0),
            new_users_today=stats_data.get("new_users_today", 0)
        )
        
        return BaseResponse.success_response(
            data=stats.dict(),
            message="관리자 통계를 성공적으로 조회했습니다."
        )
        
    except Exception as e:
        log_manager.logger.error(f"관리자 통계 조회 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="관리자 통계 조회 중 오류가 발생했습니다."
        )

@router.get("/users", response_model=BaseResponse)
async def get_users(
    page: int = 1,
    per_page: int = 10,
    search: str = None,
    current_user: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 목록 조회"""
    try:
        log_manager.logger.info(f"사용자 목록 조회 요청 - 페이지: {page}, 페이지당: {per_page}, 검색: {search}")
        
        # 실제 데이터베이스에서 사용자 목록 조회
        admin_service = AdminDatabaseService(db)
        users_data = admin_service.get_users_list(page, per_page, search)
        
        # UserResponse 객체로 변환
        user_list = []
        for user_data in users_data["users"]:
            # 날짜 필드 처리
            created_at = user_data["created_at"]
            if isinstance(created_at, str):
                created_at_str = created_at
            else:
                created_at_str = created_at.isoformat() if created_at else ""
            
            last_login = user_data["last_login"]
            if isinstance(last_login, str):
                last_login_str = last_login
            else:
                last_login_str = last_login.isoformat() if last_login else None
            
            user_response = UserResponse(
                user_id=str(user_data["user_id"]),
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                is_active=user_data["is_active"],
                created_at=created_at_str,
                last_login=last_login_str
            )
            user_list.append(user_response)
        
        user_list_response = UserList(
            users=user_list,
            total=users_data["total"],
            page=users_data["page"],
            per_page=users_data["per_page"]
        )
        
        return BaseResponse.success_response(
            data=user_list_response.dict(),
            message="사용자 목록을 성공적으로 조회했습니다."
        )
        
    except Exception as e:
        log_manager.logger.error(f"사용자 목록 조회 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="사용자 목록 조회 중 오류가 발생했습니다."
        )

@router.post("/users", response_model=BaseResponse)
async def create_user(
    user_data: UserCreate,
    request: Request,
    current_user: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 생성"""
    try:
        log_manager.logger.info(f"사용자 생성 요청: {user_data.username}")
        
        # 비밀번호 해시화
        ph = PasswordHasher()
        password_hash = ph.hash(user_data.password)
        
        # 실제 데이터베이스에 사용자 생성
        admin_service = AdminDatabaseService(db)
        success = admin_service.create_user(
            username=user_data.username,
            password_hash=password_hash,
            email=user_data.email,
            role=user_data.role
        )
        
        if not success:
            raise HTTPException(
                status_code=400,
                detail="이미 존재하는 사용자명입니다."
            )
        
        # 로그 시스템에서 관리자 작업 로그 처리
        
        log_manager.logger.info(f"사용자 생성 완료: {user_data.username}")
        
        return BaseResponse.success_response(
            data={"username": user_data.username},
            message="사용자가 성공적으로 생성되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 생성 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="사용자 생성 중 오류가 발생했습니다."
        )

@router.put("/users/{user_id}", response_model=BaseResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    request: Request,
    current_user: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 정보 수정"""
    try:
        log_manager.logger.info(f"사용자 정보 수정 요청: {user_id}")
        
        # 실제 데이터베이스에서 사용자 수정
        admin_service = AdminDatabaseService(db)
        
        # 수정할 데이터 준비
        update_data = {}
        if user_data.username is not None:
            update_data["username"] = user_data.username
        if user_data.email is not None:
            update_data["email"] = user_data.email
        if user_data.role is not None:
            update_data["role"] = user_data.role
        if user_data.is_active is not None:
            update_data["status"] = "active" if user_data.is_active else "inactive"
        
        success = admin_service.update_user(int(user_id), **update_data)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="사용자를 찾을 수 없습니다."
            )
        
        # 로그 시스템에서 관리자 작업 로그 처리
        
        log_manager.logger.info(f"사용자 정보 수정 완료: {user_id}")
        
        return BaseResponse.success_response(
            message="사용자 정보가 성공적으로 수정되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 정보 수정 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="사용자 정보 수정 중 오류가 발생했습니다."
        )

@router.delete("/users/{user_id}", response_model=BaseResponse)
async def delete_user(
    user_id: str,
    request: Request,
    current_user: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 삭제"""
    try:
        log_manager.logger.info(f"사용자 삭제 요청: {user_id}")
        
        # 실제 데이터베이스에서 사용자 삭제
        admin_service = AdminDatabaseService(db)
        success = admin_service.delete_user(int(user_id))
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="사용자를 찾을 수 없거나 삭제할 수 없습니다."
            )
        
        # 로그 시스템에서 관리자 작업 로그 처리
        
        log_manager.logger.info(f"사용자 삭제 완료: {user_id}")
        
        return BaseResponse.success_response(
            message="사용자가 성공적으로 삭제되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 삭제 중 오류 발생: {e}")
        raise HTTPException(
            status_code=500,
            detail="사용자 삭제 중 오류가 발생했습니다."
        )
