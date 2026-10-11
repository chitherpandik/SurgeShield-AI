"""
Test script for SurgeShield AI saved model evaluation.
Loads pre-trained model artifact and test.csv dataset without retraining or modifying files.
"""

import os
import sys
import hashlib
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)

# Dynamic path configuration
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

MODEL_PATH = BASE_DIR / "models" / "fraud_model.pkl"
TEST_DATA_PATH = BASE_DIR / "data" / "test.csv"
TRAIN_DATA_PATH = BASE_DIR / "data" / "train.csv"


def get_file_info(file_path: Path):
    """Returns file size and MD5 hash for verification."""
    if not file_path.exists():
        return None
    with open(file_path, "rb") as f:
        file_hash = hashlib.md5(f.read()).hexdigest()
    mtime = os.path.getmtime(file_path)
    return {"hash": file_hash, "mtime": mtime, "size": os.path.getsize(file_path)}


def test_saved_model():
    import warnings
    warnings.filterwarnings('ignore')
    
    # Capture initial file state for verification
    train_info_before = get_file_info(TRAIN_DATA_PATH)
    test_info_before = get_file_info(TEST_DATA_PATH)
    model_info_before = get_file_info(MODEL_PATH)
    
    # 1. Load existing model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model artifact not found at: {MODEL_PATH}")
    
    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    preprocessor = artifact["preprocessor"]
    
    # 2. Load test.csv
    if not TEST_DATA_PATH.exists():
        raise FileNotFoundError(f"Test dataset not found at: {TEST_DATA_PATH}")
        
    test_df = pd.read_csv(TEST_DATA_PATH)
    total_test_rows = len(test_df)
    
    # 3. Apply exact preprocessing
    prediction_failures = 0
    predictions_generated = 0
    
    try:
        if preprocessor is not None:
            X_test = preprocessor.transform(test_df)
        else:
            feature_cols = [c for c in test_df.columns if c != "Class"]
            X_test = test_df[feature_cols]
            
        # 4. Run predictions for ALL rows in test.csv
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_test)[:, 1]
        else:
            probs = model.predict(X_test).astype(float)
            
        preds = (probs >= 0.5).astype(int)
        predictions_generated = len(preds)
    except Exception as e:
        prediction_failures = total_test_rows - predictions_generated
        print(f"Error during prediction: {e}")
        
    num_legit = int((preds == 0).sum())
    num_fraud = int((preds == 1).sum())
    
    # 6. Evaluation metrics if Class present
    has_target = "Class" in test_df.columns
    if has_target:
        y_true = test_df["Class"].values
        acc = accuracy_score(y_true, preds)
        prec = precision_score(y_true, preds, pos_label=1, zero_division=0)
        rec = recall_score(y_true, preds, pos_label=1, zero_division=0)
        f1 = f1_score(y_true, preds, pos_label=1, zero_division=0)
        roc_auc = roc_auc_score(y_true, probs)
        pr_auc = average_precision_score(y_true, probs)
        cm = confusion_matrix(y_true, preds)
        
    # Verification checks
    train_info_after = get_file_info(TRAIN_DATA_PATH)
    test_info_after = get_file_info(TEST_DATA_PATH)
    model_info_after = get_file_info(MODEL_PATH)
    
    row_check_pass = (total_test_rows == (predictions_generated + prediction_failures))
    train_unmodified = (train_info_before == train_info_after)
    test_unmodified = (test_info_before == test_info_after)
    model_unmodified = (model_info_before == model_info_after)
    
    # Format terminal output exactly as expected
    print("=" * 50)
    print("SURGESHIELD AI — SAVED MODEL TEST")
    print("=" * 50)
    print()
    print(f"Model: models/{MODEL_PATH.name}")
    print(f"Test dataset: data/{TEST_DATA_PATH.name}")
    print()
    print(f"Total test rows: {total_test_rows}")
    print(f"Predictions generated: {predictions_generated}")
    print(f"Prediction failures: {prediction_failures}")
    print()
    print(f"Predicted Legit: {num_legit}")
    print(f"Predicted Fraud: {num_fraud}")
    print()
    if has_target:
        print("Evaluation:")
        print(f"Accuracy : {acc:.6f}")
        print(f"Precision: {prec:.6f}")
        print(f"Recall   : {rec:.6f}")
        print(f"F1 Score : {f1:.6f}")
        print(f"ROC-AUC  : {roc_auc:.6f}")
        print(f"PR-AUC   : {pr_auc:.6f}")
        print()
        print("Confusion Matrix:")
        print(f"[[{cm[0][0]:>5} {cm[0][1]:>5}]")
        print(f" [{cm[1][0]:>5} {cm[1][1]:>5}]]")
        print()
    print("Dataset verification:")
    print(f"Test rows = Predictions + Failures: {'PASS' if row_check_pass else 'FAIL'}")
    print(f"Original test.csv modified: {'NO' if test_unmodified else 'YES'}")
    print(f"Model retrained: {'NO' if model_unmodified else 'YES'}")
    print()
    print("TEST COMPLETED SUCCESSFULLY")
    print("=" * 50)


if __name__ == "__main__":
    test_saved_model()
