"""
In-Memory Store Service for SurgeShield AI.
Persists analyzed transaction records and aggregate dashboard statistics during runtime.
"""

from typing import List, Dict, Any
from threading import Lock


class TransactionStore:
    """
    Thread-safe in-memory store for analyzed transactions and metrics.
    """
    
    def __init__(self):
        self._lock = Lock()
        self.transactions: List[Dict[str, Any]] = []
        self.counter: int = 0
        
        # Cumulative stats initialized with benchmark baseline
        self.total_count: int = 0
        self.fraud_count: int = 0
        self.legitimate_count: int = 0
        self.high_risk_count: int = 0
        self.total_risk_sum: float = 0.0
        self.total_amount_sum: float = 0.0
        self.suspicious_amount_sum: float = 0.0

    def add_transaction(
        self, 
        timestamp: float, 
        amount: float, 
        fraud_prob: float, 
        risk_score: float, 
        decision: str,
        risk_level: str
    ) -> Dict[str, Any]:
        with self._lock:
            self.counter += 1
            idx = self.counter
            
            record = {
                "transaction_index": idx,
                "timestamp": timestamp,
                "amount": round(amount, 2),
                "fraud_probability": round(fraud_prob, 4),
                "risk_score": round(risk_score, 2),
                "decision": decision,
                "risk_level": risk_level
            }
            
            self.transactions.append(record)
            
            # Update cumulative metrics
            self.total_count += 1
            if decision == "BLOCK" or fraud_prob >= 0.5:
                self.fraud_count += 1
                self.suspicious_amount_sum += amount
            else:
                self.legitimate_count += 1
                
            if risk_score >= 70.0:
                self.high_risk_count += 1
                
            self.total_risk_sum += risk_score
            self.total_amount_sum += amount
            
            return record

    def get_recent_transactions(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._lock:
            return list(reversed(self.transactions[-limit:]))

    def get_dashboard_summary(self, current_surge_score: float = 0.0) -> Dict[str, Any]:
        with self._lock:
            total = self.total_count
            fraud = self.fraud_count
            legit = self.legitimate_count
            
            fraud_pct = round((fraud / total * 100.0), 2) if total > 0 else 0.0
            avg_risk = round((self.total_risk_sum / total), 2) if total > 0 else 0.0
            
            return {
                "total_transactions": total,
                "fraud_count": fraud,
                "legitimate_count": legit,
                "fraud_percentage": fraud_pct,
                "average_risk": avg_risk,
                "high_risk_count": self.high_risk_count,
                "current_surge_score": current_surge_score,
                "total_amount": round(self.total_amount_sum, 2),
                "suspicious_amount": round(self.suspicious_amount_sum, 2)
            }


# Global store instance
transaction_store = TransactionStore()
