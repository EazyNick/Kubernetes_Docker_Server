"""
관리자 페이지 관련 모델 정의
사용자 관리, 권한 관리 등의 관리자 기능 모델
TODO: db에 맞춰 수정
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    """사용자 생성 요청 모델"""
    username: str
    password: str
    email: str
    role: str = "user"  # user, admin, guest
    is_active: bool = True  # 활성 상태


class UserUpdate(BaseModel):
    """사용자 정보 수정 요청 모델"""
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserDelete(BaseModel):
    """사용자 삭제 요청 모델"""
    user_id: str


class User(BaseModel):
    """사용자 정보 모델"""
    user_id: str
    username: str
    email: str
    full_name: str  # username을 full_name으로 사용
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class UserResponse(BaseModel):
    """사용자 정보 응답 모델"""
    user_id: str
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: str
    last_login: Optional[str] = None


class UserList(BaseModel):
    """사용자 목록 응답 모델"""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int


class AdminStats(BaseModel):
    """관리자 통계 모델"""
    total_users: int
    active_users: int
    admin_users: int
    recent_logins: int
    new_users_today: int
