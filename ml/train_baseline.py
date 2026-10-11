"""
Random Forest Baseline Training Module for SurgeShield AI.
Trains a balanced Random Forest Classifier for fraud detection.
"""

import time
from typing import Dict, Any, Tuple
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from ml.config import RF_PARAMS


def train_random_forest(
    X_train: pd.DataFrame, 
    y_train: pd.Series, 
    params: Dict[str, Any] = RF_PARAMS
) -> Tuple[RandomForestClassifier, float]:
    """
    Trains a Random Forest classifier with class imbalance handling.
    
    Args:
        X_train: Preprocessed training feature matrix.
        y_train: Training target labels.
        params: Dictionary of Random Forest hyperparameters.
        
    Returns:
        Tuple of (trained_model, training_time_seconds).
    """
    print("=" * 60)
    print("STEP 6: TRAINING RANDOM FOREST BASELINE MODEL")
    print("=" * 60)
    print(f"Hyperparameters: {params}")
    print(f"Training samples: {len(X_train):,}, Positive fraud cases: {y_train.sum():,}")
    
    rf_model = RandomForestClassifier(**params)
    
    start_time = time.time()
    rf_model.fit(X_train, y_train)
    elapsed_time = time.time() - start_time
    
    print(f"Random Forest model successfully trained in {elapsed_time:.2f} seconds.")
    print("=" * 60)
    
    return rf_model, elapsed_time
