"""
Surge Intelligence & Temporal Analysis Service for SurgeShield AI.
Calculates real-time transaction activity spikes, rolling baselines, and temporal anomaly indicators.
"""

from typing import Dict, Any, List, Tuple
from collections import deque
import numpy as np
import pandas as pd

from backend.app.core.config import settings


class SurgeService:
    """
    Stateful rolling window processor for tracking transaction volume surges and temporal patterns.
    """
    
    def __init__(self, window_seconds: float = settings.SURGE_WINDOW_SECONDS):
        self.window_seconds = window_seconds
        # Deque storing transaction timestamps (seconds)
        self.timestamps: deque = deque()
        self.total_processed_count: int = 0
        self.first_tx_time: float = 0.0
        self.last_tx_time: float = 0.0

    def record_transaction(self, tx_time: float) -> None:
        """Appends transaction timestamp and trims window."""
        if self.total_processed_count == 0:
            self.first_tx_time = tx_time
        self.last_tx_time = max(self.last_tx_time, tx_time)
        self.timestamps.append(tx_time)
        self.total_processed_count += 1
        
        # Evict transactions older than window_seconds relative to current tx_time
        min_time = tx_time - self.window_seconds
        while self.timestamps and self.timestamps[0] < min_time:
            self.timestamps.popleft()

    def analyze_surge(self, tx_time: float, fraud_prob: float = 0.0) -> Dict[str, Any]:
        """
        Analyzes volume surge metrics and categorizes high volume as Genuine vs Suspicious.
        
        Args:
            tx_time: Timestamp of current transaction in seconds.
            fraud_prob: Fraud probability predicted by ML engine (0.0 to 1.0).
            
        Returns:
            Dictionary containing surge_score, recent_volume, baseline_volume, activity_change_pct, and surge_status.
        """
        self.record_transaction(tx_time)
        
        recent_volume = len(self.timestamps)
        
        # Calculate historical baseline hourly rate
        elapsed_hours = max(1.0, (tx_time - self.first_tx_time) / 3600.0) if self.first_tx_time > 0 else 1.0
        baseline_hourly = max(settings.BASELINE_DEFAULT_RATE, self.total_processed_count / elapsed_hours)
        
        # Volume change percentage
        activity_change_pct = ((recent_volume - baseline_hourly) / baseline_hourly) * 100.0 if baseline_hourly > 0 else 0.0
        
        # Surge score formula: 0 to 100 scale based on volume ratio
        ratio = recent_volume / baseline_hourly if baseline_hourly > 0 else 1.0
        raw_surge_score = min(100.0, max(0.0, (ratio - 1.0) * 50.0))
        surge_score = round(raw_surge_score, 2)
        
        # Distinguish Genuine Surge (high volume + low fraud) from Suspicious Surge (high volume + high fraud)
        if surge_score >= 30.0:
            if fraud_prob >= 0.50:
                status = "Suspicious Surge"
            else:
                status = "Genuine Surge"
        else:
            status = "Normal Volume"
            
        return {
            "surge_score": surge_score,
            "recent_volume": recent_volume,
            "baseline_volume": round(baseline_hourly, 2),
            "activity_change_pct": round(activity_change_pct, 2),
            "surge_status": status
        }

    def analyze_temporal(self, tx_time: float) -> Tuple[float, List[str]]:
        """
        Calculates temporal anomaly score based on hour-of-day transaction patterns.
        
        Args:
            tx_time: Timestamp in seconds.
            
        Returns:
            Tuple of (temporal_score, explanations).
        """
        hour = (tx_time / 3600.0) % 24.0
        reasons = []
        
        # Off-peak hours (1:00 AM to 5:00 AM) represent higher temporal anomaly risk
        if 1.0 <= hour <= 5.0:
            temporal_score = 75.0
            reasons.append(f"Transaction occurred during off-peak hours ({int(hour):02d}:00 AM)")
        elif 0.0 <= hour < 1.0 or 23.0 <= hour < 24.0:
            temporal_score = 45.0
            reasons.append("Transaction occurred during late night hours")
        else:
            temporal_score = 10.0
            
        return round(temporal_score, 2), reasons


# Global service instance
surge_service = SurgeService()
