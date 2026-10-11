"""
Database Repository for SurgeShield AI.
Encapsulates all persistent CRUD queries and statistical aggregations for transactions and metrics.
No raw SQL string queries are exposed directly in API route handlers.
"""

from typing import List, Optional, Dict, Any
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc

from backend.app.db.models import Transaction

logger = logging.getLogger("surgeshield.repository")


class TransactionRepository:
    """
    Data Access Object (DAO) pattern implementation for transaction intelligence entities.
    """

    @staticmethod
    def save_transaction(db: Session, tx_data: Dict[str, Any]) -> Transaction:
        """
        Inserts and commits an evaluated transaction record to MySQL.
        
        Args:
            db: Active SQLAlchemy Session.
            tx_data: Dictionary containing transaction fields.
            
        Returns:
            The saved Transaction ORM instance with populated auto-increment ID.
        """
        transaction = Transaction(
            transaction_time=float(tx_data["transaction_time"]),
            amount=float(tx_data["amount"]),
            fraud_probability=float(tx_data["fraud_probability"]),
            prediction=str(tx_data["prediction"]),
            surge_score=float(tx_data["surge_score"]),
            temporal_score=float(tx_data["temporal_score"]),
            pattern_score=float(tx_data["pattern_score"]),
            risk_score=float(tx_data["risk_score"]),
            risk_level=str(tx_data["risk_level"]),
            decision=str(tx_data["decision"]),
            reasons=tx_data["reasons"]
        )
        try:
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            return transaction
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving transaction to MySQL: {str(e)}")
            raise e

    @staticmethod
    def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
        """
        Fetches a single transaction by its primary key ID.
        
        Args:
            db: Active SQLAlchemy Session.
            transaction_id: Primary key integer.
            
        Returns:
            Transaction instance or None if not found.
        """
        return db.query(Transaction).filter(Transaction.id == transaction_id).first()

    @staticmethod
    def get_transactions(db: Session, skip: int = 0, limit: int = 50) -> List[Transaction]:
        """
        Retrieves paginated list of transactions ordered newest-first (descending ID).
        
        Args:
            db: Active SQLAlchemy Session.
            skip: Pagination offset.
            limit: Number of records to return.
            
        Returns:
            List of Transaction ORM instances.
        """
        return (
            db.query(Transaction)
            .order_by(desc(Transaction.id))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_recent_transactions(db: Session, limit: int = 50) -> List[Transaction]:
        """
        Retrieves the most recent N transactions.
        """
        return (
            db.query(Transaction)
            .order_by(desc(Transaction.id))
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_dashboard_statistics(db: Session, current_surge_score: float = 0.0) -> Dict[str, Any]:
        """
        Calculates aggregate dashboard metrics directly via SQL aggregate functions in MySQL.
        
        Returns:
            Aggregated statistics dictionary matching DashboardResponse schema.
        """
        # Execute efficient aggregate query in a single round-trip
        metrics = db.query(
            func.count(Transaction.id).label("total_count"),
            func.sum(case((Transaction.decision == "BLOCK", 1), else_=0)).label("blocked_count"),
            func.sum(case((Transaction.decision == "VERIFY", 1), else_=0)).label("verification_count"),
            func.sum(case((Transaction.decision == "APPROVE", 1), else_=0)).label("approved_count"),
            func.sum(case((Transaction.risk_score >= 70.0, 1), else_=0)).label("high_risk_count"),
            func.sum(case((Transaction.fraud_probability >= 0.5, 1), else_=0)).label("fraud_prob_count"),
            func.avg(Transaction.risk_score).label("avg_risk"),
            func.sum(Transaction.amount).label("total_amount"),
            func.sum(
                case(
                    ((Transaction.decision == "BLOCK") | (Transaction.fraud_probability >= 0.5), Transaction.amount),
                    else_=0.0
                )
            ).label("suspicious_amount")
        ).first()

        total = int(metrics.total_count or 0)
        blocked = int(metrics.blocked_count or 0)
        verified = int(metrics.verification_count or 0)
        approved = int(metrics.approved_count or 0)
        high_risk = int(metrics.high_risk_count or 0)
        fraud_count = blocked  # Blocked cases represent identified fraud
        legitimate_count = int(total - fraud_count if total >= fraud_count else 0)
        
        fraud_pct = round((float(fraud_count) / float(total) * 100.0), 2) if total > 0 else 0.0
        avg_risk = round(float(metrics.avg_risk or 0.0), 2)
        total_amt = round(float(metrics.total_amount or 0.0), 2)
        suspicious_amt = round(float(metrics.suspicious_amount or 0.0), 2)

        return {
            "total_analyzed_transactions": total,
            "total_transactions": total,
            "fraud_count": fraud_count,
            "legitimate_count": legitimate_count,
            "fraud_percentage": fraud_pct,
            "average_risk": avg_risk,
            "high_risk_count": high_risk,
            "blocked_count": blocked,
            "verification_count": verified,
            "approved_count": approved,
            "total_transaction_amount": total_amt,
            "total_amount": total_amt,
            "suspicious_transaction_amount": suspicious_amt,
            "suspicious_amount": suspicious_amt,
            "current_surge_score": round(float(current_surge_score), 2)
        }

    @staticmethod
    def get_risk_summary(db: Session) -> Dict[str, int]:
        """
        Calculates frequency counts categorized by risk levels (LOW, MEDIUM, HIGH)
        and automated decisions (APPROVE, VERIFY, BLOCK).
        
        Returns:
            Dict matching exact RiskSummary format:
            {
                "low_risk": int,
                "medium_risk": int,
                "high_risk": int,
                "approved": int,
                "verified": int,
                "blocked": int
            }
        """
        counts = db.query(
            func.sum(case((Transaction.risk_level == "LOW", 1), else_=0)).label("low_risk"),
            func.sum(case((Transaction.risk_level == "MEDIUM", 1), else_=0)).label("medium_risk"),
            func.sum(case((Transaction.risk_level == "HIGH", 1), else_=0)).label("high_risk"),
            func.sum(case((Transaction.decision == "APPROVE", 1), else_=0)).label("approved"),
            func.sum(case((Transaction.decision == "VERIFY", 1), else_=0)).label("verified"),
            func.sum(case((Transaction.decision == "BLOCK", 1), else_=0)).label("blocked")
        ).first()

        return {
            "low_risk": int(counts.low_risk or 0),
            "medium_risk": int(counts.medium_risk or 0),
            "high_risk": int(counts.high_risk or 0),
            "approved": int(counts.approved or 0),
            "verified": int(counts.verified or 0),
            "blocked": int(counts.blocked or 0)
        }

    @staticmethod
    def get_surge_statistics(db: Session, window_seconds: float = 3600.0) -> Dict[str, Any]:
        """
        Computes volume statistics from database timestamps.
        """
        total = int(db.query(func.count(Transaction.id)).scalar() or 0)
        latest_time = float(db.query(func.max(Transaction.transaction_time)).scalar() or 0.0)
        earliest_time = float(db.query(func.min(Transaction.transaction_time)).scalar() or 0.0)
        
        cutoff = latest_time - window_seconds
        recent_count = int(db.query(func.count(Transaction.id)).filter(Transaction.transaction_time >= cutoff).scalar() or 0)
        
        elapsed_hours = max(1.0, (latest_time - earliest_time) / 3600.0) if latest_time > earliest_time else 1.0
        baseline_rate = max(50.0, float(total) / elapsed_hours)
        
        surge_pct = ((float(recent_count) - baseline_rate) / baseline_rate * 100.0) if baseline_rate > 0 else 0.0
        ratio = float(recent_count) / baseline_rate if baseline_rate > 0 else 1.0
        surge_score = min(100.0, max(0.0, (ratio - 1.0) * 50.0))

        return {
            "total_records": total,
            "recent_volume": recent_count,
            "baseline_volume": round(baseline_rate, 2),
            "surge_percentage": round(surge_pct, 2),
            "surge_score": round(surge_score, 2)
        }


# Global repository instance
repository = TransactionRepository()
