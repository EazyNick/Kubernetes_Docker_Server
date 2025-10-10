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
def get_node_stats(db: Session = Depends(get_db)):
    """노드 페이지 통계"""
    try:
        # 1. 노드 상태별 집계
        status_query = text("SELECT status, COUNT(id) as count FROM nodes GROUP BY status")
        status_rows = db.execute(status_query).fetchall()
        
        status_counts = {row.status: row.count for row in status_rows}
        healthy_nodes = status_counts.get("Ready", 0) + status_counts.get("Active", 0)
        warning_nodes = status_counts.get("Warning", 0)

        # 2. 전체 리소스 집계
        resource_query = text("SELECT SUM(total_cores) as total_cores, SUM(total_memory) as total_memory FROM nodes")
        resource_row = db.execute(resource_query).fetchone()
        
        total_cores = resource_row.total_cores or 0
        total_memory = resource_row.total_memory or 0

        # 3. 평균 리소스 사용률 계산
        avg_usage_query = text("""
            SELECT AVG(m.cpu_usage) as avg_cpu, AVG(m.memory_usage) as avg_mem
            FROM metrics m
            WHERE m.collected_at IN (
                SELECT MAX(m2.collected_at)
                FROM metrics m2
                GROUP BY m2.node_id
            )
        """)
        avg_usage_row = db.execute(avg_usage_query).fetchone()

        avg_cpu_usage = avg_usage_row.avg_cpu or 0.0
        avg_memory_usage = avg_usage_row.avg_mem or 0.0

        # 4. 통계 데이터 모델 생성
        node_stats = NodePageStats(
            healthy_nodes=healthy_nodes,
            warning_nodes=warning_nodes,
            total_cores=int(total_cores),
            total_memory=int(total_memory),
            avg_cpu_usage=round(avg_cpu_usage, 1),
            avg_memory_usage=round(avg_memory_usage, 1),
            # 변화량은 추후 구현
            healthy_nodes_change="+0%",
            warning_nodes_change="+0%",
            total_cores_change="+0%",
            total_memory_change="+0%",
            avg_cpu_usage_change="+0.0%",
            avg_memory_usage_change="+0.0%"
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
def get_node(node_name: str, db: Session = Depends(get_db)):
    """특정 노드 상세 정보 조회"""
    try:
        query = text("""
            SELECT n.id, n.node_name, n.ip, n.role, n.status, n.total_cores,
                   n.total_memory, n.total_disk, n.created_at, n.updated_at,
                   m.cpu_usage, m.memory_usage, m.disk_usage, m.containers, m.collected_at
            FROM nodes n
            LEFT JOIN metrics m ON n.id = m.node_id
            AND m.collected_at = (
                SELECT MAX(m2.collected_at)
                FROM metrics m2
                WHERE m2.node_id = n.id
            )
            WHERE n.node_name = :node_name
        """)
        row = db.execute(query, {"node_name": node_name}).fetchone()

        if not row:
            return BaseResponse.error_response(
                message=f"Node {node_name} not found",
                error_code="NOT_FOUND"
            )

        node = Node(
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
