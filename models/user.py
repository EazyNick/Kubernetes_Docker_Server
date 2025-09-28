"""
유저 관련 데이터 모델
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

Base = declarative_base()

class User(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str
    role: str # admin, user, guest
    created_at: datetime
    updated_at: datetime
    status: str # active, inactive, banned

class LoginForm(BaseModel):
    username: str
    password: str