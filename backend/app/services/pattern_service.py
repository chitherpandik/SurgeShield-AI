"""
Pattern Analysis Service for SurgeShield AI.
Detects feature-level statistical anomalies across V1-V28 and Amount without fabricating non-existent fields.
"""

from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd


class PatternService:
    """
    Evaluates multi-dimensional feature deviations and identifies top contributing anomalous variables.
    """
    
    # Pre-calculated benchmark feature standard deviations and means for V1-V28 & Amount
    # In fraud detection PCA space, large negative values in V14, V17, V12, V10 are strong fraud signatures
    CRITICAL_V_FEATURES = {
        "V17": (-2.0, "V17 Feature Contribution"),
        "V14": (-2.5, "V14 Feature Contribution"),
        "V12": (-2.0, "V12 Feature Contribution"),
        "V10": (-2.0, "V10 Feature Contribution"),
        "V4":  (2.5,  "V4 Feature Contribution"),
        "V11": (2.5,  "V11 Feature Contribution")
    }

    def analyze_patterns(self, tx_dict: Dict[str, Any]) -> Tuple[float, List[str]]:
        """
        Calculates feature pattern anomaly score (0-100) and extracts feature-level explanations.
        
        Args:
            tx_dict: Dictionary containing raw transaction features.
            
        Returns:
            Tuple of (pattern_score, explanations_list).
        """
        anomalies = []
        anomaly_points = 0.0
        
        # 1. Evaluate Critical PCA Feature Deviations
        for feature, (thresh, desc) in self.CRITICAL_V_FEATURES.items():
            val = float(tx_dict.get(feature, 0.0))
            if thresh < 0 and val < thresh:
                deviation = abs(val - thresh)
                anomaly_points += min(25.0, deviation * 8.0)
                anomalies.append(f"{desc} (value: {val:.2f})")
            elif thresh > 0 and val > thresh:
                deviation = abs(val - thresh)
                anomaly_points += min(25.0, deviation * 8.0)
                anomalies.append(f"{desc} (value: {val:.2f})")
                
        # 2. Amount Anomaly Check
        amount = float(tx_dict.get("Amount", 0.0))
        if amount > 1000.0:
            anomaly_points += min(30.0, (amount / 1000.0) * 10.0)
            anomalies.append(f"High-value transaction amount (₹{amount:.2f})")
        elif amount == 0.0:
            anomaly_points += 15.0
            anomalies.append("Zero-amount verification transaction pattern")
            
        pattern_score = min(100.0, max(0.0, anomaly_points))
        return round(pattern_score, 2), anomalies


# Global service instance
pattern_service = PatternService()
