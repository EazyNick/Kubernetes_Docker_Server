from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LogEntry(BaseModel):
    """로그 엔트리 모델"""
    id: str
    level: str  # info, warn, error, debug
    message: str
    source: str  # 컨테이너명 또는 서비스명
    namespace: Optional[str] = None
    pod_name: Optional[str] = None
    container_name: Optional[str] = None
    timestamp: str


class LogStats(BaseModel):
    """로그 통계 모델"""
    total_logs: int
    info_count: int
    warn_count: int
    error_count: int
    debug_count: int
    time_range: str


class LogResponse(BaseModel):
    """로그 응답 모델"""
    success: bool
    message: str
    data: Optional[dict] = None


class LogListResponse(LogResponse):
    """로그 목록 응답 모델"""
    data: dict = {
        "logs": List[LogEntry],
        "stats": LogStats,
        "pagination": dict
    }


class LogStatsResponse(LogResponse):
    """로그 통계 응답 모델"""
    data: LogStats
