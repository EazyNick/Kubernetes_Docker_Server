
"""
유저 관련 데이터 모델
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum
from db.database import Base  # 수정: db.database에서 Base 임포트
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str
    role: str
    created_at: datetime
    updated_at: datetime
    status: str

class LoginForm(BaseModel):
    username: str
    password: str

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(100), nullable=True)  # << 추가
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'user', 'guest'), default='user')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)  # << 추가
    status = Column(Enum('active', 'inactive', 'banned'), default='active')

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "user"

class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    role: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None

class UserListPublic(BaseModel):
    users: List[UserPublic]
    total: int
    page: int
    per_page: int
