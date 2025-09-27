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
import os
import sys

current_file = os.path.abspath(__file__) 
project_root = os.path.abspath(os.path.join(current_file, "..", ".."))
sys.path.append(project_root)

try:
    from logs import log_manager
except Exception as e:
    print(f"임포트 실패: {e}")
    # log_manager가 없을 때를 위한 더미 클래스
    class DummyLogManager:
        class Logger:
            def info(self, msg): print(f"INFO: {msg}")
            def error(self, msg): print(f"ERROR: {msg}")
            def warning(self, msg): print(f"WARNING: {msg}")
        logger = Logger()
    log_manager = DummyLogManager()

# 라우터 생성
router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/overview", response_model=BaseResponse)
def get_overview_stats():
    """홈 페이지 개요 통계"""
    try:
        log_manager.logger.info("📊 홈 페이지 개요 통계 API 요청")
        # 실제 구현에서는 데이터베이스에서 데이터를 가져옴
        overview_data = OverviewStats(
            total_containers=random.randint(140, 160),
            running_containers=random.randint(130, 150),
            active_nodes=random.randint(10, 12),
            healthy_nodes=random.randint(9, 11),
            system_health=round(random.uniform(95, 100), 1),
            uptime=round(random.uniform(99.5, 100), 1),
            warning_alerts=random.randint(2, 5),
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
        log_manager.logger.info("📊 홈 페이지 개요 통계 데이터 생성 완료")
        response = BaseResponse.success_response(
            data=overview_data.dict(),
            message="Overview stats retrieved successfully"
        )
        log_manager.logger.info("📊 홈 페이지 개요 통계 API 응답 완료")
        return response
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
        log_manager.logger.info("📊 대시보드 통계 API 요청")
        dashboard_data = DashboardStats(
            containers=ContainerStats(
                total=random.randint(140, 160),
                running=random.randint(130, 150),
                stopped=random.randint(5, 10),
                failed=random.randint(2, 8),
                # 변화량 데이터 (0%도 포함하여 테스트)
                total_change=random.choice([f"+{random.randint(0, 5)}%", "0%"]),
                running_change=random.choice([f"+{random.randint(0, 3)}%", "0%"]),
                stopped_change=random.choice([f"{random.choice(['+', '-'])}{random.randint(0, 2)}%", "0%"]),
                failed_change=random.choice([f"{random.choice(['+', '-'])}{random.randint(0, 1)}%", "0%"])
            ),
            nodes=NodeStats(
                total=random.randint(10, 12),
                healthy=random.randint(9, 11),
                warning=random.randint(0, 2),
                # 변화량 데이터 (0%도 포함하여 테스트)
                total_change="0%",
                healthy_change=random.choice([f"+{random.randint(0, 2)}%", "0%"]),
                warning_change=random.choice([f"{random.choice(['+', '-'])}{random.randint(0, 1)}%", "0%"])
            ),
            resources=ResourceStats(
                avg_cpu=round(random.uniform(25, 45), 1),
                avg_memory=round(random.uniform(60, 80), 1),
                network_traffic=random.randint(100, 200),
                # 변화량 데이터 (0%도 포함하여 테스트)
                avg_cpu_change=random.choice([f"{random.choice(['+', '-'])}{random.uniform(0.5, 3.0):.1f}%", "0%"]),
                avg_memory_change=random.choice([f"{random.choice(['+', '-'])}{random.uniform(0.5, 2.0):.1f}%", "0%"]),
                network_traffic_change=random.choice([f"+{random.randint(0, 10)}%", "0%"])
            )
        )
        log_manager.logger.info("📊 대시보드 통계 데이터 생성 완료")
        response = BaseResponse.success_response(
            data=dashboard_data.dict(),
            message="Dashboard stats retrieved successfully"
        )
        log_manager.logger.info("📊 대시보드 통계 API 응답 완료")
        return response
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve dashboard stats",
            error_code="DATABASE_ERROR",
            details=str(e)
        )
