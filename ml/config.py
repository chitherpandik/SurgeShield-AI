"""
Configuration module for SurgeShield AI ML pipeline.
Defines file paths, schema requirements, random seeds, and hyperparameter settings.
"""

import os
from pathlib import Path

# Path definitions (dynamic resolution relative to project root)
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_PATH = DATA_DIR / "transactions.csv"

MODELS_DIR = BASE_DIR / "models"
MODEL_SAVE_PATH = MODELS_DIR / "fraud_model.pkl"

REPORTS_DIR = BASE_DIR / "reports"

# Dataset schema validation parameters
REQUIRED_COLUMNS = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount", "Class"]
PREDICT_REQUIRED_COLUMNS = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount"]

TIME_COL = "Time"
AMOUNT_COL = "Amount"
TARGET_COL = "Class"

# Train/Test split parameters
TEST_SIZE = 0.2
RANDOM_STATE = 42
STRATIFY = True

# Random Forest Baseline Hyperparameters
RF_PARAMS = {
    "n_estimators": 100,
    "max_depth": 12,
    "class_weight": "balanced",
    "random_state": RANDOM_STATE,
    "n_jobs": -1
}

# XGBoost Model Hyperparameters
XGB_PARAMS = {
    "n_estimators": 100,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": RANDOM_STATE,
    "eval_metric": "logloss",
    "n_jobs": -1
}

# Fraud classification threshold
DEFAULT_DECISION_THRESHOLD = 0.5
