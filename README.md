# SurgeShield AI — Adaptive Fraud Intelligence System

SurgeShield AI is a high-performance, real-time banking fraud intelligence system designed to distinguish legitimate high-volume transaction surges (such as holiday promotions or flash sales) from coordinated, malicious fraudulent transaction activity.

---

## 1. Project Architecture

## 1. Project Architecture

SurgeShield AI uses a multi-engine architecture to analyze banking transactions, detect potential fraud, evaluate transaction surges, calculate composite risk, and support automated transaction decisions.

### System Workflow

![SurgeShield AI Architecture](reports/surgeshield-architecture.png)

**Architecture flow:**

1. **Banking Transaction Data:** Receives transaction features.
2. **Data Processing:** Cleans data and prepares features.
3. **ML Fraud Detection:** Uses the trained fraud classification model.
4. **Intelligence Engines:** Performs surge intelligence, temporal analysis, and pattern analysis.
5. **Risk Intelligence:** Combines available risk indicators into a risk assessment.
6. **Decision Engine:** Produces a configured transaction decision.
7. **MySQL and FastAPI:** Stores results and returns API responses.
8. **React Frontend:** Displays dashboards, transactions, and risk analysis.

## 2. Part 1: ML Fraud Detection Engine

Part 1 implements an end-to-end, reproducible machine learning pipeline engineered specifically to handle extreme class imbalance without data leakage:
- **Dataset**: Kaggle Credit Card Fraud Detection dataset (284,807 rows: 284,315 legitimate, 492 fraud cases, ~578:1 ratio).
- **Data Cleaning**: Deduplicated 1,081 identical rows to prevent leakage between train and test splits (leaving 283,726 unique rows).
- **Feature Engineering**: Cyclical trigonometric time encoding (`Hour_sin`, `Hour_cos`), log monetary transformation (`Amount_log`), and `RobustScaler` preprocessing.
- **Class Imbalance Handling**: Cost-sensitive objective loss scaling using `scale_pos_weight` in XGBoost and `class_weight='balanced'` in Random Forest.
- **Artifact**: Exported winning model and preprocessing pipeline to `models/fraud_model.pkl`.

---

## 3. Part 2: FastAPI Real-Time Multi-Indicator Engine

Part 2 introduces a modular microservice architecture combining multiple specialized detection layers:
- **`MLService`**: Sub-millisecond fraud probability inference from pre-trained model artifact.
- **`SurgeService`**: Rolling-window volume tracker comparing current velocity to historical baseline rates (distinguishing **Genuine Surges** from **Suspicious Surges**).
- **`Temporal Analysis`**: Identifies off-peak risk factors (e.g., 1:00 AM – 5:00 AM off-peak hours).
- **`PatternService`**: Detects multi-dimensional statistical deviations across critical PCA components (`V17`, `V14`, `V12`, `V10`, `V4`, `V11`) and transaction amount anomalies.
- **`RiskService`**: Weighted composite scoring engine (`Risk = 0.50×ML + 0.15×Surge + 0.15×Temporal + 0.20×Pattern`).
- **`DecisionService`**: Transparent decision classification (`APPROVE`, `VERIFY`, `BLOCK`) with human-readable explainability reasons.

---

## 4. Part 3: MySQL Persistent Storage Layer

Part 3 integrates a persistent relational MySQL database layer using **SQLAlchemy** and **PyMySQL**:
- **`backend/app/db/database.py`**: SQLAlchemy engine with connection pooling (`pool_pre_ping=True`, `pool_recycle=3600`), sessionmaker, `get_db` dependency injection, and safe health check probing.
- **`backend/app/db/models.py`**: `Transaction` ORM model storing complete analytical telemetry (`id`, `created_at`, `transaction_time`, `amount`, `fraud_probability`, `prediction`, `surge_score`, `temporal_score`, `pattern_score`, `risk_score`, `risk_level`, `decision`, `reasons`).
- **`backend/app/db/repository.py`**: Encapsulated data access layer (DAO) executing transactional CRUD operations and single-query SQL aggregations.
- **`backend/app/db/init_db.py`**: Standalone migration script initializing database tables safely without data loss.

