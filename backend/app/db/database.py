"""
Database Connection & Session Factory for SurgeShield AI.
Configures SQLAlchemy engine, session maker, base model class, and FastAPI dependency injection.
"""

from typing import Generator
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, OperationalError

from backend.app.core.config import settings

logger = logging.getLogger("surgeshield.db")

# Create SQLAlchemy Engine for MySQL using PyMySQL driver
# pool_pre_ping=True ensures stale connections are recycled gracefully
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=False
)

# Thread-safe Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Declarative Base for ORM Models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Ensures sessions are cleanly closed even on exceptions.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """
    Safely tests MySQL database connectivity without exposing connection secrets.
    
    Returns:
        dict: Status dictionary with connection state and message.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "message": "MySQL database is reachable and operational."
        }
    except OperationalError as e:
        logger.warning(f"Database operational error during connectivity check: {type(e).__name__}")
        return {
            "status": "disconnected",
            "message": "MySQL database connection failed. Verify service availability and credentials."
        }
    except SQLAlchemyError as e:
        logger.error(f"Database error during connectivity check: {type(e).__name__}")
        return {
            "status": "error",
            "message": "Database query error occurred during health probe."
        }
    except Exception as e:
        logger.error(f"Unexpected error during health probe: {type(e).__name__}")
        return {
            "status": "error",
            "message": "Unexpected error while communicating with database."
        }
