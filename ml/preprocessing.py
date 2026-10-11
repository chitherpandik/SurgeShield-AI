"""
Preprocessing module for SurgeShield AI.
Provides reusable feature scaling and matrix preparation for training and real-time inference.
"""

from typing import Tuple, List, Union, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler, StandardScaler

from ml.config import TARGET_COL, TIME_COL, AMOUNT_COL
from ml.feature_engineering import engineer_features, get_feature_names


class FraudPreprocessor:
    """
    Reusable feature preprocessing pipeline for SurgeShield AI.
    
    Fits scaler parameters strictly on training features to prevent data leakage,
    and applies identical transformations during evaluation and real-time prediction.
    """
    
    def __init__(self, scale_features: bool = True):
        self.scale_features = scale_features
        self.scaler: Optional[RobustScaler] = RobustScaler() if scale_features else None
        self.feature_cols: List[str] = []
        self.is_fitted: bool = False

    def fit(self, df: pd.DataFrame) -> "FraudPreprocessor":
        """
        Fits feature scaler on training DataFrame.
        
        Args:
            df: Training DataFrame containing raw features (and optionally target).
            
        Returns:
            Fitted FraudPreprocessor instance.
        """
        df_engineered = engineer_features(df)
        
        # Exclude target column if present
        feature_df = df_engineered.drop(columns=[TARGET_COL]) if TARGET_COL in df_engineered.columns else df_engineered
        self.feature_cols = feature_df.columns.tolist()
        
        if self.scale_features and self.scaler is not None:
            # Fit RobustScaler on continuous features (Time, Amount, Hour, Day, Amount_log)
            continuous_cols = [c for c in ["Time", "Amount", "Hour", "Day", "Amount_log"] if c in self.feature_cols]
            self.scaler.fit(feature_df[continuous_cols])
            
        self.is_fitted = True
        return self

    def transform(self, data: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]]) -> pd.DataFrame:
        """
        Transforms input data into engineered and scaled feature DataFrame.
        
        Args:
            data: DataFrame, dictionary, or list of dictionaries.
            
        Returns:
            pd.DataFrame ready for model inference/training.
        """
        df_engineered = engineer_features(data)
        
        # Drop target if present
        feature_df = df_engineered.drop(columns=[TARGET_COL]) if TARGET_COL in df_engineered.columns else df_engineered
        
        # Ensure exact column alignment
        if self.is_fitted:
            missing = [c for c in self.feature_cols if c not in feature_df.columns]
            if missing:
                raise ValueError(f"Input data missing expected features: {missing}")
            feature_df = feature_df[self.feature_cols]
        else:
            self.feature_cols = feature_df.columns.tolist()
            
        if self.scale_features and self.scaler is not None and self.is_fitted:
            continuous_cols = [c for c in ["Time", "Amount", "Hour", "Day", "Amount_log"] if c in self.feature_cols]
            feature_df_scaled = feature_df.copy()
            feature_df_scaled[continuous_cols] = self.scaler.transform(feature_df[continuous_cols])
            return feature_df_scaled
            
        return feature_df

    def fit_transform(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Fits preprocessor on df, transforms features, and separates target y.
        
        Args:
            df: Cleaned training DataFrame containing features and target 'Class'.
            
        Returns:
            Tuple of (X_features, y_target).
        """
        if TARGET_COL not in df.columns:
            raise KeyError(f"Target column '{TARGET_COL}' must be present in training dataframe.")
            
        y = df[TARGET_COL].copy()
        self.fit(df)
        X = self.transform(df)
        return X, y