---

## 5. Technology Stack

- **Framework**: FastAPI (Python 3.11+)
- **Validation**: Pydantic v2 & Pydantic-Settings
- **ORM & Driver**: SQLAlchemy 2.0+ & PyMySQL
- **Database**: MySQL 8.0+
- **Machine Learning**: Scikit-Learn, XGBoost, NumPy, Pandas, Joblib
- **Testing**: FastAPI TestClient, Pytest, HTTPX

---

## 6. Directory Structure

```
surgeshield-ai/
├── .env                       # Local environment variables (git-ignored)
├── .env.example               # Configuration template
├── .gitignore                 # Version control exclusions
├── requirements.txt           # Python package dependencies
├── README.md                  # Comprehensive system documentation
│
├── data/
│   └── transactions.csv       # Benchmark transaction dataset
│
├── ml/
│   ├── config.py              # ML paths, seeds, and schemas
│   ├── data_loader.py         # Dataset inspection and cleaning
│   ├── feature_engineering.py # Cyclical time & log scaling
│   ├── preprocessing.py       # Scaler fit/transform pipeline
│   ├── train_baseline.py      # Random Forest trainer
│   ├── train_xgboost.py       # XGBoost classifier trainer
│   ├── evaluate.py           # Evaluation metrics & PR-AUC curves
│   ├── predict.py             # Inference interface
│   └── train_pipeline.py      # End-to-end model training orchestration
│
├── models/
│   └── fraud_model.pkl        # Production model artifact
│
├── backend/
│   ├── test_api.py            # Automated end-to-end API test suite
│   └── app/
│       ├── main.py            # FastAPI entrypoint & router assembly
│       ├── core/
│       │   └── config.py      # Settings, weights & environment loading
│       ├── db/
│       │   ├── __init__.py    # DB module exports
│       │   ├── database.py    # Engine, sessionmaker & get_db dependency
│       │   ├── models.py      # SQLAlchemy Transaction model
│       │   ├── repository.py  # Data access object & SQL aggregations
│       │   └── init_db.py     # Database table initialization script
│       ├── schemas/
│       │   ├── request.py     # Pydantic input validation schemas
│       │   └── response.py    # Pydantic output serialization schemas
│       ├── services/
│       │   ├── ml_service.py       # Model artifact inference wrapper
│       │   ├── surge_service.py    # Rolling baseline volume calculator
│       │   ├── pattern_service.py  # Statistical PCA anomaly detector
│       │   ├── risk_service.py     # Weighted composite risk scoring
│       │   └── decision_service.py # Automated decision & explainability
│       └── api/
│           ├── predict.py      # POST /predict
│           ├── analyze.py      # POST /analyze
│           ├── transactions.py  # GET /transactions & GET /transactions/{id}
│           ├── dashboard.py    # GET /dashboard
│           ├── risk_summary.py # GET /risk-summary
│           └── surge.py        # GET /surge & POST /surge
```

---

## 7. Installation & Setup Guide

### Step 1: Install MySQL & Create Database
Ensure MySQL Server 8.0+ is running locally on port `3306`:

```sql
CREATE DATABASE surgeshield;
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and set your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```ini
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@127.0.0.1:3306/surgeshield
PROJECT_NAME="SurgeShield AI — Real-Time Fraud Intelligence Engine"
VERSION="1.0.0"
DEBUG=False
```
*(Note: If your password contains special characters such as `@`, URL-encode them, e.g., `@` becomes `%40`)*.

### Step 3: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Initialize MySQL Database Tables
Run the database migration script:

```bash
python -m backend.app.db.init_db
```
Output:
```
[SUCCESS] MySQL database tables created / verified successfully.
          Registered tables: ['transactions']
