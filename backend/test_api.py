"""
Automated End-to-End Test Suite for SurgeShield AI FastAPI & MySQL Backend.
Tests all API endpoints, database persistence, transactions retrieval, dashboard metrics,
risk summaries, and surge intelligence.
"""

import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.database import SessionLocal
from backend.app.db.models import Transaction

client = TestClient(app)

SAMPLE_LEGIT = {
    "Time": 100.0,
    "V1": -1.3598, "V2": -0.0728, "V3": 2.5363, "V4": 1.3782,
    "V5": -0.3383, "V6": 0.4624, "V7": 0.2396, "V8": 0.0987,
    "V9": 0.3638, "V10": 0.0908, "V11": -0.5516, "V12": -0.6178,
    "V13": -0.9914, "V14": -0.3112, "V15": 1.4682, "V16": -0.4704,
    "V17": 0.2079, "V18": 0.0258, "V19": 0.4039, "V20": 0.2514,
    "V21": -0.0183, "V22": 0.2778, "V23": -0.1105, "V24": 0.0669,
    "V25": 0.1285, "V26": -0.1891, "V27": 0.1335, "V28": -0.0211,
    "Amount": 149.62
}

SAMPLE_FRAUD = {
    "Time": 406.0,
    "V1": -2.3122, "V2": 1.9519, "V3": -1.6098, "V4": 3.9979,
    "V5": -0.5222, "V6": -1.4265, "V7": -2.5373, "V8": 1.3916,
    "V9": -2.7700, "V10": -2.7722, "V11": 3.2020, "V12": -2.8999,
    "V13": -0.5952, "V14": -4.2892, "V15": 0.3897, "V16": -1.1407,
    "V17": -2.8300, "V18": -0.0168, "V19": 0.4169, "V20": 0.1269,
    "V21": 0.5172, "V22": -0.0350, "V23": -0.4652, "V24": 0.3202,
    "V25": 0.0445, "V26": 0.1778, "V27": 0.2611, "V28": -0.1432,
    "Amount": 0.00
}


