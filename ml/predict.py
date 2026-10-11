"""
Prediction module for SurgeShield AI.
Provides high-performance inference for single transactions or batch data.
"""

from pathlib import Path
from typing import Dict, Any, Union, List
import pandas as pd
import numpy as np
import joblib

from ml.config import MODEL_SAVE_PATH, PREDICT_REQUIRED_COLUMNS, DEFAULT_DECISION_THRESHOLD


class FraudPredictor:
    """
    Inference handler for SurgeShield AI ML model.
    Loads saved pipeline artifact and exposes predict_transaction interface.
    """
    
    def __init__(self, model_path: Union[str, Path] = MODEL_SAVE_PATH):
        self.model_path = Path(model_path)
        self.pipeline_artifact = None
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self.load_model()

    def load_model(self) -> None:
        """
        Loads trained model artifact from disk.
        """
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model artifact not found at: {self.model_path.resolve()}")
            
        artifact = joblib.load(self.model_path)
        
        if isinstance(artifact, dict) and "model" in artifact and "preprocessor" in artifact:
            self.model = artifact["model"]
            self.preprocessor = artifact["preprocessor"]
            self.metadata = artifact.get("metadata", {})
        else:
            # Direct scikit-learn/XGBoost Pipeline fallback
            self.model = artifact
            self.preprocessor = None
            
        print(f"FraudPredictor initialized. Loaded model artifact: {self.model_path.name}")

    def validate_input(self, transaction_data: Union[Dict[str, Any], pd.DataFrame, List[Dict[str, Any]]]) -> pd.DataFrame:
        """
        Validates structure and required columns for input transaction data.
        
        Args:
            transaction_data: Dictionary, list of dictionaries, or pandas DataFrame.
            
        Returns:
            Validated pd.DataFrame.
        """
        if isinstance(transaction_data, dict):
            df = pd.DataFrame([transaction_data])
        elif isinstance(transaction_data, list):
            df = pd.DataFrame(transaction_data)
        elif isinstance(transaction_data, pd.DataFrame):
            df = transaction_data.copy()
        else:
            raise TypeError("transaction_data must be a dict, list of dicts, or pandas DataFrame.")
            
        missing_cols = [c for c in PREDICT_REQUIRED_COLUMNS if c not in df.columns]
        if missing_cols:
            raise KeyError(f"Invalid transaction payload: Missing required columns: {missing_cols}")
            
        return df

    def predict_transaction(
        self, 
        transaction_data: Union[Dict[str, Any], pd.DataFrame, List[Dict[str, Any]]], 
        threshold: float = DEFAULT_DECISION_THRESHOLD
    ) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Predicts fraud probability and classification for single transaction or batch.
        
        Args:
            transaction_data: Single transaction dict or batch list/DataFrame.
            threshold: Probability decision threshold (default: 0.5).
            
        Returns:
            Dictionary matching requirement:
            {
                "fraud_probability": 0.91,
                "prediction": "Fraud"
            }
            Or list of dictionaries if batch input provided.
        """
        df_input = self.validate_input(transaction_data)
        
        # Apply preprocessing
        if self.preprocessor is not None:
            X_features = self.preprocessor.transform(df_input)
        else:
            X_features = df_input
            
        # Compute probabilities
        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(X_features)[:, 1]
        else:
            probabilities = self.model.predict(X_features).astype(float)
            
        results = []
        for prob in probabilities:
            prob_val = round(float(prob), 4)
            label = "Fraud" if prob_val >= threshold else "Legitimate"
            results.append({
                "fraud_probability": prob_val,
                "prediction": label
            })
            
        # Return single dictionary if input was a single dict
        if isinstance(transaction_data, dict):
            return results[0]
            
        return results


# Global singleton instance for convenient import/usage
_predictor_instance = None


def predict_transaction(
    transaction_data: Union[Dict[str, Any], pd.DataFrame, List[Dict[str, Any]]], 
    threshold: float = DEFAULT_DECISION_THRESHOLD,
    model_path: Union[str, Path] = MODEL_SAVE_PATH
) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Convenience function for predicting fraud probability on a transaction payload.
    
    Example Output:
    {
        "fraud_probability": 0.91,
        "prediction": "Fraud"
    }
    """
    global _predictor_instance
    if _predictor_instance is None or _predictor_instance.model_path != Path(model_path):
        _predictor_instance = FraudPredictor(model_path=model_path)
        
    return _predictor_instance.predict_transaction(transaction_data, threshold=threshold)
