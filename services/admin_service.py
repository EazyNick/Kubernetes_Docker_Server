"""
관리자 페이지용 데이터베이스 쿼리 함수들
실제 데이터베이스에서 관리자 페이지 데이터를 가져오는 함수들
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

class AdminDatabaseService:
    """관리자 페이지용 데이터베이스 서비스"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """관리자 대시보드 통계 조회 - VIEW 사용"""
        try:
            # VIEW에서 통계 조회
            stats_query = """
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
                    COUNT(CASE WHEN recent_login_flag = 1 THEN 1 END) as recent_logins,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_users_today
                FROM admin_user_view
            """
            
            result = self.db.execute(text(stats_query)).first()
            
            return {
                "total_users": result.total_users,
                "active_users": result.active_users,
                "admin_users": result.admin_users,
                "recent_logins": result.recent_logins,
                "new_users_today": result.new_users_today,
                "active_sessions": 0  # 세션 테이블이 있으면 계산 가능
            }
                
        except Exception as e:
            print(f"대시보드 통계 조회 오류: {e}")
            return self._get_fallback_stats()
    
    def _get_fallback_stats(self) -> Dict[str, Any]:
        """대시보드 통계 조회 실패 시 기본값 반환"""
        try:
            total_users = self.db.execute(text("SELECT COUNT(*) as count FROM users")).first().count
            active_users = self.db.execute(text("SELECT COUNT(*) as count FROM users WHERE status = 'active'")).first().count
            admin_users = self.db.execute(text("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")).first().count
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "admin_users": admin_users,
                "recent_logins": 0,
                "new_users_today": 0,
                "active_sessions": 0
            }
        except:
            return {
                "total_users": 0,
                "active_users": 0,
                "admin_users": 0,
                "recent_logins": 0,
                "new_users_today": 0,
                "active_sessions": 0
            }
    
    def get_users_list(self, page: int = 1, per_page: int = 10, search: str = None) -> Dict[str, Any]:
        """VIEW를 사용한 사용자 목록 조회 (페이지네이션)"""
        try:
            offset = (page - 1) * per_page
            
            # 검색 조건
            where_clause = ""
            params = {"offset": offset, "limit": per_page}
            
            if search:
                where_clause = "WHERE username LIKE :search OR email LIKE :search"
                params["search"] = f"%{search}%"
            
            # VIEW에서 사용자 목록 조회
            users_query = f"""
                SELECT * FROM admin_user_view
                {where_clause}
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset
            """
            
            users = self.db.execute(text(users_query), params).fetchall()
            
            # 전체 사용자 수 조회
            count_query = f"SELECT COUNT(*) as count FROM admin_user_view {where_clause}"
            count_params = {"search": f"%{search}%" if search else None}
            if search:
                count_params = {"search": f"%{search}%"}
            else:
                count_params = {}
                
            total_count = self.db.execute(text(count_query), count_params).first().count
            
            # 사용자 목록을 딕셔너리로 변환
            user_list = []
            for user in users:
                user_list.append({
                    "user_id": str(user.user_id),
                    "username": user.username,
                    "email": user.email,
                    "full_name": user.username,  # username을 full_name으로 사용
                    "role": user.role,
                    "is_active": user.status == "active",
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "total_logins": user.total_logins,
                    "successful_logins": user.successful_logins,
                    "failed_logins": user.failed_logins,
                    "last_login_attempt": user.last_login_attempt.isoformat() if user.last_login_attempt else None,
                    "recent_login_flag": user.recent_login_flag
                })
            
            return {
                "users": user_list,
                "total": total_count,
                "page": page,
                "per_page": per_page,
                "total_pages": (total_count + per_page - 1) // per_page
            }
            
        except Exception as e:
            print(f"사용자 목록 조회 오류: {e}")
            return {
                "users": [],
                "total": 0,
                "page": page,
                "per_page": per_page,
                "total_pages": 0
            }
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """VIEW를 사용한 개별 사용자 조회"""
        try:
            user_query = """
                SELECT * FROM admin_user_view
                WHERE user_id = :user_id
            """
            
            result = self.db.execute(text(user_query), {"user_id": user_id}).first()
            
            if not result:
                return None
            
            return {
                "user_id": str(result.user_id),
                "username": result.username,
                "email": result.email,
                "full_name": result.username,
                "role": result.role,
                "is_active": result.status == "active",
                "created_at": result.created_at.isoformat() if result.created_at else None,
                "last_login": result.last_login.isoformat() if result.last_login else None,
                "total_logins": result.total_logins,
                "successful_logins": result.successful_logins,
                "failed_logins": result.failed_logins,
                "last_login_attempt": result.last_login_attempt.isoformat() if result.last_login_attempt else None,
                "recent_login_flag": result.recent_login_flag
            }
            
        except Exception as e:
            print(f"사용자 조회 오류: {e}")
            return None
    
    def create_user(self, username: str, password_hash: str, email: str, role: str = "user", status: str = "active") -> bool:
        """새 사용자 생성"""
        try:
            # 사용자명 중복 확인
            existing = self.db.execute(text(
                "SELECT id FROM users WHERE username = :username"
            ), {"username": username}).first()
            
            if existing:
                return False
            
            # 새 사용자 생성
            self.db.execute(text("""
                INSERT INTO users (username, password_hash, email, role, status, created_at, updated_at)
                VALUES (:username, :password_hash, :email, :role, :status, NOW(), NOW())
            """), {
                "username": username,
                "password_hash": password_hash,
                "email": email,
                "role": role,
                "status": status
            })
            
            self.db.commit()
            
            # 새로 생성된 사용자 ID 가져오기
            user_id = self.db.execute(text("""
                SELECT id FROM users WHERE username = :username ORDER BY id DESC LIMIT 1
            """), {"username": username}).first().id
            
            # 새 사용자 생성 시 로그인 기록도 생성 (관리자가 생성한 사용자)
            self.db.execute(text("""
                INSERT INTO user_login_logs (user_id, ip_address, login_success, failure_reason, created_at)
                VALUES (:user_id, NULL, TRUE, '관리자에 의해 생성됨', NOW())
            """), {"user_id": user_id})
            
            self.db.commit()
            return True
            
        except Exception as e:
            print(f"사용자 생성 오류: {e}")
            self.db.rollback()
            return False
    
    def update_user(self, user_id: int, **kwargs) -> bool:
        """사용자 정보 수정"""
        try:
            # 수정 가능한 필드들
            allowed_fields = ["username", "email", "role", "status"]
            update_fields = []
            params = {"user_id": user_id}
            
            for field, value in kwargs.items():
                if field in allowed_fields and value is not None:
                    if field == "status":
                        update_fields.append("status = :status")
                        params["status"] = value
                    else:
                        update_fields.append(f"{field} = :{field}")
                        params[field] = value
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = NOW()")
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = :user_id"
            result = self.db.execute(text(query), params)
            
            self.db.commit()
            return result.rowcount > 0
            
        except Exception as e:
            print(f"사용자 수정 오류: {e}")
            self.db.rollback()
            return False
    
    def delete_user(self, user_id: int) -> bool:
        """사용자 삭제"""
        try:
            # 관리자 사용자는 삭제 불가
            user = self.db.execute(text(
                "SELECT role FROM users WHERE id = :user_id"
            ), {"user_id": user_id}).first()
            
            if user and user.role == "admin":
                return False
            
            # 사용자 삭제 (CASCADE로 세션도 함께 삭제됨)
            result = self.db.execute(text(
                "DELETE FROM users WHERE id = :user_id"
            ), {"user_id": user_id})
            
            self.db.commit()
            return result.rowcount > 0
            
        except Exception as e:
            print(f"사용자 삭제 오류: {e}")
            self.db.rollback()
            return False
    
    def get_recent_activities(self, limit: int = 20) -> List[Dict[str, Any]]:
        """최근 사용자 활동 조회 - 로그 시스템에서 처리"""
        # 로그 시스템에서 처리하므로 빈 리스트 반환
        return []
    
    def get_system_logs(self, level: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """시스템 로그 조회 - 로그 시스템에서 처리"""
        # 로그 시스템에서 처리하므로 빈 리스트 반환
        return []
    
    def get_admin_actions(self, limit: int = 20) -> List[Dict[str, Any]]:
        """관리자 작업 로그 조회 - 로그 시스템에서 처리"""
        # 로그 시스템에서 처리하므로 빈 리스트 반환
        return []
    
    def log_admin_action(self, admin_user_id: int, action_type: str, description: str, 
                         target_user_id: int = None, old_values: Dict = None, 
                         new_values: Dict = None, ip_address: str = None) -> bool:
        """관리자 작업 로그 기록 - 로그 시스템에서 처리"""
        # 로그 시스템에서 처리하므로 항상 성공으로 반환
        return True
