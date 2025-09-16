from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import random
from datetime import datetime, timedelta
from models import LogEntry, LogStats, LogListResponse, LogStatsResponse

router = APIRouter(prefix="/api", tags=["logs"])

# 샘플 로그 데이터 생성
def generate_sample_logs(count: int = 20) -> List[LogEntry]:
    """샘플 로그 데이터 생성"""
    log_levels = ["info", "warn", "error", "debug"]
    sources = [
        "nginx-web-1", "nginx-web-2", "postgres-db-1", "redis-cache-1", 
        "api-gateway-1", "k8s-master-01", "k8s-worker-01", "k8s-worker-02"
    ]
    messages = {
        "info": [
            "GET /api/health HTTP/1.1 200",
            "Connection established from 172.17.0.5",
            "Load balancer health check passed",
            "Pod nginx-web-3 scheduled successfully",
            "Container health check passed",
            "Rate limit applied to client 192.168.1.100",
            "Image pull completed for nginx:1.21",
            "Service endpoint updated for nginx-service",
            "Backup process completed successfully",
            "SSL certificate renewed"
        ],
        "warn": [
            "Memory usage is above 80%",
            "Slow query detected: 2.3s",
            "Resource limits exceeded for query",
            "High CPU usage detected",
            "Disk space running low",
            "Connection timeout warning",
            "Rate limit approaching threshold"
        ],
        "error": [
            "Failed to connect to upstream server",
            "Connection timeout to master",
            "Database connection failed",
            "Service unavailable",
            "Authentication failed",
            "Permission denied",
            "File not found"
        ],
        "debug": [
            "Debug information logged",
            "Trace request processing",
            "Configuration loaded",
            "Cache hit",
            "Database query executed"
        ]
    }
    
    logs = []
    base_time = datetime.now()
    
    for i in range(count):
        level = random.choice(log_levels)
        source = random.choice(sources)
        message = random.choice(messages[level])
        
        # 시간을 역순으로 생성 (최신 로그가 먼저)
        timestamp = base_time - timedelta(minutes=i*2, seconds=random.randint(0, 59))
        
        log_entry = LogEntry(
            id=f"log_{i+1:03d}",
            level=level,
            message=f"{source}: {message}",
            source=source,
            namespace="default",
            pod_name=f"pod-{source}",
            container_name=source,
            timestamp=timestamp.strftime("%H:%M:%S")
        )
        logs.append(log_entry)
    
    return logs

@router.get("/logs", response_model=LogListResponse)
async def get_logs(
    limit: int = Query(20, ge=1, le=100, description="로그 개수 제한"),
    level: Optional[str] = Query(None, description="로그 레벨 필터"),
    source: Optional[str] = Query(None, description="소스 필터"),
    time_range: str = Query("24h", description="시간 범위")
):
    """로그 목록 조회"""
    try:
        # 샘플 로그 데이터 생성
        all_logs = generate_sample_logs(50)
        
        # 필터링 적용
        filtered_logs = all_logs
        
        if level:
            filtered_logs = [log for log in filtered_logs if log.level == level]
        
        if source:
            filtered_logs = [log for log in filtered_logs if source.lower() in log.source.lower()]
        
        # 시간 범위에 따른 필터링 (실제로는 더 정교한 시간 필터링 필요)
        if time_range == "1h":
            filtered_logs = filtered_logs[:10]
        elif time_range == "6h":
            filtered_logs = filtered_logs[:25]
        elif time_range == "24h":
            filtered_logs = filtered_logs[:50]
        elif time_range == "7d":
            filtered_logs = filtered_logs
        
        # 페이지네이션
        logs = filtered_logs[:limit]
        
        # 통계 계산
        stats = LogStats(
            total_logs=len(filtered_logs),
            info_count=len([log for log in filtered_logs if log.level == "info"]),
            warn_count=len([log for log in filtered_logs if log.level == "warn"]),
            error_count=len([log for log in filtered_logs if log.level == "error"]),
            debug_count=len([log for log in filtered_logs if log.level == "debug"]),
            time_range=time_range
        )
        
        return LogListResponse(
            success=True,
            message="로그 목록을 성공적으로 조회했습니다.",
            data={
                "logs": logs,
                "stats": stats,
                "pagination": {
                    "total": len(filtered_logs),
                    "limit": limit,
                    "offset": 0,
                    "has_more": len(filtered_logs) > limit
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로그 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/logs/stats", response_model=LogStatsResponse)
async def get_log_stats(
    time_range: str = Query("24h", description="시간 범위")
):
    """로그 통계 조회"""
    try:
        # 샘플 로그 데이터 생성
        all_logs = generate_sample_logs(50)
        
        # 시간 범위에 따른 필터링
        if time_range == "1h":
            logs = all_logs[:10]
        elif time_range == "6h":
            logs = all_logs[:25]
        elif time_range == "24h":
            logs = all_logs[:50]
        elif time_range == "7d":
            logs = all_logs
        else:
            logs = all_logs
        
        # 통계 계산
        stats = LogStats(
            total_logs=len(logs),
            info_count=len([log for log in logs if log.level == "info"]),
            warn_count=len([log for log in logs if log.level == "warn"]),
            error_count=len([log for log in logs if log.level == "error"]),
            debug_count=len([log for log in logs if log.level == "debug"]),
            time_range=time_range
        )
        
        return LogStatsResponse(
            success=True,
            message="로그 통계를 성공적으로 조회했습니다.",
            data=stats
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로그 통계 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/logs/{log_id}", response_model=LogListResponse)
async def get_log_by_id(log_id: str):
    """특정 로그 조회"""
    try:
        # 샘플 로그 데이터에서 해당 ID 찾기
        all_logs = generate_sample_logs(50)
        log = next((log for log in all_logs if log.id == log_id), None)
        
        if not log:
            raise HTTPException(status_code=404, detail="로그를 찾을 수 없습니다.")
        
        return LogListResponse(
            success=True,
            message="로그를 성공적으로 조회했습니다.",
            data={
                "logs": [log],
                "stats": None,
                "pagination": {
                    "total": 1,
                    "limit": 1,
                    "offset": 0,
                    "has_more": False
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"로그 조회 중 오류가 발생했습니다: {str(e)}")
