"""
XGBoost Model Training Module for SurgeShield AI.
Trains a gradient boosted decision tree classifier with scale_pos_weight for class imbalance.
"""

import time
from typing import Dict, Any, Tuple
import pandas as pd
from xgboost import XGBClassifier

from ml.config import XGB_PARAMS


def train_xgboost_model(
    X_train: pd.DataFrame, 
    y_train: pd.Series, 
    params: Dict[str, Any] = XGB_PARAMS
) -> Tuple[XGBClassifier, float, float]:
    """
    Trains an XGBoost classifier with dynamically calculated scale_pos_weight.
    
    Args:
        X_train: Preprocessed training feature matrix.
        y_train: Training target labels.
        params: Dictionary of XGBoost hyperparameters.
        
    Returns:
        Tuple of (trained_model, training_time_seconds, scale_pos_weight_value).
    """
    print("=" * 60)
    print("STEP 7: TRAINING XGBOOST MODEL")
    print("=" * 60)
    
    # Calculate scale_pos_weight dynamically from training data only to prevent data leakage
    num_neg = (y_train == 0).sum()
    num_pos = (y_train == 1).sum()
    scale_pos_weight = float(num_neg / num_pos) if num_pos > 0 else 1.0
    
    model_params = params.copy()
    model_params["scale_pos_weight"] = scale_pos_weight
    
    print(f"Calculated scale_pos_weight: {scale_pos_weight:.2f} (Legitimate: {num_neg:,}, Fraud: {num_pos:,})")
    print(f"Hyperparameters: {model_params}")
    
    xgb_model = XGBClassifier(**model_params)
    
    start_time = time.time()
    xgb_model.fit(X_train, y_train)
    elapsed_time = time.time() - start_time
    
    print(f"XGBoost model successfully trained in {elapsed_time:.2f} seconds.")
    print("=" * 60)
    
    return xgb_model, elapsed_time, scale_pos_weight
