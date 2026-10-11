"""
Pydantic Request Schemas for SurgeShield AI API.
Strictly validates raw transaction numerical inputs (Time, V1-V28, Amount).
"""

from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any


class TransactionRequest(BaseModel):
    Time: float = Field(..., description="Seconds elapsed since the reference start timestamp (>= 0)")
    V1: float = Field(..., description="Anonymized PCA numerical feature V1")
    V2: float = Field(..., description="Anonymized PCA numerical feature V2")
    V3: float = Field(..., description="Anonymized PCA numerical feature V3")
    V4: float = Field(..., description="Anonymized PCA numerical feature V4")
    V5: float = Field(..., description="Anonymized PCA numerical feature V5")
    V6: float = Field(..., description="Anonymized PCA numerical feature V6")
    V7: float = Field(..., description="Anonymized PCA numerical feature V7")
    V8: float = Field(..., description="Anonymized PCA numerical feature V8")
    V9: float = Field(..., description="Anonymized PCA numerical feature V9")
    V10: float = Field(..., description="Anonymized PCA numerical feature V10")
    V11: float = Field(..., description="Anonymized PCA numerical feature V11")
    V12: float = Field(..., description="Anonymized PCA numerical feature V12")
    V13: float = Field(..., description="Anonymized PCA numerical feature V13")
    V14: float = Field(..., description="Anonymized PCA numerical feature V14")
    V15: float = Field(..., description="Anonymized PCA numerical feature V15")
    V16: float = Field(..., description="Anonymized PCA numerical feature V16")
    V17: float = Field(..., description="Anonymized PCA numerical feature V17")
    V18: float = Field(..., description="Anonymized PCA numerical feature V18")
    V19: float = Field(..., description="Anonymized PCA numerical feature V19")
    V20: float = Field(..., description="Anonymized PCA numerical feature V20")
    V21: float = Field(..., description="Anonymized PCA numerical feature V21")
    V22: float = Field(..., description="Anonymized PCA numerical feature V22")
    V23: float = Field(..., description="Anonymized PCA numerical feature V23")
    V24: float = Field(..., description="Anonymized PCA numerical feature V24")
    V25: float = Field(..., description="Anonymized PCA numerical feature V25")
    V26: float = Field(..., description="Anonymized PCA numerical feature V26")
    V27: float = Field(..., description="Anonymized PCA numerical feature V27")
    V28: float = Field(..., description="Anonymized PCA numerical feature V28")
    Amount: float = Field(..., description="Transaction monetary amount in INR / ₹ (>= 0)")

    @field_validator("Time", "Amount")
    @classmethod
    def validate_non_negative(cls, v: float, info) -> float:
        if v < 0:
            raise ValueError(f"'{info.field_name}' cannot be negative.")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "Time": 406.0,
                "V1": -2.3122, "V2": 1.9519, "V3": -1.6098, "V4": 3.9979,
                "V5": -0.5222, "V6": -1.4265, "V7": -2.5373, "V8": 1.3916,
                "V9": -2.7700, "V10": -2.7722, "V11": 3.2020, "V12": -2.8999,
                "V13": -0.5952, "V14": -4.2892, "V15": 0.3897, "V16": -1.1407,
                "V17": -2.8300, "V18": -0.0168, "V19": 0.4169, "V20": 0.1269,
                "V21": 0.5172, "V22": -0.0350, "V23": -0.4652, "V24": 0.3202,
                "V25": 0.0445, "V26": 0.1778, "V27": 0.2611, "V28": -0.1432,
                "Amount": 149.99
            }
        }
    }
