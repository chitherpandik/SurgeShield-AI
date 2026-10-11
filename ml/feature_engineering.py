"""
Feature engineering module for SurgeShield AI.
Derives temporal and numerical features from transaction data without data leakage.
"""

from typing import Union, Dict, Any, List
import pandas as pd
import numpy as np

from ml.config import TIME_COL, AMOUNT_COL


def engineer_features(data: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]]) -> pd.DataFrame:
    """
    Engineers temporal and numerical features for a DataFrame or single transaction dictionary.
    
    Derived Features:
    1. Hour: Hour of day derived from Time (Time in seconds / 3600 % 24).
    2. Day: Day index derived from Time (Time in seconds / 86400).
    3. Hour_sin: Sine transformation of Hour for cyclic representation.
    4. Hour_cos: Cosine transformation of Hour for cyclic representation.
    5. Amount_log: Log transformation of Amount (log1p) to normalize extreme right skew.
    
    Args:
        data: DataFrame, dictionary, or list of dictionaries containing raw transaction data.
        
    Returns:
        pd.DataFrame containing original features + engineered features.
    """
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        df = data.copy()
        
    if TIME_COL not in df.columns or AMOUNT_COL not in df.columns:
        raise KeyError(f"Feature engineering requires '{TIME_COL}' and '{AMOUNT_COL}' columns.")
        
    # Temporal feature derivation
    time_sec = df[TIME_COL].astype(float)
    df["Hour"] = (time_sec / 3600.0) % 24.0
    df["Day"] = time_sec // 86400.0
    
    # Cyclic time representation (preserves continuity between hour 23 and 0)
    df["Hour_sin"] = np.sin(2.0 * np.pi * df["Hour"] / 24.0)
    df["Hour_cos"] = np.cos(2.0 * np.pi * df["Hour"] / 24.0)
    
    # Skewness reduction for transaction amount
    amount_val = np.maximum(0.0, df[AMOUNT_COL].astype(float))
    df["Amount_log"] = np.log1p(amount_val)
    
    return df


def get_feature_names() -> List[str]:
    """
    Returns the ordered list of feature column names used for training and prediction.
    """
    v_cols = [f"V{i}" for i in range(1, 29)]
    return ["Time", "Amount", "Hour", "Day", "Hour_sin", "Hour_cos", "Amount_log"] + v_cols
