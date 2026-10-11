"""
Data loader and cleaning module for SurgeShield AI.
Provides dataset loading, structured inspection, and safe cleaning capabilities.
"""

import os
from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np

from ml.config import DATA_PATH, REQUIRED_COLUMNS, TIME_COL, AMOUNT_COL, TARGET_COL


def load_data(file_path: Path = DATA_PATH) -> pd.DataFrame:
    """
    Loads transaction dataset from CSV file.
    
    Args:
        file_path: Path object or string path to CSV dataset.
        
    Returns:
        pd.DataFrame containing the raw transactions dataset.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at path: {path.resolve()}")
    
    print(f"Loading dataset from: {path.resolve()}")
    df = pd.read_csv(path)
    print(f"Dataset successfully loaded into memory with shape: {df.shape}")
    return df


def inspect_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Performs comprehensive inspection of transaction dataset according to Step 1.
    
    Args:
        df: Input pandas DataFrame.
        
    Returns:
        Dictionary containing detailed dataset inspection metrics.
    """
    num_rows, num_cols = df.shape
    col_names = df.columns.tolist()
    data_types = df.dtypes.to_dict()
    missing_values = df.isnull().sum().to_dict()
    total_missing = sum(missing_values.values())
    num_duplicates = int(df.duplicated().sum())
    
    # Target distribution
    if TARGET_COL in df.columns:
        class_counts = df[TARGET_COL].value_counts().to_dict()
        legitimate_count = int(class_counts.get(0, 0))
        fraud_count = int(class_counts.get(1, 0))
        total = legitimate_count + fraud_count
        legitimate_pct = (legitimate_count / total * 100) if total > 0 else 0.0
        fraud_pct = (fraud_count / total * 100) if total > 0 else 0.0
        unique_targets = df[TARGET_COL].unique().tolist()
    else:
        legitimate_count = fraud_count = total = 0
        legitimate_pct = fraud_pct = 0.0
        unique_targets = []
        
    # Amount stats
    amount_stats = df[AMOUNT_COL].describe().to_dict() if AMOUNT_COL in df.columns else {}
    
    # Time stats
    time_stats = df[TIME_COL].describe().to_dict() if TIME_COL in df.columns else {}
    
    report = {
        "num_rows": num_rows,
        "num_cols": num_cols,
        "column_names": col_names,
        "data_types": data_types,
        "missing_values": missing_values,
        "total_missing_values": total_missing,
        "num_duplicates": num_duplicates,
        "unique_target_values": unique_targets,
        "class_distribution": {
            "legitimate_count": legitimate_count,
            "legitimate_percentage": round(legitimate_pct, 4),
            "fraud_count": fraud_count,
            "fraud_percentage": round(fraud_pct, 4)
        },
        "amount_statistics": amount_stats,
        "time_statistics": time_stats
    }
    
    # Print formatted inspection output
    print("=" * 60)
    print("STEP 1: DATA INSPECTION REPORT")
    print("=" * 60)
    print(f"Total Rows:              {num_rows:,}")
    print(f"Total Columns:           {num_cols}")
    print(f"Total Missing Values:    {total_missing}")
    print(f"Duplicate Rows:          {num_duplicates:,}")
    print("-" * 60)
    print(f"Target Value Counts:")
    print(f"  - Legitimate (Class 0): {legitimate_count:,} ({legitimate_pct:.3f}%)")
    print(f"  - Fraud (Class 1):      {fraud_count:,} ({fraud_pct:.3f}%)")
    print("-" * 60)
    print(f"Amount Statistics:")
    print(f"  - Min: ${amount_stats.get('min', 0):.2f}, Mean: ${amount_stats.get('mean', 0):.2f}, Max: ${amount_stats.get('max', 0):.2f}")
    print(f"  - 25%: ${amount_stats.get('25%', 0):.2f}, 50%: ${amount_stats.get('50%', 0):.2f}, 75%: ${amount_stats.get('75%', 0):.2f}")
    print("-" * 60)
    print(f"Time Statistics (seconds):")
    print(f"  - Min: {time_stats.get('min', 0):.1f}s, Max: {time_stats.get('max', 0):.1f}s ({time_stats.get('max', 0)/3600:.2f} hours)")
    print("=" * 60)
    
    return report


def clean_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Performs safe data cleaning according to Step 2.
    
    Validates required columns, handles missing/duplicate values, checks class validity,
    and returns cleaned dataframe alongside cleaning log.
    
    Args:
        df: Input raw pandas DataFrame.
        
    Returns:
        Tuple of (cleaned_df, cleaning_report).
    """
    print("=" * 60)
    print("STEP 2: DATA CLEANING & VALIDATION")
    print("=" * 60)
    
    cleaning_operations = []
    cleaned_df = df.copy()
    
    # 1. Column Validation
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in cleaned_df.columns]
    if missing_cols:
        raise ValueError(f"Data cleaning failed: Dataset missing required columns: {missing_cols}")
    cleaning_operations.append(f"Validated all required columns ({len(REQUIRED_COLUMNS)} columns present).")
    
    # 2. Convert Data Types
    for col in REQUIRED_COLUMNS:
        if col == TARGET_COL:
            cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce').astype('int64')
        else:
            cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce').astype('float64')
    cleaning_operations.append("Validated numeric data types for all features.")
    
    # 3. Check and Handle Missing Values
    null_count = cleaned_df.isnull().sum().sum()
    if null_count > 0:
        cleaned_df = cleaned_df.dropna()
        cleaning_operations.append(f"Removed {null_count} rows containing missing/null values.")
    else:
        cleaning_operations.append("No missing/null values found.")
        
    # 4. Check and Handle Duplicate Rows
    dup_count = int(cleaned_df.duplicated().sum())
    if dup_count > 0:
        cleaned_df = cleaned_df.drop_duplicates().reset_index(drop=True)
        cleaning_operations.append(f"Removed {dup_count:,} exact duplicate rows to prevent data leakage.")
    else:
        cleaning_operations.append("No duplicate rows detected.")
        
    # 5. Validate Class Values
    invalid_class_rows = cleaned_df[~cleaned_df[TARGET_COL].isin([0, 1])]
    if len(invalid_class_rows) > 0:
        cleaned_df = cleaned_df[cleaned_df[TARGET_COL].isin([0, 1])].reset_index(drop=True)
        cleaning_operations.append(f"Removed {len(invalid_class_rows)} rows with invalid target class values.")
    else:
        cleaning_operations.append("Validated target Class values (all values strictly 0 or 1).")
        
    report = {
        "initial_row_count": len(df),
        "final_row_count": len(cleaned_df),
        "rows_removed": len(df) - len(cleaned_df),
        "operations_logged": cleaning_operations,
        "class_distribution_after_cleaning": cleaned_df[TARGET_COL].value_counts().to_dict()
    }
    
    for op in cleaning_operations:
        print(f"  [CLEANING LOG] {op}")
    print(f"Cleaned dataset row count: {len(cleaned_df):,} (removed {len(df) - len(cleaned_df):,} rows)")
    print("=" * 60)
    
    return cleaned_df, report
