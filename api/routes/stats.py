"""
통계 관련 API 라우트
홈 페이지와 대시보드의 통계 데이터를 제공
"""
from fastapi import APIRouter
from models import (
    BaseResponse,
    OverviewStats,
    DashboardStats,
    ContainerStats,
    NodeStats,
    ResourceStats
)
import random

# 라우터 생성
router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/overview", response_model=BaseResponse)
def get_overview_stats():
    """홈 페이지 개요 통계"""
    try:
        # 실제 구현에서는 데이터베이스에서 데이터를 가져옴
        overview_data = OverviewStats(
            total_containers=random.randint(140, 160),
            running_containers=random.randint(130, 150),
            active_nodes=random.randint(10, 12),
            healthy_nodes=random.randint(9, 11),
            system_health=round(random.uniform(95, 100), 1),
            uptime=round(random.uniform(99.5, 100), 1),
            warning_alerts=random.randint(2, 5),
            critical_alerts=random.randint(0, 3)
            critical_alerts=random.randint(0, 3),
            # 변화량 데이터
            total_containers_change=f"+{random.randint(0, 5)}%",
            running_containers_change=f"+{random.randint(0, 3)}%",
            active_nodes_change="+0%",
            healthy_nodes_change=f"+{random.randint(0, 2)}%",
            system_health_change=f"{random.choice(['+', '-'])}{random.uniform(0.1, 0.5):.1f}%",
            uptime_change=f"+{random.uniform(0.0, 0.1):.1f}%",
            warning_alerts_change=f"{random.choice(['+', '-'])}{random.randint(0, 2)}%",
            critical_alerts_change=f"{random.choice(['+', '-'])}{random.randint(0, 1)}%"
        )
        return BaseResponse.success_response(
            data=overview_data.dict(),
            message="Overview stats retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve overview stats",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.get("/dashboard", response_model=BaseResponse)
def get_dashboard_stats():
    """대시보드 통계"""
    try:
        dashboard_data = DashboardStats(
            containers=ContainerStats(
                total=random.randint(140, 160),
                running=random.randint(130, 150),
                stopped=random.randint(5, 10),
                failed=random.randint(2, 8)
                failed=random.randint(2, 8),
                # 변화량 데이터
                total_change=f"+{random.randint(0, 5)}%",
                running_change=f"+{random.randint(0, 3)}%",
                stopped_change=f"{random.choice(['+', '-'])}{random.randint(0, 2)}%",
                failed_change=f"{random.choice(['+', '-'])}{random.randint(0, 1)}%"
            ),
            nodes=NodeStats(
                total=random.randint(10, 12),
                healthy=random.randint(9, 11),
                warning=random.randint(0, 2)
                warning=random.randint(0, 2),
                # 변화량 데이터
                total_change="+0%",
                healthy_change=f"+{random.randint(0, 2)}%",
                warning_change=f"{random.choice(['+', '-'])}{random.randint(0, 1)}%"
            ),
            resources=ResourceStats(
                avg_cpu=round(random.uniform(25, 45), 1),
                avg_memory=round(random.uniform(60, 80), 1),
                network_traffic=random.randint(100, 200)
                network_traffic=random.randint(100, 200),
                # 변화량 데이터
                avg_cpu_change=f"{random.choice(['+', '-'])}{random.uniform(0.5, 3.0):.1f}%",
                avg_memory_change=f"{random.choice(['+', '-'])}{random.uniform(0.5, 2.0):.1f}%",
                network_traffic_change=f"+{random.randint(0, 10)}%"
            )
        )
        return BaseResponse.success_response(
            data=dashboard_data.dict(),
            message="Dashboard stats retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve dashboard stats",
            error_code="DATABASE_ERROR",
            details=str(e)
        )
