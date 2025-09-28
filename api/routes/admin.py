"""
관리자 관련 API 라우트
사용자 관리, 권한 관리 등의 관리자 기능을 담당
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
import sys
import uuid
from datetime import datetime

current_file = os.path.abspath(__file__) 
project_root = os.path.abspath(os.path.join(current_file, "..", ".."))
sys.path.append(project_root)

try:
    from logs.logger import LogManager
    from models.base_response import BaseResponse
    from models.admin import (
        UserCreate, UserUpdate, UserDelete, User, UserList, 
        UserResponse, AdminStats
    )
    log_manager = LogManager()
except Exception as e:
    print(f"임포트 실패: {e}")
    # log_manager가 없을 때를 위한 더미 클래스
    class DummyLogManager:
        class Logger:
            def info(self, msg): print(f"INFO: {msg}")
            def error(self, msg): print(f"ERROR: {msg}")
            def warning(self, msg): print(f"WARNING: {msg}")
        logger = Logger()
    log_manager = DummyLogManager()

# 라우터 생성
router = APIRouter(prefix="/api/admin", tags=["admin"])

# 보안 스키마
security = HTTPBearer()

# 사용자 데이터베이스 (실제 환경에서는 데이터베이스 사용)
users_db = {
    "root": {
        "user_id": "root_001",
        "username": "root",
        "password": "1234",
        "email": "root@test.com",
        "full_name": "관리자",
        "role": "admin",
        "is_active": True,
        "created_at": datetime.now(),
        "last_login": None
    }
}

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """관리자 권한 확인"""
    if credentials.credentials != "demo_token_12345":
        raise HTTPException(
            status_code=401,
            detail="관리자 권한이 필요합니다."
        )
    return credentials

@router.get("/stats", response_model=BaseResponse)
async def get_admin_stats(credentials: HTTPAuthorizationCredentials = Depends(verify_admin_token)):
    """관리자 통계 조회"""
    try:
        log_manager.logger.info("관리자 통계 조회 요청")
        
        total_users = len(users_db)
        active_users = len([u for u in users_db.values() if u["is_active"]])
        admin_users = len([u for u in users_db.values() if u["role"] == "admin"])
        
        stats = AdminStats(
            total_users=total_users,
            active_users=active_users,
            admin_users=admin_users,
            recent_logins=active_users,  # 간단한 구현
            new_users_today=0  # 간단한 구현
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
    credentials: HTTPAuthorizationCredentials = Depends(verify_admin_token)
):
    """사용자 목록 조회"""
    try:
        log_manager.logger.info(f"사용자 목록 조회 요청 - 페이지: {page}, 페이지당: {per_page}")
        
        # 페이지네이션 계산
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        
        # 사용자 목록 변환
        user_list = []
        for user_data in list(users_db.values())[start_idx:end_idx]:
            user_response = UserResponse(
                user_id=user_data["user_id"],
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                is_active=user_data["is_active"],
                created_at=user_data["created_at"].isoformat(),
                last_login=user_data["last_login"].isoformat() if user_data["last_login"] else None
            )
            user_list.append(user_response)
        
        user_list_response = UserList(
            users=user_list,
            total=len(users_db),
            page=page,
            per_page=per_page
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
    credentials: HTTPAuthorizationCredentials = Depends(verify_admin_token)
):
    """사용자 생성"""
    try:
        log_manager.logger.info(f"사용자 생성 요청: {user_data.username}")
        
        # 사용자명 중복 확인
        if user_data.username in users_db:
            raise HTTPException(
                status_code=400,
                detail="이미 존재하는 사용자명입니다."
            )
        
        # 새 사용자 생성
        user_id = str(uuid.uuid4())
        new_user = {
            "user_id": user_id,
            "username": user_data.username,
            "password": user_data.password,  # 실제 환경에서는 해시화 필요
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "is_active": True,
            "created_at": datetime.now(),
            "last_login": None
        }
        
        users_db[user_data.username] = new_user
        
        log_manager.logger.info(f"사용자 생성 완료: {user_data.username}")
        
        return BaseResponse.success_response(
            data={"user_id": user_id},
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
    credentials: HTTPAuthorizationCredentials = Depends(verify_admin_token)
):
    """사용자 정보 수정"""
    try:
        log_manager.logger.info(f"사용자 정보 수정 요청: {user_id}")
        
        # 사용자 찾기
        user = None
        for username, user_info in users_db.items():
            if user_info["user_id"] == user_id:
                user = user_info
                break
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="사용자를 찾을 수 없습니다."
            )
        
        # 정보 업데이트
        if user_data.username is not None:
            # 사용자명 변경 시 중복 확인
            if user_data.username != user["username"] and user_data.username in users_db:
                raise HTTPException(
                    status_code=400,
                    detail="이미 존재하는 사용자명입니다."
                )
            user["username"] = user_data.username
        
        if user_data.email is not None:
            user["email"] = user_data.email
        if user_data.full_name is not None:
            user["full_name"] = user_data.full_name
        if user_data.role is not None:
            user["role"] = user_data.role
        if user_data.is_active is not None:
            user["is_active"] = user_data.is_active
        
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
    credentials: HTTPAuthorizationCredentials = Depends(verify_admin_token)
):
    """사용자 삭제"""
    try:
        log_manager.logger.info(f"사용자 삭제 요청: {user_id}")
        
        # 사용자 찾기
        user_to_delete = None
        username_to_delete = None
        for username, user_info in users_db.items():
            if user_info["user_id"] == user_id:
                user_to_delete = user_info
                username_to_delete = username
                break
        
        if not user_to_delete:
            raise HTTPException(
                status_code=404,
                detail="사용자를 찾을 수 없습니다."
            )
        
        # root 사용자는 삭제 불가
        if user_to_delete["role"] == "admin" and user_to_delete["username"] == "root":
            raise HTTPException(
                status_code=400,
                detail="root 관리자는 삭제할 수 없습니다."
            )
        
        # 사용자 삭제
        del users_db[username_to_delete]
        
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
