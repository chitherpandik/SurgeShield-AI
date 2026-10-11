"""
ML Inference Service for SurgeShield AI.
Loads pre-trained model artifact and preprocessor pipeline without retraining.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np
import joblib

from backend.app.core.config import settings


class MLService:
    """
    Singleton service wrapper around saved Part 1 ML fraud detection pipeline.
    """
    
    def __init__(self, model_path: Path = settings.MODEL_PATH):
        self.model_path = Path(model_path)
        self.model = None
        self.preprocessor = None
        self.metadata = {}
        self._load_artifact()

    def _load_artifact(self) -> None:
        """Loads saved joblib artifact from disk."""
        if not self.model_path.exists():
            raise FileNotFoundError(f"ML Model artifact not found at: {self.model_path.resolve()}")
            
        artifact = joblib.load(self.model_path)
        if isinstance(artifact, dict) and "model" in artifact and "preprocessor" in artifact:
            self.model = artifact["model"]
            self.preprocessor = artifact["preprocessor"]
            self.metadata = artifact.get("metadata", {})
        else:
            self.model = artifact
            self.preprocessor = None
            
        print(f"MLService initialized successfully. Model path: {self.model_path.name}")

    def predict_fraud(self, transaction_dict: Dict[str, Any], threshold: float = 0.5) -> Tuple[float, str]:
        """
        Calculates fraud probability and classification for a transaction dictionary.
        
        Args:
            transaction_dict: Dictionary containing raw transaction numerical features.
            threshold: Probability decision threshold (default: 0.5).
            
        Returns:
            Tuple of (fraud_probability, prediction_label).
        """
        df_input = pd.DataFrame([transaction_dict])
        
        if self.preprocessor is not None:
            X_features = self.preprocessor.transform(df_input)
        else:
            X_features = df_input
            
        if hasattr(self.model, "predict_proba"):
            prob = float(self.model.predict_proba(X_features)[0, 1])
        else:
            prob = float(self.model.predict(X_features)[0])
            
        prob_val = round(prob, 4)
        prediction = "Fraud" if prob_val >= threshold else "Legitimate"
        
        return prob_val, prediction


# Global service instance
ml_service = MLService()
