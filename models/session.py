"""
세션 관련 데이터 모델
"""
from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
from datetime import datetime

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_token = Column(String(255), unique=True, nullable=False)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="sessions")
