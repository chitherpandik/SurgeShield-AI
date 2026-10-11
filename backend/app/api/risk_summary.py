"""
Risk Summary API Endpoint for SurgeShield AI.
Exposes GET /risk-summary returning distribution counts categorized by risk levels and decision outcomes from MySQL.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app.schemas.response import RiskSummaryResponse
from backend.app.db.database import get_db
from backend.app.db.repository import repository

router = APIRouter(tags=["Risk & Compliance"])


@router.get(
    "/risk-summary",
    response_model=RiskSummaryResponse,
    summary="Get Risk Breakdown and Decision Distribution from MySQL"
)
def get_risk_summary_endpoint(db: Session = Depends(get_db)):
    """
    Returns transaction counts categorized by:
    - **Risk Levels**:
      - `low_risk`: Count of transactions with LOW risk (< 30).
      - `medium_risk`: Count of transactions with MEDIUM risk (30 - 69).
      - `high_risk`: Count of transactions with HIGH risk (>= 70).
    - **Decision Categories**:
      - `approved`: Total approved transactions.
      - `verified`: Total transactions requiring step-up verification.
      - `blocked`: Total blocked fraudulent transactions.
      
    All values are computed directly from the persistent MySQL database.
    """
    try:
        summary = repository.get_risk_summary(db=db)
        return summary
    except SQLAlchemyError as db_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database aggregation failure: Unable to fetch risk summary from MySQL."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error computing risk summary: {str(e)}"
        )
