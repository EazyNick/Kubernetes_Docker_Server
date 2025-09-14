"""
모니터링 관련 데이터 모델
차트 데이터와 성능 메트릭을 정의
"""
from typing import List, Optional
from pydantic import BaseModel


class ChartDataset(BaseModel):
    """차트 데이터셋 모델"""
    label: str
    data: List[float]
    borderColor: str
    backgroundColor: str
    tension: float = 0.4
    borderWidth: Optional[int] = None


class LineChartData(BaseModel):
    """라인 차트 데이터 모델"""
    labels: List[str]
    datasets: List[ChartDataset]


class DoughnutChartData(BaseModel):
    """도넛 차트 데이터 모델"""
    labels: List[str]
    datasets: List[dict]  # 도넛 차트는 datasets 구조가 다름


class NetworkTrafficData(BaseModel):
    """네트워크 트래픽 데이터 모델"""
    labels: List[str]
    datasets: List[ChartDataset]


class DiskIoData(BaseModel):
    """디스크 I/O 데이터 모델"""
    labels: List[str]
    datasets: List[ChartDataset]


class ResponseTimeData(BaseModel):
    """응답 시간 데이터 모델"""
    labels: List[str]
    datasets: List[ChartDataset]


class RequestStatusData(BaseModel):
    """요청 상태 분포 데이터 모델"""
    labels: List[str]
    datasets: List[dict]


class MonitoringMetrics(BaseModel):
    """모니터링 메트릭 통합 모델"""
    networkTraffic: NetworkTrafficData
    diskIo: DiskIoData
    responseTime: ResponseTimeData
    requestStatus: RequestStatusData


class MonitoringResponse(BaseModel):
    """모니터링 API 응답 모델"""
    success: bool
    data: Optional[LineChartData] = None
    message: str
    error: Optional[str] = None


class NetworkTrafficResponse(BaseModel):
    """네트워크 트래픽 API 응답 모델"""
    success: bool
    data: Optional[NetworkTrafficData] = None
    message: str
    error: Optional[str] = None


class DiskIoResponse(BaseModel):
    """디스크 I/O API 응답 모델"""
    success: bool
    data: Optional[DiskIoData] = None
    message: str
    error: Optional[str] = None


class ResponseTimeResponse(BaseModel):
    """응답 시간 API 응답 모델"""
    success: bool
    data: Optional[ResponseTimeData] = None
    message: str
    error: Optional[str] = None


class RequestStatusResponse(BaseModel):
    """요청 상태 API 응답 모델"""
    success: bool
    data: Optional[RequestStatusData] = None
    message: str
    error: Optional[str] = None