def test_e2e_backend():
    print("=" * 70)
    print("         SURGESHIELD AI — PART 3 END-TO-END BACKEND TEST SUITE")
    print("=" * 70)
    
    # 1. Test GET /health (including MySQL database connection status)
    print("\n[Step 1] Testing GET /health...")
    res_health = client.get("/health")
    assert res_health.status_code == 200, f"Health check failed: {res_health.text}"
    health_data = res_health.json()
    assert health_data["status"] == "healthy", f"Service not healthy: {health_data}"
    assert health_data["database"] == "connected", f"Database not connected: {health_data}"
    print(f"  --> Status: {health_data['status']} | Database: {health_data['database']}")

    # 2. Test POST /predict
    print("\n[Step 2] Testing POST /predict...")
    res_predict = client.post("/predict", json=SAMPLE_FRAUD)
    assert res_predict.status_code == 200, f"Predict endpoint failed: {res_predict.text}"
    pred_data = res_predict.json()
    assert "fraud_probability" in pred_data and "prediction" in pred_data
    print(f"  --> Prediction: {pred_data['prediction']} | Fraud Prob: {pred_data['fraud_probability']}")

    # 3. Test POST /analyze (Legitimate payload)
    print("\n[Step 3] Testing POST /analyze (Legitimate Transaction)...")
    res_analyze_legit = client.post("/analyze", json=SAMPLE_LEGIT)
    assert res_analyze_legit.status_code == 200, f"Analyze legit failed: {res_analyze_legit.text}"
    legit_data = res_analyze_legit.json()
    legit_id = legit_data.get("transaction_id")
    assert legit_id is not None, "transaction_id was not returned in /analyze response"
    print(f"  --> ID: {legit_id} | Decision: {legit_data['decision']} | Risk Score: {legit_data['risk_score']} | Risk Level: {legit_data['risk_level']}")

    # 4. Test POST /analyze (Fraudulent payload)
    print("\n[Step 4] Testing POST /analyze (Fraudulent Transaction)...")
    res_analyze_fraud = client.post("/analyze", json=SAMPLE_FRAUD)
    assert res_analyze_fraud.status_code == 200, f"Analyze fraud failed: {res_analyze_fraud.text}"
    fraud_data = res_analyze_fraud.json()
    fraud_id = fraud_data.get("transaction_id")
    assert fraud_id is not None, "transaction_id was not returned in /analyze response"
    print(f"  --> ID: {fraud_id} | Decision: {fraud_data['decision']} | Risk Score: {fraud_data['risk_score']} | Risk Level: {fraud_data['risk_level']}")
    print(f"      Reasons: {fraud_data['reasons']}")

    # 5. Verify direct persistence in MySQL Database
    print("\n[Step 5] Confirming records exist in MySQL database table...")
    db = SessionLocal()
    try:
        tx_legit_db = db.query(Transaction).filter(Transaction.id == legit_id).first()
        tx_fraud_db = db.query(Transaction).filter(Transaction.id == fraud_id).first()
        assert tx_legit_db is not None, f"Legitimate transaction {legit_id} not found in MySQL"
        assert tx_fraud_db is not None, f"Fraudulent transaction {fraud_id} not found in MySQL"
        assert tx_fraud_db.decision == "BLOCK"
        print(f"  --> Confirmed in MySQL: Record #{tx_legit_db.id} (Amt: ${tx_legit_db.amount:.2f}, Decision: {tx_legit_db.decision})")
        print(f"  --> Confirmed in MySQL: Record #{tx_fraud_db.id} (Amt: ${tx_fraud_db.amount:.2f}, Decision: {tx_fraud_db.decision})")
    finally:
        db.close()

    # 6. Test GET /transactions
    print("\n[Step 6] Testing GET /transactions (Newest First)...")
    res_tx = client.get("/transactions?limit=10")
    assert res_tx.status_code == 200, f"Transactions list failed: {res_tx.text}"
    tx_list = res_tx.json()
    assert len(tx_list) >= 2, f"Expected at least 2 transactions, got {len(tx_list)}"
    # Verify newest first ordering
    assert tx_list[0]["id"] >= tx_list[1]["id"], "Transactions are not ordered newest first"
    print(f"  --> Fetched {len(tx_list)} transactions from MySQL. Latest ID: {tx_list[0]['id']}")

    # 7. Test GET /transactions/{id}
    print(f"\n[Step 7] Testing GET /transactions/{fraud_id}...")
    res_single = client.get(f"/transactions/{fraud_id}")
    assert res_single.status_code == 200, f"Get transaction by ID failed: {res_single.text}"
    single_data = res_single.json()
    assert single_data["id"] == fraud_id
    assert single_data["decision"] == "BLOCK"
    assert "reasons" in single_data and len(single_data["reasons"]) > 0
    print(f"  --> Details: ID={single_data['id']}, Decision={single_data['decision']}, Reasons Count={len(single_data['reasons'])}")

    # Test 404 on non-existent transaction
    res_404 = client.get("/transactions/99999999")
    assert res_404.status_code == 404, f"Expected 404 for missing ID, got {res_404.status_code}"
    print(f"  --> Verified 404 response for non-existent ID (HTTP 404)")

    # 8. Test GET /dashboard
    print("\n[Step 8] Testing GET /dashboard (MySQL Aggregates)...")
    res_dash = client.get("/dashboard")
    assert res_dash.status_code == 200, f"Dashboard failed: {res_dash.text}"
    dash_data = res_dash.json()
    assert dash_data["total_analyzed_transactions"] >= 2
    assert "fraud_count" in dash_data
    assert "legitimate_count" in dash_data
    assert "total_transaction_amount" in dash_data
    print(f"  --> Total Analyzed: {dash_data['total_analyzed_transactions']} | Fraud Count: {dash_data['fraud_count']} | Approved: {dash_data['approved_count']}")
    print(f"      Avg Risk: {dash_data['average_risk']} | Total Amount: ${dash_data['total_transaction_amount']:.2f} | Suspicious Amount: ${dash_data['suspicious_transaction_amount']:.2f}")

    # 9. Test GET /risk-summary
    print("\n[Step 9] Testing GET /risk-summary (Risk Breakdown & Decisions)...")
    res_risk = client.get("/risk-summary")
    assert res_risk.status_code == 200, f"Risk summary failed: {res_risk.text}"
    risk_data = res_risk.json()
    assert "low_risk" in risk_data and "medium_risk" in risk_data and "high_risk" in risk_data
    assert "approved" in risk_data and "verified" in risk_data and "blocked" in risk_data
    print(f"  --> Risk Categories: Low={risk_data['low_risk']}, Medium={risk_data['medium_risk']}, High={risk_data['high_risk']}")
    print(f"  --> Decisions: Approved={risk_data['approved']}, Verified={risk_data['verified']}, Blocked={risk_data['blocked']}")

    # 10. Test GET /surge
    print("\n[Step 10] Testing GET /surge (Real-time baseline & activity)...")
    res_surge_get = client.get("/surge")
    assert res_surge_get.status_code == 200, f"GET /surge failed: {res_surge_get.text}"
    surge_get_data = res_surge_get.json()
    assert "baseline_activity" in surge_get_data and "surge_score" in surge_get_data and "surge_status" in surge_get_data
    print(f"  --> Baseline: {surge_get_data['baseline_activity']}/hr | Recent Volume: {surge_get_data['current_activity']} | Surge Score: {surge_get_data['surge_score']} ({surge_get_data['surge_status']})")

    # 11. Test POST /surge
    print("\n[Step 11] Testing POST /surge (Transaction-specific surge)...")
    res_surge_post = client.post("/surge", json=SAMPLE_LEGIT)
    assert res_surge_post.status_code == 200, f"POST /surge failed: {res_surge_post.text}"
    surge_post_data = res_surge_post.json()
    print(f"  --> Surge Score: {surge_post_data['surge_score']} | Status: {surge_post_data['surge_status']}")

    print("\n" + "=" * 70)
    print("       ALL 11 INTEGRATION & DATABASE TESTS PASSED PERFECTLY!")
    print("=" * 70)


if __name__ == "__main__":
    test_e2e_backend()
