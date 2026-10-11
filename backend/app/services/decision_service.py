"""
Decision Engine & Explainability Service for SurgeShield AI.
Maps composite risk scores to automated decisions (APPROVE, VERIFY, BLOCK) and aggregates transparent reasons.
"""

from typing import Dict, Any, List, Tuple
from backend.app.core.config import settings


class DecisionService:
    """
    Evaluates composite risk against configurable thresholds and generates explainability reports.
    """
    
    def __init__(
        self,
        low_threshold: float = settings.LOW_RISK_THRESHOLD,
        high_threshold: float = settings.HIGH_RISK_THRESHOLD
    ):
        self.low_threshold = low_threshold
        self.high_threshold = high_threshold

    def evaluate_decision(
        self, 
        risk_score: float,
        fraud_prob: float,
        surge_info: Dict[str, Any],
        temporal_reasons: List[str],
        pattern_reasons: List[str]
    ) -> Tuple[str, str, List[str]]:
        """
        Determines automated action, qualitative risk level, and aggregated explainability reasons.
        
        Args:
            risk_score: Composite risk score (0-100).
            fraud_prob: ML fraud probability (0-1).
            surge_info: Surge analysis dictionary.
            temporal_reasons: List of temporal anomaly strings.
            pattern_reasons: List of pattern anomaly strings.
            
        Returns:
            Tuple of (decision, risk_level, reasons_list).
        """
        # Determine decision & risk level
        if risk_score < self.low_threshold:
            decision = "APPROVE"
            risk_level = "LOW"
        elif risk_score >= self.high_threshold:
            decision = "BLOCK"
            risk_level = "HIGH"
        else:
            decision = "VERIFY"
            risk_level = "MEDIUM"
            
        # Aggregate explainability reasons
        reasons = []
        
        if fraud_prob >= 0.70:
            reasons.append(f"High ML fraud probability ({fraud_prob:.2f})")
        elif fraud_prob >= 0.30:
            reasons.append(f"Moderate ML fraud probability ({fraud_prob:.2f})")
            
        if surge_info.get("surge_score", 0) >= 30.0:
            status = surge_info.get("surge_status", "High Volume")
            change = surge_info.get("activity_change_pct", 0)
            reasons.append(f"Transaction activity is {change:+.1f}% above rolling baseline ({status})")
            
        for reason in temporal_reasons:
            reasons.append(reason)
            
        for reason in pattern_reasons:
            reasons.append(reason)
            
        if not reasons:
            reasons.append("Normal transaction activity matching baseline patterns")
            
        return decision, risk_level, reasons


# Global service instance
decision_service = DecisionService()
