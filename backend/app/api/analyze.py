"""
Main Real-Time Intelligence API Endpoint for SurgeShield AI.
Exposes POST /analyze combining ML, surge detection, temporal analysis, pattern scoring,
risk engine, decision engine, and persistent storage in MySQL.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from backend.app.schemas.request import TransactionRequest
from backend.app.schemas.response import AnalysisResponse
from backend.app.services.ml_service import ml_service
from backend.app.services.surge_service import surge_service
from backend.app.services.pattern_service import pattern_service
from backend.app.services.risk_service import risk_service
from backend.app.services.decision_service import decision_service
from backend.app.db.database import get_db
from backend.app.db.repository import repository

router = APIRouter(tags=["Intelligence Engine"])


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Perform Full Real-Time Fraud & Surge Analysis with MySQL Persistence"
)
def analyze_transaction_endpoint(
    request: TransactionRequest,
    db: Session = Depends(get_db)
):
    """
    Executes end-to-end real-time fraud intelligence pipeline:
    1. **Validate Input**: Validates schema via Pydantic model.
    2. **ML Fraud Prediction**: Calculates probability via trained XGBoost/RF artifact.
    3. **Surge Intelligence**: Analyzes transaction timestamp against rolling volume baseline.
    4. **Temporal Anomaly Analysis**: Evaluates cyclical time and off-peak risk factors.
    5. **Pattern Anomaly Analysis**: Analyzes PCA feature deviations and monetary amounts.
    6. **Composite Risk Engine**: Computes weighted 0-100 risk score.
    7. **Automated Decision Engine**: Classifies as APPROVE, VERIFY, or BLOCK with risk level.
    8. **Transparent Explainability**: Extracts clear, human-readable decision factors.
    9. **MySQL Persistence**: Stores full analysis record in `transactions` table.
    10. **API Response**: Returns complete decision intelligence to caller.
    """
    try:
        tx_dict = request.model_dump()
        
        # 1. ML Prediction
        fraud_prob, prediction_label = ml_service.predict_fraud(tx_dict)
        
        # 2. Surge Intelligence Analysis
        surge_info = surge_service.analyze_surge(tx_dict["Time"], fraud_prob)
        surge_score = surge_info["surge_score"]
        
        # 3. Temporal Anomaly Analysis
        temporal_score, temp_reasons = surge_service.analyze_temporal(tx_dict["Time"])
        
        # 4. Pattern Anomaly Analysis
        pattern_score, pattern_reasons = pattern_service.analyze_patterns(tx_dict)
        
        # 5. Composite Risk Engine Calculation
        risk_score = risk_service.calculate_risk(
            fraud_prob=fraud_prob,
            surge_score=surge_score,
            temporal_score=temporal_score,
            pattern_score=pattern_score
        )
        
        # 6. Automated Decision & Explainability
        decision, risk_level, reasons = decision_service.evaluate_decision(
            risk_score=risk_score,
            fraud_prob=fraud_prob,
            surge_info=surge_info,
            temporal_reasons=temp_reasons,
            pattern_reasons=pattern_reasons
        )
        
        # 7. Persist to MySQL Database via Repository
        saved_record = repository.save_transaction(
            db=db,
            tx_data={
                "transaction_time": tx_dict["Time"],
                "amount": tx_dict["Amount"],
                "fraud_probability": fraud_prob,
                "prediction": prediction_label,
                "surge_score": surge_score,
                "temporal_score": temporal_score,
                "pattern_score": pattern_score,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "decision": decision,
                "reasons": reasons
            }
        )
        
        return AnalysisResponse(
            transaction_id=saved_record.id,
            fraud_probability=fraud_prob,
            prediction=prediction_label,
            surge_score=surge_score,
            temporal_score=temporal_score,
            pattern_score=pattern_score,
            risk_score=risk_score,
            risk_level=risk_level,
            decision=decision,
            reasons=reasons
        )
        
    except SQLAlchemyError as db_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistence failure: Unable to store transaction analysis in MySQL."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline error: {str(e)}"
        )