```

---

## 8. Running the Backend Server

Start the high-performance ASGI server:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

The API will be live at `http://127.0.0.1:8000`.

### Interactive Swagger UI Documentation
Open your browser and navigate to:
```
http://127.0.0.1:8000/docs
```
Interactive OpenAPI / Redoc documentation is available at `http://127.0.0.1:8000/redoc`.

---

## 9. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/health` | Service health status and MySQL database connectivity probe |
| **POST** | `/predict` | Raw ML model fraud probability inference |
| **POST** | `/analyze` | Full multi-indicator analysis, decisioning, and MySQL persistence |
| **GET** | `/transactions` | Paginated list of analyzed transactions from MySQL (newest first) |
| **GET** | `/transactions/{id}` | Complete analysis record and explainability for a specific ID |
| **GET** | `/dashboard` | Real-time aggregate statistics computed via SQL from MySQL |
| **GET** | `/risk-summary` | Distribution counts by risk level (LOW/MED/HIGH) and decision |
| **GET** | `/surge` | Current rolling activity baseline and surge intensity status |
| **POST** | `/surge` | Transaction-specific volume surge evaluation |

---

## 10. Example API Requests & Responses

### 1. Check Service & Database Health
**Request:**
```bash
curl -X GET "http://127.0.0.1:8000/health"
```
**Response:**
```json
{
  "status": "healthy",
  "service": "SurgeShield AI",
  "database": "connected"
}
```

---

### 2. Full Multi-Indicator Analysis (`POST /analyze`)
**Request:**
```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "Time": 406.0,
       "V1": -2.3122, "V2": 1.9519, "V3": -1.6098, "V4": 3.9979,
       "V5": -0.5222, "V6": -1.4265, "V7": -2.5373, "V8": 1.3916,
       "V9": -2.7700, "V10": -2.7722, "V11": 3.2020, "V12": -2.8999,
       "V13": -0.5952, "V14": -4.2892, "V15": 0.3897, "V16": -1.1407,
       "V17": -2.8300, "V18": -0.0168, "V19": 0.4169, "V20": 0.1269,
       "V21": 0.5172, "V22": -0.0350, "V23": -0.4652, "V24": 0.3202,
       "V25": 0.0445, "V26": 0.1778, "V27": 0.2611, "V28": -0.1432,
       "Amount": 0.00
     }'
```
**Response:**
```json
{
  "transaction_id": 1,
  "fraud_probability": 0.9998,
  "prediction": "Fraud",
  "surge_score": 0.0,
  "temporal_score": 45.0,
  "pattern_score": 66.86,
  "risk_score": 70.13,
  "risk_level": "HIGH",
  "decision": "BLOCK",
  "reasons": [
    "High ML fraud probability (1.00)",
    "Transaction occurred during late night hours",
    "V17 model contribution (value: -2.83)",
    "V14 model contribution (value: -4.29)",
    "V12 model contribution (value: -2.90)",
    "V10 model contribution (value: -2.77)",
    "V4 model contribution (value: 4.00)",
    "V11 model contribution (value: 3.20)",
    "Zero-amount verification transaction pattern"
  ]
}
```

---

### 3. Retrieve Transactions History (`GET /transactions`)
**Request:**
```bash
curl -X GET "http://127.0.0.1:8000/transactions?limit=10"
```
**Response:**
```json
[
  {
    "id": 1,
    "transaction_time": 406.0,
    "amount": 0.0,
    "fraud_probability": 0.9998,
    "risk_score": 70.13,
    "risk_level": "HIGH",
    "decision": "BLOCK",
    "created_at": "2026-09-29T03:14:14"
  }
]
```

---

