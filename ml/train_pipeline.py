"""
Main training pipeline orchestration script for SurgeShield AI.
Executes data loading, inspection, cleaning, preprocessing, feature engineering, train/test splitting,
Random Forest & XGBoost training, model evaluation, selection, model saving, and prediction validation.
"""

import sys
import os
import json
import time
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split

# Ensure parent directory is in Python path for clean module imports
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from ml.config import (
    DATA_PATH,
    MODEL_SAVE_PATH,
    REPORTS_DIR,
    TEST_SIZE,
    RANDOM_STATE,
    STRATIFY,
    TARGET_COL,
    REQUIRED_COLUMNS
)
from ml.data_loader import load_data, inspect_data, clean_data
from ml.feature_engineering import engineer_features
from ml.preprocessing import FraudPreprocessor
from ml.train_baseline import train_random_forest
from ml.train_xgboost import train_xgboost_model
from ml.evaluate import evaluate_model, generate_evaluation_plots, select_best_model
from ml.predict import predict_transaction


def run_pipeline():
    """
    Executes complete ML training, evaluation, saving, and testing pipeline.
    """
    pipeline_start_time = time.time()
    
    print("=" * 70)
    print("        SURGESHIELD AI — ML FRAUD DETECTION ENGINE PIPELINE")
    print("=" * 70)
    
    # ----------------------------------------------------
    # STEP 1: LOAD & INSPECT DATASET
    # ----------------------------------------------------
    raw_df = load_data(DATA_PATH)
    inspection_report = inspect_data(raw_df)
    
    # ----------------------------------------------------
    # STEP 2: DATA CLEANING
    # ----------------------------------------------------
    cleaned_df, cleaning_report = clean_data(raw_df)
    
    # ----------------------------------------------------
    # STEP 3 & 4: FEATURE ENGINEERING & PREPROCESSING SETUP
    # ----------------------------------------------------
    print("=" * 60)
    print("STEP 3 & 4: PREPROCESSING & FEATURE ENGINEERING")
    print("=" * 60)
    print("Deriving temporal features (Hour, Day, Hour_sin, Hour_cos) and log-transformed Amount.")
    
    # Instantiate reusable preprocessor
    preprocessor = FraudPreprocessor(scale_features=True)
    
    # ----------------------------------------------------
    # STEP 8: TRAIN / TEST SPLIT (Stratified Split)
    # ----------------------------------------------------
    print("=" * 60)
    print("STEP 8: TRAIN / TEST SPLIT")
    print("=" * 60)
    
    stratify_target = cleaned_df[TARGET_COL] if STRATIFY else None
    
    train_df, test_df = train_test_split(
        cleaned_df,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=stratify_target
    )
    
    print(f"Stratified Train/Test Split Complete:")
    print(f"  - Training Set Size: {len(train_df):,} rows (Fraud cases: {train_df[TARGET_COL].sum():,})")
    print(f"  - Testing Set Size:  {len(test_df):,} rows (Fraud cases: {test_df[TARGET_COL].sum():,})")
    print("Rationale: Stratified splitting guarantees identical target class distributions in train and test sets,")
    print("preventing distribution shift while preserving class imbalance ratio (~0.17% fraud).")
    print("=" * 60)
    
    # Fit preprocessor on training data strictly to avoid data leakage
    X_train, y_train = preprocessor.fit_transform(train_df)
    
    # Transform test set using fitted preprocessor
    X_test = preprocessor.transform(test_df)
    y_test = test_df[TARGET_COL].copy()
    
    # ----------------------------------------------------
    # STEP 6: TRAIN RANDOM FOREST BASELINE
    # ----------------------------------------------------
    rf_model, rf_train_time = train_random_forest(X_train, y_train)
    
    # ----------------------------------------------------
    # STEP 7: TRAIN XGBOOST MODEL
    # ----------------------------------------------------
    xgb_model, xgb_train_time, scale_pos_weight = train_xgboost_model(X_train, y_train)
    
    # ----------------------------------------------------
    # STEP 9: EVALUATE BOTH MODELS
    # ----------------------------------------------------
    results_rf = evaluate_model(rf_model, X_test, y_test, model_name="Random Forest Baseline")
    results_xgb = evaluate_model(xgb_model, X_test, y_test, model_name="XGBoost Classifier")
    
    # Generate visual evaluation plots in reports/
    plot_paths = generate_evaluation_plots(results_rf, results_xgb, y_test, save_dir=REPORTS_DIR)
    
    # ----------------------------------------------------
    # STEP 10: MODEL SELECTION
    # ----------------------------------------------------
    winning_model_name, rationale = select_best_model(results_rf, results_xgb)
    
    if winning_model_name == "XGBoost":
        selected_model = xgb_model
        selected_metrics = results_xgb
    else:
        selected_model = rf_model
        selected_metrics = results_rf
        
    # ----------------------------------------------------
    # STEP 11: MODEL SAVING
    # ----------------------------------------------------
    print("=" * 60)
    print("STEP 11: SAVING MODEL & PREPROCESSING PIPELINE")
    print("=" * 60)
    
    MODEL_SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    artifact = {
        "model": selected_model,
        "preprocessor": preprocessor,
        "model_name": winning_model_name,
        "feature_names": preprocessor.feature_cols,
        "metadata": {
            "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "dataset_size": len(cleaned_df),
            "train_size": len(train_df),
            "test_size": len(test_df),
            "winning_model": winning_model_name,
            "metrics": {
                "pr_auc": selected_metrics["pr_auc"],
                "roc_auc": selected_metrics["roc_auc"],
                "fraud_precision": selected_metrics["fraud_precision"],
                "fraud_recall": selected_metrics["fraud_recall"],
                "fraud_f1": selected_metrics["fraud_f1"],
                "accuracy": selected_metrics["accuracy"]
            },
            "selection_rationale": rationale
        }
    }
    
    joblib.dump(artifact, MODEL_SAVE_PATH)
    print(f"Saved complete artifact to: {MODEL_SAVE_PATH.resolve()}")
    print("The saved pipeline includes model, preprocessor scaler, feature names, and metadata.")
    print("=" * 60)
    
    # Save JSON summary report in reports/
    summary_report_path = REPORTS_DIR / "evaluation_report.json"
    json_report = {
        "dataset_summary": {
            "total_raw_rows": inspection_report["num_rows"],
            "total_cleaned_rows": len(cleaned_df),
            "fraud_count": inspection_report["class_distribution"]["fraud_count"],
            "legitimate_count": inspection_report["class_distribution"]["legitimate_count"],
            "fraud_percentage": inspection_report["class_distribution"]["fraud_percentage"]
        },
        "model_comparison": {
            "random_forest": {
                "accuracy": results_rf["accuracy"],
                "roc_auc": results_rf["roc_auc"],
                "pr_auc": results_rf["pr_auc"],
                "fraud_precision": results_rf["fraud_precision"],
                "fraud_recall": results_rf["fraud_recall"],
                "fraud_f1": results_rf["fraud_f1"],
                "training_time_seconds": round(rf_train_time, 2)
            },
            "xgboost": {
                "accuracy": results_xgb["accuracy"],
                "roc_auc": results_xgb["roc_auc"],
                "pr_auc": results_xgb["pr_auc"],
                "fraud_precision": results_xgb["fraud_precision"],
                "fraud_recall": results_xgb["fraud_recall"],
                "fraud_f1": results_xgb["fraud_f1"],
                "scale_pos_weight": round(scale_pos_weight, 2),
                "training_time_seconds": round(xgb_train_time, 2)
            }
        },
        "selected_model": winning_model_name,
        "selection_rationale": rationale,
        "saved_model_path": str(MODEL_SAVE_PATH.resolve())
    }
    
    with open(summary_report_path, "w") as f:
        json.dump(json_report, f, indent=4)
        
    print(f"Saved evaluation JSON report to: {summary_report_path.resolve()}")
    
    # ----------------------------------------------------
    # STEP 12 & 14: TESTING SAMPLE PREDICTIONS
    # ----------------------------------------------------
    print("=" * 60)
    print("STEP 12 & 14: TESTING REUSABLE PREDICTION MODULE")
    print("=" * 60)
    print("Testing predictions on 5 sample transactions (known Legitimate & Fraud cases)...")
    
    # Select 3 legitimate transactions and 2 fraud transactions from test set
    legit_samples = test_df[test_df[TARGET_COL] == 0].head(3)
    fraud_samples = test_df[test_df[TARGET_COL] == 1].head(2)
    sample_df = pd.concat([legit_samples, fraud_samples]).reset_index(drop=True)
    
    prediction_results = []
    for idx, row in sample_df.iterrows():
        actual_class = "Fraud" if row[TARGET_COL] == 1 else "Legitimate"
        tx_dict = row.drop(labels=[TARGET_COL]).to_dict()
        
        pred_output = predict_transaction(tx_dict, model_path=MODEL_SAVE_PATH)
        
        result_entry = {
            "sample_id": idx + 1,
            "actual_label": actual_class,
            "predicted_label": pred_output["prediction"],
            "fraud_probability": pred_output["fraud_probability"],
            "status": "CORRECT" if pred_output["prediction"] == actual_class else "MISCLASSIFIED"
        }
        prediction_results.append(result_entry)
        print(f"Sample #{idx+1} [Actual: {actual_class:10s}] -> Fraud Prob: {pred_output['fraud_probability']:.4f} | Prediction: {pred_output['prediction']:10s} | {result_entry['status']}")
        
    print("=" * 60)
    total_pipeline_time = time.time() - pipeline_start_time
    print(f"Pipeline executed successfully in {total_pipeline_time:.2f} seconds.")
    print("=" * 70)
    
    return json_report, prediction_results


if __name__ == "__main__":
    run_pipeline()
