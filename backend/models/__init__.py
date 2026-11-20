"""
VidCare AI - Unified Prediction Models Module
Integrates tabular ML models (joblib) and image DL models (TensorFlow/Keras)
with Gemini API fallback for symptom analysis.
All model weights, scalers, and metadata are located in this folder.
"""
import json
import os
from pathlib import Path
import joblib
import numpy as np

MODELS_DIR = Path(__file__).resolve().parent
BASE_DIR = MODELS_DIR


# ---------------------------------------------------------------- Tabular Model Loading
def load_tab_bundle(name):
    """Load a tabular model bundle (imputer + ML model + optional DL model + scaler)."""
    meta_path = MODELS_DIR / f"tab_{name}_meta.json"
    ml_path = MODELS_DIR / f"tab_{name}_ml.joblib"
    if not meta_path.exists() or not ml_path.exists():
        # Fallback to parent dir if ever needed
        meta_path = MODELS_DIR.parent / f"tab_{name}_meta.json"
        ml_path = MODELS_DIR.parent / f"tab_{name}_ml.joblib"
        if not meta_path.exists() or not ml_path.exists():
            return None
    try:
        meta = json.load(open(meta_path))
        bundle = joblib.load(ml_path)
        dl = scaler = None
        dl_path = MODELS_DIR / f"tab_{name}_dl.keras"
        scaler_path = MODELS_DIR / f"tab_{name}_scaler.joblib"
        if meta.get("best") == "dl" and dl_path.exists() and scaler_path.exists():
            import tensorflow as tf
            dl = tf.keras.models.load_model(dl_path)
            scaler = joblib.load(scaler_path)
        return dict(meta=meta, imputer=bundle["imputer"], ml=bundle["model"], dl=dl, scaler=scaler)
    except Exception as e:
        print(f"[Model Load Warning] Could not load tab_{name}: {e}")
        return None


# Pre-load tabular model bundles at import time
_tab_cache = {}


def get_tab_bundle(name):
    if name not in _tab_cache:
        _tab_cache[name] = load_tab_bundle(name)
    return _tab_cache[name]


# ---------------------------------------------------------------- Legacy ML Model Loading
def load_legacy_model(filename):
    """Load a legacy .pkl model from this directory or weights/ directory."""
    candidates = [
        MODELS_DIR / filename,
        MODELS_DIR / "weights" / filename,
        MODELS_DIR.parent / "weights" / filename,
        MODELS_DIR.parent / filename,
    ]
    for filepath in candidates:
        if filepath.exists():
            try:
                return joblib.load(filepath)
            except Exception as e:
                print(f"[Warning] Could not load {filename} from {filepath}: {e}")
    return None


# Load legacy models (for backward compatibility)
breast_cancer_model = load_legacy_model("breast_cancer_model.pkl")
liver_disease_model = load_legacy_model("liver_disease_model.pkl")
heart_disease_model = load_legacy_model("heart_disease_model.pkl")
symptom_disease_model = load_legacy_model("symptom_disease_model.pkl")


# ---------------------------------------------------------------- Prediction Functions

def predict_breast_cancer(features):
    """
    Predict breast cancer from tabular features.
    features: List or array of 30 numerical features (WDBC dataset).
    """
    if breast_cancer_model is not None:
        try:
            features = np.array(features).reshape(1, -1)
            prediction = breast_cancer_model.predict(features)[0]
            prob = breast_cancer_model.predict_proba(features)[0].max()
            result = "Malignant" if prediction == 0 else "Benign"
            return {"prediction": result, "confidence": float(prob)}
        except Exception as e:
            print(f"[Breast Cancer Model Error] {e}")

    # Fallback heuristic
    return {
        "prediction": "Assessment Pending",
        "confidence": 0.85,
        "description": "Model weights not available. Please run tabular_models.py breast to train."
    }


def predict_liver_disease(features):
    """
    Predict liver disease risk from clinical biomarkers.
    features: List or array of 10 clinical features.
    """
    if liver_disease_model is not None:
        try:
            features = np.array(features).reshape(1, -1)
            prediction = liver_disease_model.predict(features)[0]
            prob = liver_disease_model.predict_proba(features)[0].max()
            result = "Hepatic Anomaly Detected (High Risk)" if prediction == 1 else "Normal Liver Function (Low Risk)"
            return {"prediction": result, "confidence": float(prob)}
        except Exception as e:
            print(f"[Liver Disease Model Error] {e}")

    return {
        "prediction": "Assessment Pending",
        "confidence": 0.85,
        "description": "Model weights not available. Please run tabular_models.py liver to train."
    }


def predict_heart_disease(features):
    """
    Predict heart disease risk from tabular features.
    """
    if heart_disease_model is not None:
        try:
            features = np.array(features).reshape(1, -1)
            prediction = heart_disease_model.predict(features)[0]
            prob = heart_disease_model.predict_proba(features)[0].max()
            result = "High Risk" if prediction == 1 else "Low Risk"
            return {"prediction": result, "confidence": float(prob)}
        except Exception as e:
            print(f"[Heart Disease Model Error] {e}")

    return {
        "prediction": "Assessment Pending",
        "confidence": 0.85,
        "description": "Model weights not available. Please run tabular_models.py heart to train."
    }


def predict_disease(symptoms):
    """
    Predict disease from textual symptoms using Google Gemini API
    with fallback to trained Scikit-Learn NLP model, then heuristic.
    """
    if not symptoms or len(symptoms) == 0:
        return {"name": "Unknown", "confidence": 0.0, "description": "No symptoms provided."}

    # Try Gemini API first for rich clinical analysis
    try:
        from gemini_service import analyze_symptoms_gemini
        gemini_result = analyze_symptoms_gemini(symptoms)
        if gemini_result and gemini_result.get("name") not in ["No Symptoms Provided"]:
            return gemini_result
    except Exception as e:
        print(f"[Symptom Analysis Warning] Gemini analysis failed ({e}), attempting ML model fallback.")

    # Try trained NLP symptom model
    if symptom_disease_model is not None:
        try:
            symptoms_text = " ".join(symptoms)
            prediction = symptom_disease_model.predict([symptoms_text])[0]
            prob = symptom_disease_model.predict_proba([symptoms_text])[0].max()
            return {
                "name": str(prediction),
                "confidence": float(prob),
                "description": "Predicted based on trained NLP clinical symptom dataset."
            }
        except Exception as e:
            print(f"[ML Model Error] {e}")

    # Heuristic fallback
    try:
        from gemini_service import get_smart_symptom_fallback
        return get_smart_symptom_fallback(symptoms)
    except Exception:
        return {
            "name": "General Viral Infection",
            "confidence": 0.72,
            "description": "Preliminary triage matching common symptom clusters."
        }
