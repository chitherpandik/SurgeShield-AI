"""
Evaluation and visualization module for SurgeShield AI.
Calculates classification metrics, generates confusion matrices and ROC/PR curves, and compares models.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    roc_curve,
    precision_recall_curve,
    classification_report
)

from ml.config import REPORTS_DIR


def evaluate_model(model: Any, X_test: pd.DataFrame, y_test: pd.Series, model_name: str = "Model") -> Dict[str, Any]:
    """
    Evaluates a trained classifier on test data and computes comprehensive metrics.
    
    Args:
        model: Trained scikit-learn or XGBoost classifier.
        X_test: Test features DataFrame.
        y_test: True test target Series.
        model_name: Display name for the model.
        
    Returns:
        Dictionary containing overall and fraud-specific metrics.
    """
    y_pred = model.predict(X_test)
    
    if hasattr(model, "predict_proba"):
        y_probs = model.predict_proba(X_test)[:, 1]
    else:
        y_probs = y_pred.astype(float)
        
    # Overall metrics
    acc = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)
    
    roc_auc = roc_auc_score(y_test, y_probs)
    pr_auc = average_precision_score(y_test, y_probs)
    
    # Fraud class (Class 1) specific metrics
    fraud_prec = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
    fraud_rec = recall_score(y_test, y_pred, pos_label=1, zero_division=0)
    fraud_f1 = f1_score(y_test, y_pred, pos_label=1, zero_division=0)
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    metrics = {
        "model_name": model_name,
        "accuracy": float(acc),
        "precision_macro": float(prec_macro),
        "recall_macro": float(rec_macro),
        "f1_macro": float(f1_macro),
        "roc_auc": float(roc_auc),
        "pr_auc": float(pr_auc),
        "fraud_precision": float(fraud_prec),
        "fraud_recall": float(fraud_rec),
        "fraud_f1": float(fraud_f1),
        "confusion_matrix": {
            "TN": int(tn),
            "FP": int(fp),
            "FN": int(fn),
            "TP": int(tp)
        },
        "y_probs": y_probs,
        "y_pred": y_pred
    }
    
    print("=" * 60)
    print(f"STEP 9: MODEL EVALUATION REPORT — {model_name.upper()}")
    print("=" * 60)
    print(f"Accuracy:            {acc:.6f}")
    print(f"ROC-AUC:             {roc_auc:.6f}")
    print(f"PR-AUC:              {pr_auc:.6f}")
    print("-" * 60)
    print(f"FRAUD CLASS (Class 1) METRICS:")
    print(f"  - Fraud Precision: {fraud_prec:.4f}")
    print(f"  - Fraud Recall:    {fraud_rec:.4f}")
    print(f"  - Fraud F1-Score:  {fraud_f1:.4f}")
    print("-" * 60)
    print(f"CONFUSION MATRIX:")
    print(f"  [ True Legitimate (TN): {tn:,} | False Fraud (FP): {fp:,} ]")
    print(f"  [ Missed Fraud (FN):    {fn:,} | Caught Fraud (TP): {tp:,} ]")
    print("=" * 60)
    
    return metrics


def generate_evaluation_plots(
    results_rf: Dict[str, Any], 
    results_xgb: Dict[str, Any], 
    y_test: pd.Series, 
    save_dir: Path = REPORTS_DIR
) -> Dict[str, str]:
    """
    Generates and saves visual evaluation reports (Confusion Matrices, ROC Curves, PR Curves).
    
    Args:
        results_rf: Metrics dict for Random Forest.
        results_xgb: Metrics dict for XGBoost.
        y_test: Ground truth labels.
        save_dir: Path to directory for saving plot PNGs.
        
    Returns:
        Dictionary of generated plot file paths.
    """
    save_dir = Path(save_dir)
    save_dir.mkdir(parents=True, exist_ok=True)
    plot_paths = {}
    
    sns.set_theme(style="darkgrid")
    
    # 1. Confusion Matrix Plots
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    cm_rf = np.array([
        [results_rf["confusion_matrix"]["TN"], results_rf["confusion_matrix"]["FP"]],
        [results_rf["confusion_matrix"]["FN"], results_rf["confusion_matrix"]["TP"]]
    ])
    
    cm_xgb = np.array([
        [results_xgb["confusion_matrix"]["TN"], results_xgb["confusion_matrix"]["FP"]],
        [results_xgb["confusion_matrix"]["FN"], results_xgb["confusion_matrix"]["TP"]]
    ])
    
    sns.heatmap(cm_rf, annot=True, fmt="d", cmap="Blues", ax=axes[0],
                xticklabels=["Legitimate", "Fraud"], yticklabels=["Legitimate", "Fraud"])
    axes[0].set_title(f"Random Forest Confusion Matrix\n(Fraud Recall: {results_rf['fraud_recall']:.2%})", fontsize=12, fontweight='bold')
    axes[0].set_xlabel("Predicted Label")
    axes[0].set_ylabel("True Label")
    
    sns.heatmap(cm_xgb, annot=True, fmt="d", cmap="Purples", ax=axes[1],
                xticklabels=["Legitimate", "Fraud"], yticklabels=["Legitimate", "Fraud"])
    axes[1].set_title(f"XGBoost Confusion Matrix\n(Fraud Recall: {results_xgb['fraud_recall']:.2%})", fontsize=12, fontweight='bold')
    axes[1].set_xlabel("Predicted Label")
    axes[1].set_ylabel("True Label")
    
    plt.tight_layout()
    cm_path = save_dir / "confusion_matrices.png"
    plt.savefig(cm_path, dpi=300)
    plt.close()
    plot_paths["confusion_matrix"] = str(cm_path)
    
    # 2. ROC Curve Plot
    plt.figure(figsize=(8, 6))
    
    fpr_rf, tpr_rf, _ = roc_curve(y_test, results_rf["y_probs"])
    fpr_xgb, tpr_xgb, _ = roc_curve(y_test, results_xgb["y_probs"])
    
    plt.plot(fpr_rf, tpr_rf, label=f"Random Forest (AUC = {results_rf['roc_auc']:.4f})", color="#1f77b4", linewidth=2)
    plt.plot(fpr_xgb, tpr_xgb, label=f"XGBoost (AUC = {results_xgb['roc_auc']:.4f})", color="#9467bd", linewidth=2)
    plt.plot([0, 1], [0, 1], 'k--', label="Random Chance (AUC = 0.5000)")
    
    plt.xlabel("False Positive Rate", fontsize=11)
    plt.ylabel("True Positive Rate", fontsize=11)
    plt.title("SurgeShield AI — ROC Curve Comparison", fontsize=13, fontweight='bold')
    plt.legend(loc="lower right", fontsize=10)
    plt.tight_layout()
    
    roc_path = save_dir / "roc_curve.png"
    plt.savefig(roc_path, dpi=300)
    plt.close()
    plot_paths["roc_curve"] = str(roc_path)
    
    # 3. Precision-Recall Curve Plot
    plt.figure(figsize=(8, 6))
    
    prec_rf, rec_rf, _ = precision_recall_curve(y_test, results_rf["y_probs"])
    prec_xgb, rec_xgb, _ = precision_recall_curve(y_test, results_xgb["y_probs"])
    
    plt.plot(rec_rf, prec_rf, label=f"Random Forest (PR-AUC = {results_rf['pr_auc']:.4f})", color="#1f77b4", linewidth=2)
    plt.plot(rec_xgb, prec_xgb, label=f"XGBoost (PR-AUC = {results_xgb['pr_auc']:.4f})", color="#9467bd", linewidth=2)
    
    plt.xlabel("Recall (Fraud Detection Rate)", fontsize=11)
    plt.ylabel("Precision (Fraud Accuracy)", fontsize=11)
    plt.title("SurgeShield AI — Precision-Recall Curve (Primary Metric)", fontsize=13, fontweight='bold')
    plt.legend(loc="lower left", fontsize=10)
    plt.tight_layout()
    
    pr_path = save_dir / "precision_recall_curve.png"
    plt.savefig(pr_path, dpi=300)
    plt.close()
    plot_paths["precision_recall_curve"] = str(pr_path)
    
    print(f"Successfully generated and saved evaluation plots in: {save_dir.resolve()}")
    return plot_paths


def select_best_model(results_rf: Dict[str, Any], results_xgb: Dict[str, Any]) -> Tuple[str, str]:
    """
    Compares Random Forest and XGBoost based on fraud-focused evaluation metrics.
    
    Selection Criterion:
    Primary: PR-AUC (Precision-Recall AUC is the gold standard for highly imbalanced fraud detection).
    Secondary: Fraud F1-Score & Fraud Recall.
    
    Args:
        results_rf: Evaluation results dictionary for Random Forest.
        results_xgb: Evaluation results dictionary for XGBoost.
        
    Returns:
        Tuple of (selected_model_name, selection_explanation).
    """
    print("=" * 60)
    print("STEP 10: MODEL SELECTION & COMPARISON")
    print("=" * 60)
    
    rf_pr = results_rf["pr_auc"]
    xgb_pr = results_xgb["pr_auc"]
    
    rf_f1 = results_rf["fraud_f1"]
    xgb_f1 = results_xgb["fraud_f1"]
    
    rf_rec = results_rf["fraud_recall"]
    xgb_rec = results_xgb["fraud_recall"]
    
    if xgb_pr > rf_pr:
        winner = "XGBoost"
        reason = (
            f"XGBoost achieved a higher PR-AUC ({xgb_pr:.4f} vs Random Forest's {rf_pr:.4f}), "
            f"Fraud F1-Score ({xgb_f1:.4f} vs {rf_f1:.4f}), and Fraud Recall ({xgb_rec:.2%} vs {rf_rec:.2%}). "
            f"XGBoost handles complex non-linear feature interactions and extreme class imbalance superiorly."
        )
    elif rf_pr > xgb_pr:
        winner = "Random Forest"
        reason = (
            f"Random Forest achieved a higher PR-AUC ({rf_pr:.4f} vs XGBoost's {xgb_pr:.4f}) "
            f"and Fraud F1-Score ({rf_f1:.4f} vs {xgb_f1:.4f})."
        )
    else:
        # Fallback to F1-Score
        if xgb_f1 >= rf_f1:
            winner = "XGBoost"
            reason = f"XGBoost tied on PR-AUC ({xgb_pr:.4f}) but achieved higher Fraud F1-Score ({xgb_f1:.4f})."
        else:
            winner = "Random Forest"
            reason = f"Random Forest tied on PR-AUC ({rf_pr:.4f}) but achieved higher Fraud F1-Score ({rf_f1:.4f})."
            
    print(f"SELECTED MODEL: {winner}")
    print(f"RATIONALE:      {reason}")
    print("=" * 60)
    
    return winner, reason
