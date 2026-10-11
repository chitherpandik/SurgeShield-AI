"""
ML Fraud Prediction API Endpoint for SurgeShield AI.
Exposes POST /predict to return ML fraud probability and prediction label.
"""

from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.request import TransactionRequest
from backend.app.schemas.response import PredictionResponse
from backend.app.services.ml_service import ml_service

router = APIRouter(tags=["ML Prediction"])


@router.post("/predict", response_model=PredictionResponse, summary="Predict ML Fraud Probability")
def predict_fraud_endpoint(request: TransactionRequest):
    """
    Evaluates raw transaction features using Part 1 ML fraud detection model.
    
    Returns:
    - **fraud_probability**: Fraud score between 0.0 and 1.0.
    - **prediction**: Classification label ("Fraud" or "Legitimate").
    """
    try:
        tx_dict = request.model_dump()
        prob, label = ml_service.predict_fraud(tx_dict)
        return PredictionResponse(fraud_probability=prob, prediction=label)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )
