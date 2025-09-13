"""
컨테이너 관련 API 라우트
컨테이너 목록 및 관리 기능을 제공
"""
from fastapi import APIRouter
from models import (
    BaseResponse,
    Container,
    ContainerList,
    Pagination
)
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(prefix="/api", tags=["containers"])

@router.get("/containers", response_model=BaseResponse)
def get_containers(page: int = 1, per_page: int = 20):
    """컨테이너 목록 조회 (페이징 지원)"""
    try:
        # 실제 구현에서는 데이터베이스에서 페이징된 데이터를 가져옴
        containers = []
        total_containers = random.randint(100, 200)
        
        for i in range(min(per_page, total_containers - (page - 1) * per_page)):
            container_id = f"container-{(page - 1) * per_page + i + 1:03d}"
            containers.append(Container(
                id=container_id,
                name=f"app-{random.choice(['web', 'api', 'db', 'cache'])}-{(page - 1) * per_page + i + 1:02d}",
                image=f"{random.choice(['nginx', 'node', 'python', 'redis', 'postgres'])}:{random.choice(['latest', '1.21', '16-alpine', '7-alpine'])}",
                status=random.choice(["running", "stopped", "failed"]),
                cpu=round(random.uniform(0, 100), 1),
                memory=random.randint(50, 2000),
                uptime=f"{random.randint(1, 30)}d {random.randint(0, 23)}h",
                node=f"k8s-node-{random.randint(1, 3)}",
                created_at=(datetime.now() - timedelta(days=random.randint(1, 30))).isoformat() + "Z",
                restart_count=random.randint(0, 5)
            ))
        
        container_list = ContainerList(
            containers=containers,
            pagination=Pagination(
                page=page,
                per_page=per_page,
                total=total_containers,
                total_pages=(total_containers + per_page - 1) // per_page
            )
        )
        
        return BaseResponse.success_response(
            data=container_list.dict(),
            message="Containers retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve containers",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.get("/containers/{container_id}", response_model=BaseResponse)
def get_container(container_id: str):
    """특정 컨테이너 상세 정보 조회"""
    try:
        # 실제 구현에서는 데이터베이스에서 특정 컨테이너 정보를 가져옴
        container = Container(
            id=container_id,
            name=f"app-{random.choice(['web', 'api', 'db', 'cache'])}-001",
            image=f"{random.choice(['nginx', 'node', 'python', 'redis', 'postgres'])}:latest",
            status=random.choice(["running", "stopped", "failed"]),
            cpu=round(random.uniform(0, 100), 1),
            memory=random.randint(50, 2000),
            uptime=f"{random.randint(1, 30)}d {random.randint(0, 23)}h",
            node=f"k8s-node-{random.randint(1, 3)}",
            created_at=(datetime.now() - timedelta(days=random.randint(1, 30))).isoformat() + "Z",
            restart_count=random.randint(0, 5)
        )
        
        return BaseResponse.success_response(
            data=container.dict(),
            message="Container retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve container",
            error_code="DATABASE_ERROR",
            details=str(e)
        )
