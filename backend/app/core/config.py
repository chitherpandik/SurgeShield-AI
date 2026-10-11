"""
Centralized Configuration Module for SurgeShield AI Backend.
Defines dynamic file paths, database connection URL, risk weighting parameters, decision thresholds, and surge settings.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SurgeShield AI — Real-Time Fraud Intelligence Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""
    DEBUG: bool = False
    
    # Path resolution relative to project root
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    MODEL_PATH: Path = BASE_DIR / "models" / "fraud_model.pkl"
    DATA_PATH: Path = BASE_DIR / "data" / "transactions.csv"
    TEST_DATA_PATH: Path = BASE_DIR / "data" / "test.csv"
    
    # Database Configuration (MySQL + PyMySQL)
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/surgeshield"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 3600
    DB_POOL_PRE_PING: bool = True
    
    # Risk Engine Prototype Weights (Configurable)
    WEIGHT_ML: float = 0.50        # 50% ML fraud probability weight
    WEIGHT_SURGE: float = 0.15     # 15% Surge activity weight
    WEIGHT_TEMPORAL: float = 0.15  # 15% Temporal anomaly weight
    WEIGHT_PATTERN: float = 0.20   # 20% Anomaly pattern weight
    
    # Decision Engine Prototype Thresholds (Configurable)
    LOW_RISK_THRESHOLD: float = 30.0   # Risk < 30 -> APPROVE (LOW)
    HIGH_RISK_THRESHOLD: float = 70.0  # Risk >= 70 -> BLOCK (HIGH), else VERIFY (MEDIUM)
    
    # Surge Intelligence Parameters
    SURGE_WINDOW_SECONDS: float = 3600.0  # 1-hour rolling window
    BASELINE_DEFAULT_RATE: float = 50.0   # Baseline 50 tx/hr default
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
