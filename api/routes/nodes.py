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
from api.routes.auth import get_current_user_from_token
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(prefix="/api", tags=["nodes"])

#update 변환함수
def format_uptime(seconds: int) -> str:
    days, remainder = divmod(seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, _ = divmod(remainder, 60)

    if days > 0:
        return f"{days}d {hours}h"
    elif hours > 0:
        return f"{hours}h {minutes}m"
    else:
        return f"{minutes}m"

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
                uptime= format_uptime(seconds=row.uptime_seconds), # 추후 구현,
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

        # TODO: 백엔드 개발자 구현 필요
        # 1. 데이터베이스에서 노드 상태별 집계 (nodes 테이블) OK
        # 2. 데이터베이스에서 노드 리소스 사용률 평균 계산 (metrics 테이블) // 노드들의 요약 
        # 3. 데이터베이스에서 이전 시점과의 변화량 계산 (metrics_history 테이블) // 노드들의 변화량
         
        #1. DB 쿼리 작성
        nodes_row = db.execute(text("""
            SELECT 
                COUNT(CASE WHEN status='Ready' THEN 1 END) AS healthy_nodes,
                COUNT(CASE WHEN status='Warning' THEN 1 END) AS warning_nodes,
                SUM(total_cores) AS total_cores,
                SUM(total_memory) AS total_memory
            FROM nodes
        """)).fetchone()

        #2. 최신 메트릭스 기반 평균 
        metrics_row = db.execute(text("""
            SELECT 
                AVG(m.cpu_usage) AS avg_cpu_usage,
                AVG(m.memory_usage) AS avg_memory_usage
            FROM metrics m
            INNER JOIN (
                SELECT node_id, MAX(collected_at) AS latest
                FROM metrics
                GROUP BY node_id
            ) latest_metrics
            ON m.node_id = latest_metrics.node_id 
            AND m.collected_at = latest_metrics.latest
            """)).fetchone()
        
        # 3. 메트릭스_히스토리에서 변화량 계산 
        history_rows = db.execute(text("""
            SELECT 
                avg_cpu_usage, avg_memory_usage,
                healthy_nodes, warning_nodes,
                total_cores, total_memory, collected_at
            FROM metrics_history
            ORDER BY collected_at DESC
            LIMIT 2
        """)).fetchall()

        # 기본값 설정
        current = history_rows[0] if history_rows else None
        previous = history_rows[1] if len(history_rows) > 1 else None

        #변화량 계산 
        def calc_change(current_val, prev_val):
            if not current_val or not prev_val or prev_val == 0:
                return "+0%"
            diff = ((current_val - prev_val) / prev_val) * 100
            sign = "+" if diff >= 0 else "-"
            return f"{sign}{abs(diff):.1f}%"
        
        node_stats = NodePageStats(
            healthy_nodes=nodes_row.healthy_nodes or 0,
            warning_nodes=nodes_row.warning_nodes or 0,
            total_cores=nodes_row.total_cores or 0,
            total_memory=nodes_row.total_memory or 0,
            avg_cpu_usage=round(metrics_row.avg_cpu_usage, 1) if metrics_row and metrics_row.avg_cpu_usage else 0.0,
            avg_memory_usage=round(metrics_row.avg_memory_usage, 1) if metrics_row and metrics_row.avg_memory_usage else 0.0,

            healthy_nodes_change=calc_change(
                current.healthy_nodes if current else None,
                previous.healthy_nodes if previous else None
            ),
            warning_nodes_change=calc_change(
                current.warning_nodes if current else None,
                previous.warning_nodes if previous else None
            ),
            total_cores_change=calc_change(
                current.total_cores if current else None,
                previous.total_cores if previous else None
            ),
            total_memory_change=calc_change(
                current.total_memory if current else None,
                previous.total_memory if previous else None
            ),
            avg_cpu_usage_change=calc_change(
                current.avg_cpu_usage if current else None,
                previous.avg_cpu_usage if previous else None
            ),
            avg_memory_usage_change=calc_change(
                current.avg_memory_usage if current else None,
                previous.avg_memory_usage if previous else None
            )
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

        #1. 쿼리 
        query = text("""
            SELECT n.node_name, n.ip, n.role, n.status,
            n.total_cores, n.total_memory, n.total_disk,
            m.cpu_usage, m.memory_usage, m.disk_usage, m.containers, m.uptime_seconds, m.collected_at
            FROM nodes n
            LEFT JOIN metrics m ON n.id = m.node_id
            WHERE n.node_name = :node_name
            ORDER BY m.collected_at DESC
            LIMIT 1;
        """)

        row = db.execute(query, {"node_name": node_name}).fetchone()

        #2. pydantic 모델로 매핑
        node = Node(
            name=row.node_name,
            ip=row.ip,
            role=row.role ,
            status=row.status,
            cpu=ResourceUsage(
                cores=row.total_cores,
                usage=row.cpu_usage
            ),
            memory=MemoryInfo(
                total=row.total_memory,
                usage=row.memory_usage
            ),
            disk=DiskInfo(
                total=row.total_disk,
                usage=row.disk_usage
            ),
            containers=row.containers,
            uptime=format_uptime(seconds=row.uptime_seconds),
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