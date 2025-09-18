from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경변수에서 DB 접속 정보 읽기
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")

# DB URL 생성 (pymysql 드라이버 사용)
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 엔진 & 세션 생성
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI에서 의존성 주입용
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 단독 실행 시 연결 테스트
if __name__ == "__main__":
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT NOW()"))
            print("✅ DB 연결 성공:", result.fetchone())
    except Exception as e:
        print("❌ DB 연결 실패:", e)