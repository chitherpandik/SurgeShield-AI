"""
Dashboard Metrics API Endpoint for SurgeShield AI.
Exposes GET /dashboard returning real-time aggregated metrics computed directly from MySQL.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app.schemas.response import DashboardResponse
from backend.app.db.database import get_db
from backend.app.db.repository import repository
from backend.app.services.surge_service import surge_service

router = APIRouter(tags=["Executive Dashboard"])


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    summary="Get Executive Dashboard Summary Metrics from MySQL"
)
def get_dashboard_endpoint(db: Session = Depends(get_db)):
    """
    Computes real-time aggregated portfolio metrics from persistent MySQL storage:
    - **total_analyzed_transactions**: Cumulative count of transactions analyzed.
    - **fraud_count**: Total identified fraudulent transactions (decision = 'BLOCK').
    - **legitimate_count**: Total approved/non-fraudulent transactions.
    - **fraud_percentage**: Overall fraud incidence percentage.
    - **average_risk**: Mean composite risk score across portfolio.
    - **high_risk_count**: Count of transactions with risk score >= 70.
    - **blocked_count**: Transactions blocked by automated decision engine.
    - **verification_count**: Transactions flagged for secondary verification.
    - **approved_count**: Transactions approved immediately.
    - **total_transaction_amount**: Total monetary transaction volume in INR (₹).
    - **suspicious_transaction_amount**: Blocked/suspicious monetary volume in INR (₹).
    - **current_surge_score**: Real-time volume surge indicator score.
    """
    try:
        current_time = surge_service.last_tx_time
        surge_info = surge_service.analyze_surge(current_time) if current_time > 0 else {"surge_score": 0.0}
        current_surge_score = surge_info.get("surge_score", 0.0)
        
        stats = repository.get_dashboard_statistics(db=db, current_surge_score=current_surge_score)
        return stats
        
    except SQLAlchemyError as db_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database aggregation failure: Unable to compute dashboard metrics from MySQL."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dashboard summary fetch error: {str(e)}"
        )
