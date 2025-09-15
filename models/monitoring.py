"""
모니터링 관련 데이터 모델
차트 데이터와 성능 메트릭을 정의
"""
from typing import List, Optional
from pydantic import BaseModel


class ChartDataset(BaseModel):
    """Chart.js 라인 차트 데이터셋 모델"""
    label: str  # 데이터셋의 이름 (예: "수신 (MB/s)", "송신 (MB/s)")
    data: List[float]  # 실제 데이터 값들의 배열 (예: [10.5, 20.3, 15.7, ...])
    borderColor: str  # 선의 색상 (예: "#4CAF50", "#2196F3")
    backgroundColor: str  # 채우기 영역의 색상 (예: "rgba(76, 175, 80, 0.1)")
    tension: float = 0.4  # 선의 곡선 정도 (0.0=직선, 1.0=매우 곡선)
    borderWidth: Optional[int] = None  # 선의 두께 (픽셀 단위, 기본값: 2)
    pointRadius: Optional[int] = None  # 데이터 포인트의 크기 (픽셀 단위, 기본값: 4)
    pointBackgroundColor: Optional[str] = None  # 포인트의 배경색 (기본값: borderColor와 동일)
    pointBorderColor: Optional[str] = None  # 포인트의 테두리색 (기본값: borderColor와 동일)
    fill: Optional[bool] = None  # 선 아래 영역을 채울지 여부 (기본값: false)
    showLine: Optional[bool] = None  # 선을 표시할지 여부 (기본값: true, false면 점만 표시)


class LineChartData(BaseModel):
    """일반적인 라인 차트 데이터 모델"""
    labels: List[str]  # X축 라벨들 (예: ["00:00", "01:00", "02:00", ...])
    datasets: List[ChartDataset]  # 차트에 표시될 데이터셋들의 배열


class DoughnutChartData(BaseModel):
    """도넛 차트 데이터 모델 (파이 차트의 변형)"""
    labels: List[str]  # 각 섹션의 라벨들 (예: ["2xx", "3xx", "4xx", "5xx"])
    datasets: List[dict]  # 도넛 차트는 datasets 구조가 다름 (data, backgroundColor, borderColor 등)


class NetworkTrafficData(BaseModel):
    """네트워크 트래픽 모니터링 데이터 모델"""
    labels: List[str]  # 시간 라벨들 (예: ["22:00", "23:00", "00:00", ...])
    datasets: List[ChartDataset]  # 수신/송신 데이터셋 (예: [수신(MB/s), 송신(MB/s)])


class DiskIoData(BaseModel):
    """디스크 I/O 모니터링 데이터 모델"""
    labels: List[str]  # 시간 라벨들 (예: ["22:00", "23:00", "00:00", ...])
    datasets: List[ChartDataset]  # 읽기/쓰기 데이터셋 (예: [읽기(MB/s), 쓰기(MB/s)])


class ResponseTimeData(BaseModel):
    """서비스 응답 시간 모니터링 데이터 모델"""
    labels: List[str]  # 시간 라벨들 (예: ["22:00", "23:00", "00:00", ...])
    datasets: List[ChartDataset]  # 각 서비스별 응답시간 데이터셋 (예: [API Gateway, User Service, ...])


class RequestStatusData(BaseModel):
    """HTTP 요청 상태 코드 분포 데이터 모델"""
    labels: List[str]  # 상태 코드 그룹 라벨들 (예: ["2xx", "3xx", "4xx", "5xx"])
    datasets: List[dict]  # 상태별 요청 수 데이터 (data, backgroundColor, borderColor 포함)


class MonitoringMetrics(BaseModel):
    """모든 모니터링 메트릭을 통합한 모델"""
    networkTraffic: NetworkTrafficData  # 네트워크 트래픽 데이터
    diskIo: DiskIoData  # 디스크 I/O 데이터
    responseTime: ResponseTimeData  # 응답 시간 데이터
    requestStatus: RequestStatusData  # 요청 상태 분포 데이터


class MonitoringResponse(BaseModel):
    """일반적인 모니터링 API 응답 모델"""
    success: bool  # API 호출 성공 여부 (true/false)
    data: Optional[LineChartData] = None  # 실제 차트 데이터 (실패 시 null)
    message: str  # 응답 메시지 (예: "데이터 조회 성공", "오류 발생")
    error: Optional[str] = None  # 에러 상세 정보 (성공 시 null)


class NetworkTrafficResponse(BaseModel):
    """네트워크 트래픽 API 응답 모델"""
    success: bool  # API 호출 성공 여부 (true/false)
    data: Optional[NetworkTrafficData] = None  # 네트워크 트래픽 차트 데이터 (실패 시 null)
    message: str  # 응답 메시지 (예: "Network traffic data retrieved successfully")
    error: Optional[str] = None  # 에러 상세 정보 (성공 시 null)


class DiskIoResponse(BaseModel):
    """디스크 I/O API 응답 모델"""
    success: bool  # API 호출 성공 여부 (true/false)
    data: Optional[DiskIoData] = None  # 디스크 I/O 차트 데이터 (실패 시 null)
    message: str  # 응답 메시지 (예: "Disk I/O data retrieved successfully")
    error: Optional[str] = None  # 에러 상세 정보 (성공 시 null)


class ResponseTimeResponse(BaseModel):
    """응답 시간 API 응답 모델"""
    success: bool  # API 호출 성공 여부 (true/false)
    data: Optional[ResponseTimeData] = None  # 응답 시간 차트 데이터 (실패 시 null)
    message: str  # 응답 메시지 (예: "Response time data retrieved successfully")
    error: Optional[str] = None  # 에러 상세 정보 (성공 시 null)


class RequestStatusResponse(BaseModel):
    """요청 상태 분포 API 응답 모델"""
    success: bool  # API 호출 성공 여부 (true/false)
    data: Optional[RequestStatusData] = None  # 요청 상태 분포 차트 데이터 (실패 시 null)
    message: str  # 응답 메시지 (예: "Request status data retrieved successfully")
    error: Optional[str] = None  # 에러 상세 정보 (성공 시 null)
