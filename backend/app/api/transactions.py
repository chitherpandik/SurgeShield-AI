"""
Transactions History & Retrieval API Endpoints for SurgeShield AI.
Exposes GET /transactions (paginated list from MySQL) and GET /transactions/{id} (individual full record).
"""

from typing import List
from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app.schemas.response import TransactionItemResponse, TransactionDetailResponse
from backend.app.db.database import get_db
from backend.app.db.repository import repository

router = APIRouter(tags=["Transactions History"])


@router.get(
    "/transactions",
    response_model=List[TransactionItemResponse],
    summary="Get Analyzed Transactions History from MySQL"
)
def get_transactions_endpoint(
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of recent transactions to return (newest first)"),
    db: Session = Depends(get_db)
):
    """
    Retrieves a paginated list of evaluated transactions persistently stored in MySQL,
    sorted by newest first (descending ID).
    """
    try:
        transactions = repository.get_transactions(db=db, skip=skip, limit=limit)
        return [
            TransactionItemResponse(
                id=tx.id,
                transaction_time=tx.transaction_time,
                amount=tx.amount,
                fraud_probability=tx.fraud_probability,
                risk_score=tx.risk_score,
                risk_level=tx.risk_level,
                decision=tx.decision,
                created_at=tx.created_at
            )
            for tx in transactions
        ]
    except SQLAlchemyError as db_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database query failure: Unable to fetch transactions from MySQL."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transaction history: {str(e)}"
        )


@router.get(
    "/transactions/{id}",
    response_model=TransactionDetailResponse,
    summary="Get Detailed Transaction Intelligence by ID from MySQL"
)
def get_transaction_by_id_endpoint(
    id: int = Path(..., ge=1, description="Unique transaction ID in MySQL database"),
    db: Session = Depends(get_db)
):
    """
    Retrieves complete multi-indicator analysis and explainability record for a specific transaction ID.
    Returns HTTP 404 if transaction ID is not found.
    """
    try:
        tx = repository.get_transaction(db=db, transaction_id=id)
        if not tx:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {id} not found."
            )
            
        return TransactionDetailResponse(
            id=tx.id,
            created_at=tx.created_at,
            transaction_time=tx.transaction_time,
            amount=tx.amount,
            fraud_probability=tx.fraud_probability,
            prediction=tx.prediction,
            surge_score=tx.surge_score,
            temporal_score=tx.temporal_score,
            pattern_score=tx.pattern_score,
            risk_score=tx.risk_score,
            risk_level=tx.risk_level,
            decision=tx.decision,
            reasons=tx.reasons if isinstance(tx.reasons, list) else (tx.reasons or [])
        )
    except HTTPException:
        raise
    except SQLAlchemyError as db_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database query failure: Unable to fetch transaction details from MySQL."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transaction record: {str(e)}"
        )
