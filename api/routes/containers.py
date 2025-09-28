"""
컨테이너 관련 API 라우트
컨테이너 목록 및 관리 기능을 제공
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.database import get_db
from api.routes.auth import get_current_user_from_token

from models import (
    BaseResponse,
    Container,
    ContainerList,
    Pagination,
    MemoryInfo,
    NetworkInfo
)
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(
    prefix="/api",
    tags=["containers"],
    dependencies=[Depends(get_current_user_from_token)]
)

@router.get("/containers", response_model=BaseResponse)
def get_containers(page: int = 1, per_page: int = 20, db: Session = Depends(get_db)):
    """컨테이너 목록 조회 (페이징 지원)"""
    try:
        #1. offset 계산
        offset = (page - 1) * per_page
        #2. 실제 DB에서 데이터 가져오기 
        query = text("""
            SELECT id, container_name, image, status, cpu_percentage,
            memory_used_mb, memory_total_mb, memory_percent,
            network_rx_bps, network_tx_bps,
            node_name, uptime_text, restart_count, created_at
            FROM containers
            LIMIT :limit OFFSET :offset
        """)
        rows = db.execute(query, {"limit": per_page, "offset": offset}).fetchall()

        #3. 전체 개수 (페이징 계산용)
        total_query = text("SELECT COUNT(*) FROM containers")
        #total_containers = random.randint(100, 200)
        total_containers = db.execute(total_query).scalar()

        #4. DB 결과 : Pydantic 모델로 변환
        containers = []
        for row in rows:
            containers.append(Container(
            id=str(row.id),
            name=row.container_name,
            image=row.image,
            status=row.status,
            cpu=row.cpu_percentage,
            memory=MemoryInfo(
                used=row.memory_used_mb,
                total=row.memory_total_mb,
                usage=row.memory_percent
            ),
            network=NetworkInfo(
                rx=row.network_rx_bps or 0,
                tx=row.network_tx_bps or 0 
            ),
            uptime=row.uptime_text,
            node=row.node_name,
            created_at=row.created_at.isoformat(),
            restart_count=row.restart_count
        ))

        
        #5. 페이징 정보 포함해서 응답
       
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
def get_container(container_id: str, db : Session = Depends(get_db)):
    """특정 컨테이너 상세 정보 조회"""
    try:
        #1. 단일 컨테이너 조회 쿼리
        query = text("""
            SELECT id, container_name, image, status, cpu_percentage,
                   memory_used_mb, memory_total_mb, memory_percent,
                   network_rx_bps, network_tx_bps,
                   node_name, uptime_text, restart_count, created_at
            FROM containers
            WHERE id = :container_id
        """)
        row = db.execute(query, {"container_id": container_id}).fetchone()

        #2. 조회 결과 없으면 에러 
        if not row:
            return BaseResponse.error_response(
                message=f"Container {container_id} not found",
                error_code="NOT_FOUND"
            )
        
        #3. 결과 : Pydantic 모델로 매핑
        container = Container(
            id=str(row.id),
            name= row.container_name,
            image=row.image,
            status=row.status,
            cpu=row.cpu_percentage,
            memory=MemoryInfo(
                used = row.memory_used_mb,
                total = row.memory_total_mb,
                usage = row.memory_percent
            ),
            network = NetworkInfo(
                rx = row.network_rx_bps or 0,
                tx = row.network_tx_bps or 0
            ),
            uptime=row.uptime_text or "N/A",
            node=row.node_name,
            created_at= row.created_at.isoformat(),
            restart_count = row.restart_count
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
