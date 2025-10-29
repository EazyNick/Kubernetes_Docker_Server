"""
관리자 관련 API 라우트
사용자 관리, 권한 관리 등의 관리자 기능을 담당
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from argon2 import PasswordHasher
import os
import sys
from datetime import datetime

# --- sys.path modification is an anti-pattern, but we'll leave it for now ---
current_file = os.path.abspath(__file__) 
project_root = os.path.abspath(os.path.join(current_file, "..", ".."))
sys.path.append(project_root)
# ---

from logs import log_manager
from models.base_response import BaseResponse
# Refactored imports
from models.admin import AdminStats
from models.user import UserCreate, UserUpdate, UserPublic, UserListPublic
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
        current_user = await get_current_user_from_token(credentials, db)
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="관리자 권한이 필요합니다.")
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"관리자 권한 확인 중 오류: {e}")
        raise HTTPException(status_code=500, detail="권한 확인 중 오류가 발생했습니다.")

@router.get("/stats", response_model=BaseResponse)
async def get_admin_stats(current_user: UserPublic = Depends(verify_admin_token), db: Session = Depends(get_db)):
    """관리자 통계 조회"""
    try:
        log_manager.logger.info("관리자 통계 조회 요청")
        admin_service = AdminDatabaseService(db)
        stats_data = admin_service.get_dashboard_stats()
        
        stats = AdminStats(**stats_data)
        
        return BaseResponse.success_response(data=stats.dict(), message="관리자 통계를 성공적으로 조회했습니다.")
    except Exception as e:
        log_manager.logger.error(f"관리자 통계 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="관리자 통계 조회 중 오류가 발생했습니다.")

@router.get("/users", response_model=BaseResponse)
async def get_users(
    page: int = 1,
    per_page: int = 10,
    search: str = None,
    current_user: UserPublic = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 목록 조회"""
    try:
        log_manager.logger.info(f"사용자 목록 조회 요청 - 페이지: {page}, 페이지당: {per_page}, 검색: {search}")
        admin_service = AdminDatabaseService(db)
        users_paginated = admin_service.get_users_list(page, per_page, search)
        
        # Convert DB objects to Pydantic models
        user_list = [UserPublic.from_orm(user) for user in users_paginated["users"]]
        
        user_list_response = UserListPublic(
            users=user_list,
            total=users_paginated["total"],
            page=users_paginated["page"],
            per_page=users_paginated["per_page"]
        )
        
        return BaseResponse.success_response(data=user_list_response.dict(), message="사용자 목록을 성공적으로 조회했습니다.")
    except Exception as e:
        log_manager.logger.error(f"사용자 목록 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="사용자 목록 조회 중 오류가 발생했습니다.")

@router.get("/users/{user_id}", response_model=BaseResponse)
async def get_user(
    user_id: int, # Changed to int to match DB
    current_user: UserPublic = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """개별 사용자 조회"""
    try:
        log_manager.logger.info(f"사용자 조회 요청: {user_id}")
        admin_service = AdminDatabaseService(db)
        user_db = admin_service.get_user_by_id(user_id)
        
        if not user_db:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        user_public = UserPublic.from_orm(user_db)
        
        return BaseResponse.success_response(data=user_public.dict(), message="사용자 정보를 성공적으로 조회했습니다.")
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 조회 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="사용자 조회 중 오류가 발생했습니다.")

@router.post("/users", response_model=BaseResponse)
async def create_user(
    user_data: UserCreate, # Using UserCreate from models.user
    current_user: UserPublic = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 생성"""
    try:
        log_manager.logger.info(f"사용자 생성 요청: {user_data.username}")
        ph = PasswordHasher()
        password_hash = ph.hash(user_data.password)
        
        admin_service = AdminDatabaseService(db)
        # Assuming create_user service takes these params. No is_active anymore.
        success = admin_service.create_user(
            username=user_data.username,
            password_hash=password_hash,
            email=user_data.email,
            role=user_data.role,
            status='active' # New users are active by default
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="이미 존재하는 사용자명 또는 이메일입니다.")
        
        log_manager.logger.info(f"사용자 생성 완료: {user_data.username}")
        return BaseResponse.success_response(data={"username": user_data.username}, message="사용자가 성공적으로 생성되었습니다.")
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 생성 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="사용자 생성 중 오류가 발생했습니다.")

@router.put("/users/{user_id}", response_model=BaseResponse)
async def update_user(
    user_id: int, # Changed to int
    user_data: UserUpdate, # Using UserUpdate from models.user
    current_user: UserPublic = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 정보 수정"""
    try:
        log_manager.logger.info(f"사용자 정보 수정 요청: {user_id}")
        admin_service = AdminDatabaseService(db)
        
        # Get update data, excluding unset fields
        update_data = user_data.dict(exclude_unset=True)
        
        if not update_data:
             raise HTTPException(status_code=400, detail="수정할 내용이 없습니다.")

        success = admin_service.update_user(user_id, **update_data)
        
        if not success:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        log_manager.logger.info(f"사용자 정보 수정 완료: {user_id}")
        return BaseResponse.success_response(message="사용자 정보가 성공적으로 수정되었습니다.")
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 정보 수정 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="사용자 정보 수정 중 오류가 발생했습니다.")

@router.delete("/users/{user_id}", response_model=BaseResponse)
async def delete_user(
    user_id: int, # Changed to int
    current_user: UserPublic = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """사용자 삭제"""
    try:
        log_manager.logger.info(f"사용자 삭제 요청: {user_id}")
        admin_service = AdminDatabaseService(db)
        success = admin_service.delete_user(user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없거나 삭제할 수 없습니다.")
        
        log_manager.logger.info(f"사용자 삭제 완료: {user_id}")
        return BaseResponse.success_response(message="사용자가 성공적으로 삭제되었습니다.")
    except HTTPException:
        raise
    except Exception as e:
        log_manager.logger.error(f"사용자 삭제 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail="사용자 삭제 중 오류가 발생했습니다.")