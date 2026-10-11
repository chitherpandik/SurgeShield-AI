"""
Risk Scoring Engine for SurgeShield AI.
Calculates a weighted composite risk score combining ML, surge, temporal, and pattern indicators.
"""

from typing import Dict, Any, Tuple
from backend.app.core.config import settings


class RiskService:
    """
    Combines individual indicator sub-scores into a final 0-100 risk score using configurable prototype weights.
    """
    
    def __init__(
        self,
        w_ml: float = settings.WEIGHT_ML,
        w_surge: float = settings.WEIGHT_SURGE,
        w_temp: float = settings.WEIGHT_TEMPORAL,
        w_pattern: float = settings.WEIGHT_PATTERN
    ):
        self.w_ml = w_ml
        self.w_surge = w_surge
        self.w_temp = w_temp
        self.w_pattern = w_pattern

    def calculate_risk(
        self, 
        fraud_prob: float, 
        surge_score: float, 
        temporal_score: float, 
        pattern_score: float
    ) -> float:
        """
        Calculates composite risk score (0.0 to 100.0).
        
        Formula:
        Risk = (w_ml * (fraud_prob * 100)) + (w_surge * surge_score) + (w_temp * temporal_score) + (w_pattern * pattern_score)
        
        Args:
            fraud_prob: Probability from ML model (0.0 to 1.0).
            surge_score: Volume surge indicator (0.0 to 100.0).
            temporal_score: Temporal anomaly score (0.0 to 100.0).
            pattern_score: Feature pattern anomaly score (0.0 to 100.0).
            
        Returns:
            Weighted risk score between 0.0 and 100.0 rounded to 2 decimal places.
        """
        ml_risk = fraud_prob * 100.0
        
        raw_score = (
            (self.w_ml * ml_risk) +
            (self.w_surge * surge_score) +
            (self.w_temp * temporal_score) +
            (self.w_pattern * pattern_score)
        )
        
        final_score = min(100.0, max(0.0, raw_score))
        return round(final_score, 2)


# Global service instance
risk_service = RiskService()
