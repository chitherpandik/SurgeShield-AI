"""
Database Initialization Script for SurgeShield AI.
Creates required MySQL database tables defined in SQLAlchemy ORM models.
Does not delete existing data.

Usage:
    python -m backend.app.db.init_db
"""

import sys
import logging
from pathlib import Path
from sqlalchemy.exc import OperationalError, SQLAlchemyError

# Ensure project root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.app.db.database import engine, Base
# Import all models to ensure metadata registration
from backend.app.db.models import Transaction

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("surgeshield.init_db")


def init_database() -> bool:
    """
    Initializes database schema by creating all registered tables.
    
    Returns:
        bool: True if initialization succeeded, False otherwise.
    """
    print("=" * 60)
    print("        SURGESHIELD AI — DATABASE INITIALIZATION")
    print("=" * 60)
    print("Connecting to MySQL database...")
    
    try:
        # Create all tables registered in Base metadata (if not already existing)
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] MySQL database tables created / verified successfully.")
        print(f"          Registered tables: {list(Base.metadata.tables.keys())}")
        print("=" * 60)
        return True
        
    except OperationalError as e:
        print("[ERROR] Failed to connect to MySQL database.")
        print(f"        Operational Error: {type(e).__name__}")
        print("        Please ensure that:")
        print("        1. MySQL server is running (e.g., MySQL 8.0 service).")
        print("        2. Database 'surgeshield' exists (CREATE DATABASE surgeshield;).")
        print("        3. DATABASE_URL in .env has valid host, port, username, and password.")
        print("=" * 60)
        return False
        
    except SQLAlchemyError as e:
        print(f"[ERROR] SQLAlchemy Database Error: {str(e)}")
        print("=" * 60)
        return False
        
    except Exception as e:
        print(f"[ERROR] Unexpected error during initialization: {str(e)}")
        print("=" * 60)
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
