from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.database import get_db
from typing import List, Optional
import random
from datetime import datetime, timedelta
from models import LogEntry, LogStats, LogListResponse, LogStatsResponse, BaseResponse
from api.routes.auth import get_current_user_from_token
import collections


router = APIRouter(
    prefix="/api", 
    tags=["logs"],
    dependencies=[Depends(get_current_user_from_token)]
)

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
    db : Session = Depends(get_db),
    level: Optional[str] = Query(None, description="로그 레벨 필터", enum=['INFO', 'WARN', 'DEBUG', 'ERROR']),
    container_id: Optional[int] = Query(None, description="컨테이너 ID 필터"),
    search: Optional[str] = Query(None, description="로그 메시지 검색어"),
    time_range: str = Query("24h", description="시간 범위 (1h, 6h, 24h, 7d)")
):
    """로그 목록 조회"""
    try:
        where_clauses = []
        params = {}

        # 시간 범위 선택
        time_filters = {
            "1h": timedelta(hours=1), "6h": timedelta(hours=6),
            "24h": timedelta(hours=24), "7d": timedelta(days=7)
        }
        if time_range in time_filters:
            start_time = datetime.now() - time_filters[time_range]
            where_clauses.append("l.created_at >= :start_time")
            params["start_time"] = start_time
        
        # 로그 레벨 선택
        if level:
            where_clauses.append("l.level = :level")
            params["level"] = level

        # 컨테이너 선택
        if container_id:
            where_clauses.append("l.container_id = :container_id")
            params["container_id"] = container_id

        # 메시지 검색
        if search:
            where_clauses.append("l.message LIKE :search")
            params["search"] = f"%{search}%"

        # 최종 WHERE 절
        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        stats_query_str = f"SELECT l.level, COUNT(l.id) as count FROM logs l {where_sql} GROUP BY l.level"
        stats_rows = db.execute(text(stats_query_str), params).fetchall()
        
        stats_counts = collections.defaultdict(int)
        for row in stats_rows:
            stats_counts[row.level] = row.count
        total_logs = sum(stats_counts.values())

        stats = LogStats(
            total_logs=total_logs,
            info_count=stats_counts.get('INFO', 0),
            warn_count=stats_counts.get('WARN', 0),
            error_count=stats_counts.get('ERROR', 0),
            debug_count=stats_counts.get('DEBUG', 0),
            time_range=time_range
        )

        logs_query_str = f"""
            SELECT l.id, c.container_name, l.level, l.message, l.event_time, l.created_at
            FROM logs l
            JOIN containers c ON l.container_id = c.id
            {where_sql}
            ORDER BY l.created_at DESC
        """
        log_rows = db.execute(text(logs_query_str), params).fetchall()

        logs = []
        today = datetime.now().date()
        for row in log_rows:
            event_date = row.event_time.date()
            if event_date == today:
                timestamp_str = row.event_time.strftime("%H:%M:%S")
            else:
                timestamp_str = row.event_time.strftime("%Y-%m-%d %H:%M:%S")

            logs.append(LogEntry(
                id=str(row.id),
                level=row.level,
                message=row.message,
                source=row.container_name,
                timestamp=timestamp_str,
            ))
        
        # 응답 리턴
        return LogListResponse(
            success=True,
            message="로그 목록을 성공적으로 조회했습니다.",
            data={
                "logs": logs,
                "stats": stats,
            }
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="로그 조회 중 서버 오류가 발생했습니다.")

@router.get("/logs/stats", response_model=LogStatsResponse)
async def get_log_stats(
    db: Session = Depends(get_db),
    time_range: str = Query("24h", description="시간 범위")
):
    """로그 통계 조회"""
    try:
        # 1. 동적 쿼리 생성을 위한 준비
        where_clauses = []
        params = {}

        # 2. 필터 조건에 따라 WHERE 절과 파라미터를 동적으로 추가
        time_filters = {
            "1h": timedelta(hours=1), "6h": timedelta(hours=6),
            "24h": timedelta(hours=24), "7d": timedelta(days=7)
        }
        if time_range in time_filters:
            start_time = datetime.now() - time_filters[time_range]
            where_clauses.append("created_at >= :start_time")
            params["start_time"] = start_time
        
        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        # 3. 통계 조회 쿼리 실행
        stats_query_str = f"SELECT level, COUNT(id) as count FROM logs {where_sql} GROUP BY level"
        stats_rows = db.execute(text(stats_query_str), params).fetchall()
        
        stats_counts = collections.defaultdict(int)
        for row in stats_rows:
            stats_counts[row.level] = row.count
        total_logs = sum(stats_counts.values())

        # 통계 계산
        stats = LogStats(
            total_logs=total_logs,
            info_count=stats_counts.get('INFO', 0),
            warn_count=stats_counts.get('WARN', 0),
            error_count=stats_counts.get('ERROR', 0),
            debug_count=stats_counts.get('DEBUG', 0),
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

@router.delete("/logs", response_model=BaseResponse)
async def clear_all_logs(db: Session = Depends(get_db)):
    """모든 로그 삭제"""
    try:
        # TODO: 백엔드 개발자 구현 필요
        # 1. 데이터베이스에서 모든 로그 삭제 (logs 테이블)
        # 2. 로그 통계 초기화 (필요한 경우)
        # 3. 삭제 성공/실패 여부 반환
        
        # 현재는 무조건 성공 처리
        return BaseResponse.success_response(
            data={"cleared": True, "deleted_count": 0},
            message="모든 로그가 성공적으로 삭제되었습니다."
        )
        
    except Exception as e:
        return BaseResponse.error_response(
            message="로그 삭제 중 오류가 발생했습니다.",
            error_code="DELETE_ERROR",
            details=str(e)
        )