### 4. Get Detailed Transaction (`GET /transactions/{id}`)
**Request:**
```bash
curl -X GET "http://127.0.0.1:8000/transactions/1"
```
**Response:**
```json
{
  "id": 1,
  "created_at": "2026-09-29T03:14:14",
  "transaction_time": 406.0,
  "amount": 0.0,
  "fraud_probability": 0.9998,
  "prediction": "Fraud",
  "surge_score": 0.0,
  "temporal_score": 45.0,
  "pattern_score": 66.86,
  "risk_score": 70.13,
  "risk_level": "HIGH",
  "decision": "BLOCK",
  "reasons": [
    "High ML fraud probability (1.00)",
    "Transaction occurred during late night hours",
    "V17 model contribution (value: -2.83)",
    "V14 model contribution (value: -4.29)",
    "Zero-amount verification transaction pattern"
  ]
}
```

---

### 5. Executive Dashboard Aggregates (`GET /dashboard`)
**Request:**
```bash
curl -X GET "http://127.0.0.1:8000/dashboard"
```
**Response:**
```json
{
  "total_analyzed_transactions": 25,
  "fraud_count": 5,
  "legitimate_count": 20,
  "fraud_percentage": 20.0,
  "average_risk": 24.35,
  "high_risk_count": 5,
  "blocked_count": 5,
  "verification_count": 2,
  "approved_count": 18,
  "total_transaction_amount": 3480.50,
  "suspicious_transaction_amount": 450.00,
  "current_surge_score": 0.0
}
```

---

### 6. Risk Breakdown & Decision Distribution (`GET /risk-summary`)
**Request:**
```bash
curl -X GET "http://127.0.0.1:8000/risk-summary"
```
**Response:**
```json
{
  "low_risk": 18,
  "medium_risk": 2,
  "high_risk": 5,
  "approved": 18,
  "verified": 2,
  "blocked": 5
}
```

---

### 7. Real-Time Surge Intelligence Status (`GET /surge`)
**Request:**
```bash
curl -X GET "http://127.0.0.1:8000/surge"
```
**Response:**
```json
{
  "baseline_activity": 50.0,
  "current_activity": 25,
  "surge_percentage": -50.0,
  "surge_score": 0.0,
  "surge_status": "Normal Volume"
}
```

---

## 11. Automated Testing Procedure

Run the automated test suite to verify all endpoints, database persistence, and queries:

```bash
python backend/test_api.py
```

### Test Suite Execution Sequence:
1. `GET /health`: Verifies status is `healthy` and database is `connected`.
2. `POST /predict`: Tests raw ML inference.
3. `POST /analyze` (Legit): Validates approved low-risk transaction workflow and persistence.
4. `POST /analyze` (Fraud): Validates blocked high-risk transaction workflow, explainability reasons, and persistence.
5. MySQL Verification: Direct database query to verify persisted records.
6. `GET /transactions`: Checks paginated retrieval ordered newest-first.
7. `GET /transactions/{id}`: Validates full detail retrieval and tests 404 response for missing IDs.
8. `GET /dashboard`: Tests live SQL metric aggregations.
9. `GET /risk-summary`: Tests risk level and decision counts from MySQL.
10. `GET /surge` & `POST /surge`: Validates real-time baseline and surge scoring.

---

## 12. Known Limitations & Domain Boundary Rules

1. **Dataset Scope**: The Kaggle dataset features `V1`–`V28` are anonymized PCA components. In accordance with strict data integrity rules, no non-existent banking fields (`account_id`, `merchant_id`, `device_id`, `location`, `bank_id`) are fabricated.
2. **Surge Interpretation**: High transaction volume does not imply fraud. Legitimate volume surges (flash sales, marketing campaigns) are differentiated from fraud attacks using multi-factor PCA and ML risk signals.
3. **Prototype Risk Calibration**: Risk scoring weights (`50% ML`, `15% Surge`, `15% Temporal`, `20% Pattern`) and decision thresholds are configurable prototype parameters for risk governance demonstration.
