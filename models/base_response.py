"""
공통 API 응답 구조를 위한 기본 클래스
"""
from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """에러 상세 정보"""
    code: str
    details: str


class BaseResponse(BaseModel):
    """모든 API 응답의 기본 구조"""
    success: bool
    data: Optional[Any] = None
    message: str
    timestamp: str
    error: Optional[ErrorDetail] = None

    @classmethod
    def success_response(cls, data: Any = None, message: str = "Success") -> "BaseResponse":
        """성공 응답 생성"""
        return cls(
            success=True,
            data=data,
            message=message,
            timestamp=datetime.now().isoformat() + "Z"
        )

    @classmethod
    def error_response(cls, message: str, error_code: str = "UNKNOWN_ERROR", details: str = "") -> "BaseResponse":
        """에러 응답 생성"""
        return cls(
            success=False,
            data=None,
            message=message,
            timestamp=datetime.now().isoformat() + "Z",
            error=ErrorDetail(code=error_code, details=details)
        )
