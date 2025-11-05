"""
관리자 페이지 관련 모델 정의
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class AdminStats(BaseModel):
    """관리자 통계 모델"""
    total_users: int
    active_users: int
    admin_users: int
    recent_logins: int
    new_users_today: int