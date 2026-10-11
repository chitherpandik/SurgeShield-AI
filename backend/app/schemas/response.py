"""
Pydantic Response Schemas for SurgeShield AI API Endpoints.
Defines strict response serialization formats for health checks, ML predictions,
surge intelligence, transaction histories, risk summaries, and executive dashboards.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class HealthResponse(BaseModel):
    status: str = Field("healthy", example="healthy")
    service: str = Field("SurgeShield AI", example="SurgeShield AI")
    database: Optional[str] = Field("connected", example="connected", description="MySQL connection status")


class PredictionResponse(BaseModel):
    fraud_probability: float = Field(..., description="ML model fraud probability between 0.0 and 1.0", example=0.91)
    prediction: str = Field(..., description="Classification decision ('Fraud' or 'Legitimate')", example="Fraud")


class SurgeStatusResponse(BaseModel):
    """Response schema for GET /surge."""
    baseline_activity: float = Field(..., description="Baseline transaction volume rate per hour", example=50.0)
    current_activity: int = Field(..., description="Number of transactions in rolling window", example=120)
    surge_percentage: float = Field(..., description="Percentage activity deviation relative to baseline", example=140.0)
    surge_score: float = Field(..., description="Surge activity score between 0.0 and 100.0", example=78.0)
    surge_status: str = Field(..., description="Surge category ('Normal Volume', 'Genuine Surge', 'Suspicious Surge')", example="Suspicious Surge")


class SurgeAnalysisResponse(BaseModel):
    """Response schema for POST /surge."""
    surge_score: float = Field(..., description="Surge activity score between 0.0 and 100.0", example=78.0)
    recent_volume: int = Field(..., description="Number of transactions in rolling window", example=145)
    baseline_volume: float = Field(..., description="Baseline transaction volume rate per hour", example=50.0)
    activity_change_pct: float = Field(..., description="Percentage volume change relative to baseline", example=190.0)
    surge_status: str = Field(..., description="Surge category ('Normal Volume', 'Genuine Surge', 'Suspicious Surge')", example="Suspicious Surge")


class AnalysisResponse(BaseModel):
    """Response schema for POST /analyze."""
    transaction_id: Optional[int] = Field(None, description="Persisted MySQL transaction ID", example=125)
    fraud_probability: float = Field(..., description="ML fraud probability score (0.0 to 1.0)", example=0.91)
    prediction: Optional[str] = Field("Fraud", description="Model classification label ('Fraud' or 'Legitimate')", example="Fraud")
    surge_score: float = Field(..., description="Transaction surge score (0.0 to 100.0)", example=78.0)
    temporal_score: float = Field(..., description="Temporal anomaly score (0.0 to 100.0)", example=72.0)
    pattern_score: float = Field(..., description="Anomalous feature pattern score (0.0 to 100.0)", example=82.0)
    risk_score: float = Field(..., description="Weighted composite risk score (0.0 to 100.0)", example=89.0)
    risk_level: str = Field(..., description="Qualitative risk classification ('LOW', 'MEDIUM', 'HIGH')", example="HIGH")
    decision: str = Field(..., description="Automated decision ('APPROVE', 'VERIFY', 'BLOCK')", example="BLOCK")
    reasons: List[str] = Field(..., description="List of transparent, explainable decision factors")

    model_config = ConfigDict(from_attributes=True)


class TransactionItemResponse(BaseModel):
    """Response schema for individual transaction in GET /transactions list."""
    id: int = Field(..., example=1)
    transaction_time: float = Field(..., example=406.0)
    amount: float = Field(..., example=149.99)
    fraud_probability: float = Field(..., example=0.91)
    risk_score: float = Field(..., example=89.0)
    risk_level: str = Field(..., example="HIGH")
    decision: str = Field(..., example="BLOCK")
    created_at: Optional[datetime] = Field(None, example="2026-09-29T03:00:00")

    model_config = ConfigDict(from_attributes=True)


class TransactionDetailResponse(BaseModel):
    """Response schema for full record in GET /transactions/{id}."""
    id: int = Field(..., example=1)
    created_at: Optional[datetime] = Field(None, example="2026-09-29T03:00:00")
    transaction_time: float = Field(..., example=406.0)
    amount: float = Field(..., example=149.99)
    fraud_probability: float = Field(..., example=0.91)
    prediction: str = Field(..., example="Fraud")
    surge_score: float = Field(..., example=78.0)
    temporal_score: float = Field(..., example=72.0)
    pattern_score: float = Field(..., example=82.0)
    risk_score: float = Field(..., example=89.0)
    risk_level: str = Field(..., example="HIGH")
    decision: str = Field(..., example="BLOCK")
    reasons: List[str] = Field(..., example=["High fraud probability", "Off-peak hour transaction"])

    model_config = ConfigDict(from_attributes=True)


class DashboardResponse(BaseModel):
    """Response schema for GET /dashboard."""
    total_analyzed_transactions: int = Field(..., example=1500)
    fraud_count: int = Field(..., example=45)
    legitimate_count: int = Field(..., example=1455)
    fraud_percentage: float = Field(..., example=3.0)
    average_risk: float = Field(..., example=18.4)
    high_risk_count: int = Field(..., example=52)
    blocked_count: int = Field(..., example=45)
    verification_count: int = Field(..., example=85)
    approved_count: int = Field(..., example=1370)
    total_transaction_amount: float = Field(..., example=128500.50)
    suspicious_transaction_amount: float = Field(..., example=14200.00)
    current_surge_score: Optional[float] = Field(0.0, example=24.5)

    model_config = ConfigDict(from_attributes=True)


class RiskSummaryResponse(BaseModel):
    """Response schema for GET /risk-summary."""
    low_risk: int = Field(..., example=1000)
    medium_risk: int = Field(..., example=120)
    high_risk: int = Field(..., example=45)
    approved: int = Field(..., example=1045)
    verified: int = Field(..., example=80)
    blocked: int = Field(..., example=40)

    model_config = ConfigDict(from_attributes=True)
