"""
SQLAlchemy ORM Models for SurgeShield AI.
Defines persistent database schemas for transaction risk analysis and historical intelligence.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Index
from backend.app.db.database import Base


class Transaction(Base):
    """
    SQLAlchemy ORM model representing an evaluated transaction with ML, surge, pattern,
    and decision engine results stored persistently in MySQL.
    """
    __tablename__ = "transactions"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True, doc="Unique Auto-incrementing Transaction ID")
    
    # Audit & Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True, doc="System ingestion timestamp (UTC)")
    transaction_time = Column(Float, nullable=False, index=True, doc="Dataset transaction time offset in seconds")
    
    # Transaction Monetary Data
    amount = Column(Float, nullable=False, doc="Monetary transaction amount in INR / ₹")
    
    # ML Intelligence Outputs
    fraud_probability = Column(Float, nullable=False, doc="ML predicted fraud probability (0.0000 to 1.0000)")
    prediction = Column(String(50), nullable=False, doc="ML classification label ('Fraud' or 'Legitimate')")
    
    # Multi-Indicator Sub-Scores (0.00 to 100.00)
    surge_score = Column(Float, nullable=False, doc="Transaction volume surge score (0-100)")
    temporal_score = Column(Float, nullable=False, doc="Temporal periodicity anomaly score (0-100)")
    pattern_score = Column(Float, nullable=False, doc="Statistical PCA feature anomaly score (0-100)")
    
    # Composite Risk Engine
    risk_score = Column(Float, nullable=False, index=True, doc="Weighted composite risk score (0-100)")
    risk_level = Column(String(20), nullable=False, index=True, doc="Qualitative risk category ('LOW', 'MEDIUM', 'HIGH')")
    
    # Decision Engine & Explainability
    decision = Column(String(20), nullable=False, index=True, doc="Automated decision ('APPROVE', 'VERIFY', 'BLOCK')")
    reasons = Column(JSON, nullable=False, doc="Structured list of explainability decision factors")

    # Composite index for efficient dashboard and temporal filtering
    __table_args__ = (
        Index("ix_transactions_decision_risk", "decision", "risk_score"),
        Index("ix_transactions_created_at_desc", created_at.desc()),
    )

    def to_dict(self) -> dict:
        """Serializes ORM model instance to dictionary format."""
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "transaction_time": self.transaction_time,
            "amount": self.amount,
            "fraud_probability": self.fraud_probability,
            "prediction": self.prediction,
            "surge_score": self.surge_score,
            "temporal_score": self.temporal_score,
            "pattern_score": self.pattern_score,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "decision": self.decision,
            "reasons": self.reasons if isinstance(self.reasons, list) else (self.reasons or [])
        }

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, amount={self.amount}, risk={self.risk_score}, decision='{self.decision}')>"
