"""
인증 관련 모델 정의
로그인, 로그아웃 등의 인증 API 요청/응답 모델
"""
from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    """로그인 요청 모델"""
    username: str
    password: str
    remember_me: bool = False


class LoginResponse(BaseModel):
    """로그인 응답 모델"""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    expires_in: int = 3600


class LogoutRequest(BaseModel):
    """로그아웃 요청 모델 (토큰은 헤더에서 처리)"""
    pass


class LogoutResponse(BaseModel):
    """로그아웃 응답 모델"""
    message: str


class UserInfo(BaseModel):
    """사용자 정보 모델"""
    user_id: str
    username: str
    email: str
    full_name: str


class UserInfoResponse(BaseModel):
    """사용자 정보 응답 모델"""
    user_id: str
    username: str
    email: str
    full_name: str


class AuthError(BaseModel):
    """인증 오류 모델"""
    error: str
    message: str
    status_code: int
