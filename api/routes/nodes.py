"""
노드 관련 API 라우트
클러스터 노드 정보 및 관리 기능을 제공
"""
from fastapi import APIRouter, Depends
from models import (
    BaseResponse,
    Node,
    NodeList,
    NodePageStats
)
from sqlalchemy import text
from sqlalchemy.orm import Session
from db.database import get_db
from models import BaseResponse, Node, NodeList
from models.node import ResourceUsage, MemoryInfo, DiskInfo
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(prefix="/api", tags=["nodes"])

@router.get("/nodes", response_model=BaseResponse)
def get_nodes(db: Session = Depends(get_db)):
    """노드 목록 조회"""
    try:
        rows = db.execute(text(
            """ 
            SELECT n.id, n.node_name,n.ip,n.role,n.status,n.total_cores,
                n.total_memory,n.total_disk,n.created_at,n.updated_at,m.cpu_usage,
                m.memory_usage, m.disk_usage, m.containers, m.collected_at
            FROM nodes n
            LEFT JOIN metrics m 
            ON n.id = m.node_id
            AND m.collected_at = (
                SELECT MAX(m2.collected_at)
                FROM metrics m2
                WHERE m2.node_id = n.id
                )
            LIMIT 50
            """)).fetchall()

        nodes = []
        for row in rows:
            nodes.append(Node(
                name=row.node_name,
                ip=row.ip if row.ip else "N/A",
                role=row.role,
                status=row.status,
                cpu=ResourceUsage(
                    cores=row.total_cores if row.total_cores else 0,
                    usage=row.cpu_usage if row.cpu_usage else 0.0
                ),
                memory=MemoryInfo(
                    total=row.total_memory if row.total_memory else 0,
                    usage=row.memory_usage if row.memory_usage else 0.0
                ),
                disk=DiskInfo(
                    total=row.total_disk if row.total_disk else 0,
                    usage=row.disk_usage if row.disk_usage else 0.0
                ),
                containers=row.containers if row.containers else 0,
                uptime="N/A",  # 추후 구현
                last_heartbeat=(row.collected_at.isoformat() + "Z") if row.collected_at else row.updated_at.isoformat() + "Z"
            ))

        return BaseResponse.success_response(
            data=NodeList(nodes=nodes).dict(),
            message="Nodes retrieved successfully"
        )

    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve nodes",
            error_code="DATABASE_ERROR",
            details=str(e)
        )

@router.get("/nodes/stats", response_model=BaseResponse)
def get_node_stats():
    """노드 페이지 통계"""
    try:
        # TODO: 백엔드 개발자 구현 필요
        # 1. 데이터베이스에서 노드 상태별 집계 (nodes 테이블) OK
        # 2. 데이터베이스에서 노드 리소스 사용률 평균 계산 (metrics 테이블)
        # 3. 데이터베이스에서 이전 시점과의 변화량 계산 (metrics_history 테이블)
        
        # 현재는 랜덤 데이터로 시뮬레이션
        node_stats = NodePageStats(
            healthy_nodes=random.randint(9, 11),
            warning_nodes=random.randint(0, 2),
            total_cores=random.randint(40, 60),
            total_memory=random.randint(160, 256),
            avg_cpu_usage=round(random.uniform(25, 45), 1),
            avg_memory_usage=round(random.uniform(60, 80), 1),
            healthy_nodes_change=f"+{random.randint(0, 3)}%",
            warning_nodes_change=f"{random.choice(['+', '-'])}{random.randint(0, 2)}%",
            total_cores_change="+0%",
            total_memory_change="+0%",
            avg_cpu_usage_change=f"{random.choice(['+', '-'])}{random.uniform(0.5, 3.0):.1f}%",
            avg_memory_usage_change=f"{random.choice(['+', '-'])}{random.uniform(0.5, 2.0):.1f}%"
        )
        
        return BaseResponse.success_response(
            data=node_stats.dict(),
            message="Node stats retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve node stats",
            error_code="DATABASE_ERROR",
            details=str(e)
        )


@router.get("/nodes/{node_name}", response_model=BaseResponse)
def get_node(node_name: str):
    """특정 노드 상세 정보 조회"""
    try:
        # 실제 구현에서는 데이터베이스에서 특정 노드 정보를 가져옴
        node = Node(
            name=node_name,
            ip=f"10.0.1.{random.randint(10, 20)}",
            role=random.choice(["Master", "Worker", "Docker"]),
            status=random.choice(["Ready", "Warning"]),
            cpu=ResourceUsage(
                cores=random.randint(4, 16),
                usage=round(random.uniform(20, 90), 1)
            ),
            memory=MemoryInfo(
                total=random.choice([16, 32, 64]),
                usage=round(random.uniform(30, 95), 1)
            ),
            disk=DiskInfo(
                total=random.choice([100, 200, 500]),
                usage=round(random.uniform(20, 80), 1)
            ),
            containers=random.randint(10, 50),
            uptime=f"{random.randint(20, 50)}d {random.randint(0, 23)}h",
            last_heartbeat=(datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat() + "Z"
        )
        
        return BaseResponse.success_response(
            data=node.dict(),
            message="Node retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve node",
            error_code="DATABASE_ERROR",
            details=str(e)
        )
