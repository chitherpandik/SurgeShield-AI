"""
Surge Intelligence API Endpoints for SurgeShield AI.
Exposes GET /surge (current activity status) and POST /surge (transaction-specific surge analysis).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.schemas.request import TransactionRequest
from backend.app.schemas.response import SurgeStatusResponse, SurgeAnalysisResponse
from backend.app.services.surge_service import surge_service
from backend.app.services.ml_service import ml_service
from backend.app.db.database import get_db
from backend.app.db.repository import repository

router = APIRouter(tags=["Surge Intelligence"])


@router.get(
    "/surge",
    response_model=SurgeStatusResponse,
    summary="Get Real-Time Surge Intelligence Status & Baseline Metrics"
)
def get_surge_status_endpoint(db: Session = Depends(get_db)):
    """
    Returns real-time surge intelligence metrics:
    - **baseline_activity**: Expected baseline transaction rate per hour.
    - **current_activity**: Transaction count in current rolling evaluation window.
    - **surge_percentage**: Percentage deviation from baseline.
    - **surge_score**: Volume intensity score (0-100).
    - **surge_status**: Categorization ('Normal Volume', 'Genuine Surge', 'Suspicious Surge').
    
    *Important*: High volume alone does not imply fraud. Genuine surges (flash sales, festivals)
    are differentiated from malicious bursts via multi-factor feature and risk intelligence.
    """
    try:
        current_time = surge_service.last_tx_time
        surge_info = surge_service.analyze_surge(current_time) if current_time > 0 else {
            "surge_score": 0.0,
            "recent_volume": 0,
            "baseline_volume": 50.0,
            "activity_change_pct": 0.0,
            "surge_status": "Normal Volume"
        }
        
        return SurgeStatusResponse(
            baseline_activity=surge_info["baseline_volume"],
            current_activity=surge_info["recent_volume"],
            surge_percentage=surge_info["activity_change_pct"],
            surge_score=surge_info["surge_score"],
            surge_status=surge_info["surge_status"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving surge intelligence status: {str(e)}"
        )


@router.post(
    "/surge",
    response_model=SurgeAnalysisResponse,
    summary="Analyze Surge Metrics for an Individual Transaction"
)
def surge_analysis_endpoint(request: TransactionRequest):
    """
    Analyzes transaction timestamp against rolling volume baseline.
    Distinguishes Genuine Surges (High volume + low fraud) from Suspicious Surges (High volume + high fraud).
    """
    try:
        tx_dict = request.model_dump()
        fraud_prob, _ = ml_service.predict_fraud(tx_dict)
        surge_info = surge_service.analyze_surge(tx_dict["Time"], fraud_prob)
        
        return SurgeAnalysisResponse(
            surge_score=surge_info["surge_score"],
            recent_volume=surge_info["recent_volume"],
            baseline_volume=surge_info["baseline_volume"],
            activity_change_pct=surge_info["activity_change_pct"],
            surge_status=surge_info["surge_status"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Surge analysis error: {str(e)}"
        )
