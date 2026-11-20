"""
VidCare AI — Quick Inference Test
Tests all prediction pipelines work without crashing.
"""
import numpy as np
import sys


def test_tabular_models():
    """Test tabular model predictions via the unified tabular system."""
    print("=" * 50)
    print("Testing Tabular Models (tab_*.joblib system)")
    print("=" * 50)

    import json
    import joblib
    from pathlib import Path
    BASE = Path(__file__).resolve().parent
    MODELS_DIR = BASE / "models" if (BASE / "models").exists() else BASE

    for name in ["heart", "liver", "breast", "disease"]:
        meta_path = MODELS_DIR / f"tab_{name}_meta.json"
        ml_path = MODELS_DIR / f"tab_{name}_ml.joblib"

        if not ml_path.exists():
            print(f"  [{name}] SKIP - model not trained")
            continue

        meta = json.load(open(meta_path))
        bundle = joblib.load(ml_path)
        imp = bundle["imputer"]
        model = bundle["model"]

        cols = meta.get("columns", [])
        n = len(cols)
        sample = np.zeros((1, n))
        sample = imp.transform(sample)

        pred = model.predict(sample)[0]
        proba = model.predict_proba(sample)[0]
        classes = meta.get("classes", [])

        label = classes[int(pred)] if int(pred) < len(classes) else str(pred)
        print(f"  [{name}] Prediction: {label} | Confidence: {proba.max():.3f} | Classes: {len(classes)}")

    print()


def test_symptom_prediction():
    """Test the symptom analysis pipeline."""
    print("=" * 50)
    print("Testing Symptom Prediction Pipeline")
    print("=" * 50)

    from models import predict_disease

    test_symptoms = [
        ["fever", "headache", "body ache"],
        ["chest pain", "breathlessness"],
        ["skin rash", "itching", "redness"],
    ]

    for symptoms in test_symptoms:
        result = predict_disease(symptoms)
        print(f"  Symptoms: {', '.join(symptoms)}")
        print(f"    => {result.get('name', '?')} (conf: {result.get('confidence', 0)*100:.0f}%)")

    print()


def test_chatbot():
    """Test the RAG chatbot response."""
    print("=" * 50)
    print("Testing Medical RAG Chatbot")
    print("=" * 50)

    from chatbot import get_chatbot_response

    medical_q = "What are the symptoms of diabetes?"
    response = get_chatbot_response(medical_q)
    print(f"  Medical Q: {medical_q}")
    print(f"  Response: {response[:150]}...")

    non_medical_q = "What is the weather today?"
    response = get_chatbot_response(non_medical_q)
    print(f"  Non-Medical Q: {non_medical_q}")
    print(f"  Response: {response[:150]}...")

    print()


if __name__ == "__main__":
    test_tabular_models()
    test_symptom_prediction()
    test_chatbot()
    print("All inference tests completed!")
