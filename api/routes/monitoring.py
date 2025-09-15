"""
모니터링 관련 API 라우트
차트 데이터와 성능 메트릭을 제공
"""
from fastapi import APIRouter
from models import (
    BaseResponse,
    NetworkTrafficData, DiskIoData, ResponseTimeData, RequestStatusData,
    NetworkTrafficResponse, DiskIoResponse, ResponseTimeResponse, RequestStatusResponse,
    ChartDataset
)
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


@router.get("/network-traffic", response_model=NetworkTrafficResponse)
async def get_network_traffic():
    """네트워크 트래픽 데이터 조회"""
    try:
        # 최근 24시간 데이터 생성
        labels = []
        rx_data = []
        tx_data = []
        
        for i in range(24):
            time = datetime.now() - timedelta(hours=23-i)
            labels.append(time.strftime("%H:%M"))
            rx_data.append(round(random.uniform(10, 100), 1))
            tx_data.append(round(random.uniform(5, 80), 1))
        
        data = NetworkTrafficData(
            labels=labels,
            datasets=[
                ChartDataset(
                    label="수신 (MB/s)",
                    data=rx_data,
                    borderColor="#4CAF50",
                    backgroundColor="rgba(76, 175, 80, 0.1)",
                    borderWidth=2,
                    pointRadius=4,
                    pointBackgroundColor="#4CAF50",
                    pointBorderColor="#4CAF50",
                    fill=False,
                    tension=0.4,
                    showLine=True
                ),
                ChartDataset(
                    label="송신 (MB/s)",
                    data=tx_data,
                    borderColor="#2196F3",
                    backgroundColor="rgba(33, 150, 243, 0.1)",
                    borderWidth=2,
                    pointRadius=4,
                    pointBackgroundColor="#2196F3",
                    pointBorderColor="#2196F3",
                    fill=False,
                    tension=0.4,
                    showLine=True
                )
            ]
        )
        
        return NetworkTrafficResponse(
            success=True,
            data=data,
            message="Network traffic data retrieved successfully"
        )
    except Exception as e:
        return NetworkTrafficResponse(
            success=False,
            data=None,
            message=f"Failed to retrieve network traffic data: {str(e)}"
        )


@router.get("/disk-io", response_model=DiskIoResponse)
async def get_disk_io():
    """디스크 I/O 데이터 조회"""
    try:
        # 최근 24시간 데이터 생성
        labels = []
        read_data = []
        write_data = []
        
        for i in range(24):
            time = datetime.now() - timedelta(hours=23-i)
            labels.append(time.strftime("%H:%M"))
            read_data.append(round(random.uniform(5, 50), 1))
            write_data.append(round(random.uniform(3, 30), 1))
        
        data = DiskIoData(
            labels=labels,
            datasets=[
                ChartDataset(
                    label="읽기 (MB/s)",
                    data=read_data,
                    borderColor="#FF9800",
                    backgroundColor="rgba(255, 152, 0, 0.1)",
                    tension=0.4
                ),
                ChartDataset(
                    label="쓰기 (MB/s)",
                    data=write_data,
                    borderColor="#9C27B0",
                    backgroundColor="rgba(156, 39, 176, 0.1)",
                    tension=0.4
                )
            ]
        )
        
        return DiskIoResponse(
            success=True,
            data=data,
            message="Disk I/O data retrieved successfully"
        )
    except Exception as e:
        return DiskIoResponse(
            success=False,
            data=None,
            message=f"Failed to retrieve disk I/O data: {str(e)}"
        )


@router.get("/response-time", response_model=ResponseTimeResponse)
async def get_response_time():
    """응답 시간 데이터 조회"""
    try:
        services = ['API Gateway', 'User Service', 'Order Service', 'Payment Service', 'Notification Service']
        labels = []
        
        # 시간 라벨 생성
        for i in range(24):
            time = datetime.now() - timedelta(hours=23-i)
            labels.append(time.strftime("%H:%M"))
        
        datasets = []
        colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        
        for i, service in enumerate(services):
            data = []
            for j in range(24):
                # 서비스별로 다른 응답시간 패턴 생성
                base_time = 50 + i * 20
                variation = random.uniform(-20, 30)
                data.append(round(max(10, base_time + variation), 1))
            
            datasets.append(ChartDataset(
                label=service,
                data=data,
                borderColor=colors[i % len(colors)],
                backgroundColor=colors[i % len(colors)].replace('rgb', 'rgba').replace(')', ', 0.1)'),
                tension=0.4
            ))
        
        data = ResponseTimeData(
            labels=labels,
            datasets=datasets
        )
        
        return ResponseTimeResponse(
            success=True,
            data=data,
            message="Response time data retrieved successfully"
        )
    except Exception as e:
        return ResponseTimeResponse(
            success=False,
            data=None,
            message=f"Failed to retrieve response time data: {str(e)}"
        )


@router.get("/request-status", response_model=RequestStatusResponse)
async def get_request_status():
    """요청 상태 분포 데이터 조회"""
    try:
        # 실제적인 HTTP 상태 코드 분포 시뮬레이션
        data = RequestStatusData(
            labels=["2xx", "3xx", "4xx", "5xx"],
            datasets=[{
                "data": [
                    random.randint(70, 85),  # 2xx 성공
                    random.randint(10, 20),  # 3xx 리다이렉트
                    random.randint(5, 12),   # 4xx 클라이언트 에러
                    random.randint(1, 5)     # 5xx 서버 에러
                ],
                "backgroundColor": [
                    "#4CAF50",  # 2xx - 성공 (녹색)
                    "#2196F3",  # 3xx - 리다이렉트 (파란색)
                    "#FF9800",  # 4xx - 클라이언트 에러 (주황색)
                    "#F44336"   # 5xx - 서버 에러 (빨간색)
                ],
                "borderWidth": 2,
                "borderColor": "#fff"
            }]
        )
        
        return RequestStatusResponse(
            success=True,
            data=data,
            message="Request status data retrieved successfully"
        )
    except Exception as e:
        return RequestStatusResponse(
            success=False,
            data=None,
            message=f"Failed to retrieve request status data: {str(e)}"
        )
