"""
노드 관련 API 라우트
클러스터 노드 정보 및 관리 기능을 제공
"""
from fastapi import APIRouter
from models import (
    BaseResponse,
    Node,
    NodeList
)
from models.node import ResourceUsage, MemoryInfo, DiskInfo
import random
from datetime import datetime, timedelta

# 라우터 생성
router = APIRouter(prefix="/api", tags=["nodes"])

@router.get("/nodes", response_model=BaseResponse)
def get_nodes():
    """노드 목록 조회"""
    try:
        nodes = []
        node_types = ["master", "worker", "worker", "docker"]
        
        for i, node_type in enumerate(node_types):
            nodes.append(Node(
                name=f"k8s-{node_type}-{i+1:02d}",
                ip=f"10.0.1.{10+i}",
                role=node_type.title(),
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
            ))
        
        node_list = NodeList(nodes=nodes)
        
        return BaseResponse.success_response(
            data=node_list.dict(),
            message="Nodes retrieved successfully"
        )
    except Exception as e:
        return BaseResponse.error_response(
            message="Failed to retrieve nodes",
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
