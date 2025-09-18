"""
공통 API 응답 구조를 위한 기본 클래스
"""
from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """에러 상세 정보 모델"""
    code: str  # 에러 코드 (예: "VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR", "UNAUTHORIZED")
    details: str  # 에러 상세 설명 (예: "Required field 'name' is missing", "User with ID 123 not found")


class BaseResponse(BaseModel):
    """모든 API 응답의 기본 구조 (표준화된 응답 형식)"""
    success: bool  # API 호출 성공 여부 (true=성공, false=실패)
    data: Optional[Any] = None  # 실제 응답 데이터 (성공 시 데이터, 실패 시 None)
    message: str  # 응답 메시지 (예: "데이터 조회 성공", "유효하지 않은 요청", "서버 내부 오류")
    timestamp: str  # 응답 생성 시간 (ISO 8601 형식, 예: "2024-01-15T09:30:00Z")
    error: Optional[ErrorDetail] = None  # 에러 상세 정보 (성공 시 None, 실패 시 ErrorDetail 객체)

    @classmethod
    def success_response(cls, data: Any = None, message: str = "Success") -> "BaseResponse":
        """
        성공 응답 생성 헬퍼 메서드
        
        Args:
            data: 응답할 데이터 (선택사항, 기본값: None)
            message: 성공 메시지 (기본값: "Success")
            
        Returns:
            BaseResponse: success=True로 설정된 응답 객체
            
        Example:
            BaseResponse.success_response(
                data={"users": [...]}, 
                message="사용자 목록 조회 성공"
            )
        """
        return cls(
            success=True,
            data=data,
            message=message,
            timestamp=datetime.now().isoformat() + "Z"
        )

    @classmethod
    def error_response(cls, message: str, error_code: str = "UNKNOWN_ERROR", details: str = "") -> "BaseResponse":
        """
        에러 응답 생성 헬퍼 메서드
        
        Args:
            message: 에러 메시지 (사용자에게 표시될 메시지)
            error_code: 에러 코드 (기본값: "UNKNOWN_ERROR")
            details: 에러 상세 정보 (개발자용 디버깅 정보, 기본값: "")
            
        Returns:
            BaseResponse: success=False로 설정된 응답 객체
            
        Example:
            BaseResponse.error_response(
                message="사용자를 찾을 수 없습니다",
                error_code="USER_NOT_FOUND",
                details="User with ID 123 does not exist in database"
            )
        """
        return cls(
            success=False,
            data=None,
            message=message,
            timestamp=datetime.now().isoformat() + "Z",
            error=ErrorDetail(code=error_code, details=details)
        )
