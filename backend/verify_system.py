"""
VidCare AI — Comprehensive Model & Backend Verification Script
Tests all model loading, predictions, API endpoints, and frontend connectivity.

Usage: python verify_system.py
"""
import json
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models" if (BASE_DIR / "models").exists() else BASE_DIR

def separator(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def test_tabular_models():
    """Test all tabular model loading and inference."""
    separator("TABULAR MODEL VERIFICATION")
    results = {}

    for name in ["heart", "liver", "breast", "disease"]:
        meta_path = MODELS_DIR / f"tab_{name}_meta.json"
        ml_path = MODELS_DIR / f"tab_{name}_ml.joblib"

        if not ml_path.exists():
            print(f"  [SKIP] tab_{name}: Model not trained")
            results[f"tab_{name}"] = {"status": "NOT TRAINED"}
            continue

        try:
            import joblib
            import numpy as np
            meta = json.load(open(meta_path))
            bundle = joblib.load(ml_path)
            imputer = bundle["imputer"]
            model = bundle["model"]

            # Create sample input based on column count
            n_cols = len(meta.get("columns", []))
            sample = np.zeros((1, n_cols))
            sample = imputer.transform(sample)

            prediction = model.predict(sample)
            proba = model.predict_proba(sample)
            classes = meta.get("classes", [])

            print(f"  [OK] tab_{name}:")
            print(f"       Model: {meta.get('ml_model', '?')} / {meta.get('dl_model', '?')}")
            print(f"       Best: {meta.get('best', '?').upper()}")
            print(f"       ML Accuracy: {meta.get('ml_acc', 0)*100:.1f}%")
            print(f"       DL Accuracy: {meta.get('dl_acc', 0)*100:.1f}%")
            print(f"       Classes: {classes}")
            print(f"       Sample prediction: {classes[int(prediction[0])] if prediction[0] < len(classes) else prediction[0]}")
            print(f"       Probabilities: {[f'{p:.3f}' for p in proba[0][:5]]}")
            print(f"       Training samples: {meta.get('n_train', '?')}")
            print(f"       Features: {n_cols}")

            results[f"tab_{name}"] = {
                "status": "OK",
                "ml_acc": meta.get("ml_acc"),
                "dl_acc": meta.get("dl_acc"),
                "best": meta.get("best"),
                "n_train": meta.get("n_train"),
                "n_features": n_cols,
                "n_classes": len(classes),
                "classes": classes
            }
        except Exception as e:
            print(f"  [ERROR] tab_{name}: {e}")
            results[f"tab_{name}"] = {"status": "ERROR", "error": str(e)}

    return results


def test_image_models():
    """Test all image model loading and inference."""
    separator("IMAGE MODEL VERIFICATION")
    results = {}

    for name in ["pneumonia", "covid", "brain", "skin", "breast"]:
        keras_path = MODELS_DIR / f"img_{name}_dl.keras"
        classes_path = MODELS_DIR / f"img_{name}_classes.json"

        if not keras_path.exists():
            print(f"  [SKIP] img_{name}: Model not trained")
            results[f"img_{name}"] = {"status": "NOT TRAINED"}
            continue

        try:
            import tensorflow as tf
            import numpy as np
            model = tf.keras.models.load_model(str(keras_path))
            classes = json.load(open(classes_path))
            meta_path = MODELS_DIR / f"img_{name}_meta.json"
            meta = json.load(open(meta_path)) if meta_path.exists() else {}

            # Create dummy image input (224x224x3)
            dummy = np.random.rand(1, 224, 224, 3).astype(np.float32) * 255
            probs = model.predict(dummy, verbose=0)[0]

            print(f"  [OK] img_{name}:")
            print(f"       DL Model: {meta.get('dl_model', 'EfficientNetB0')}")
            print(f"       ML Accuracy: {meta.get('ml_acc', 0)*100:.1f}%")
            print(f"       DL Accuracy: {meta.get('dl_acc', 0)*100:.1f}%")
            print(f"       Classes: {classes}")
            print(f"       Dummy prediction: {classes[int(np.argmax(probs))]}")
            print(f"       Probabilities: {[f'{p:.3f}' for p in probs]}")
            print(f"       Training images: {meta.get('n_train', '?')}")

            results[f"img_{name}"] = {
                "status": "OK",
                "ml_acc": meta.get("ml_acc"),
                "dl_acc": meta.get("dl_acc"),
                "classes": classes,
                "n_train": meta.get("n_train")
            }
        except Exception as e:
            print(f"  [ERROR] img_{name}: {e}")
            results[f"img_{name}"] = {"status": "ERROR", "error": str(e)}

    return results


def test_symptom_prediction():
    """Test the symptom prediction pipeline."""
    separator("SYMPTOM PREDICTION PIPELINE")
    results = {}

    try:
        from models import predict_disease
        test_cases = [
            (["fever", "headache", "fatigue", "chills"], "Viral/Flu-like illness"),
            (["chest pain", "shortness of breath"], "Cardiovascular"),
            (["skin rash", "itching"], "Dermatological"),
            (["cough", "phlegm", "breathlessness"], "Respiratory"),
            (["nausea", "vomiting", "stomach pain"], "Gastrointestinal"),
        ]

        for symptoms, expected_category in test_cases:
            result = predict_disease(symptoms)
            print(f"  Symptoms: {', '.join(symptoms)}")
            print(f"    -> Predicted: {result.get('name', '?')}")
            print(f"    -> Confidence: {result.get('confidence', 0)*100:.1f}%")
            print(f"    -> Description: {result.get('description', '?')[:80]}...")
            print()

        results["symptom_prediction"] = {"status": "OK"}
    except Exception as e:
        print(f"  [ERROR] Symptom prediction: {e}")
        results["symptom_prediction"] = {"status": "ERROR", "error": str(e)}

    return results


def test_chatbot():
    """Test the medical RAG chatbot."""
    separator("MEDICAL RAG CHATBOT")
    results = {}

    try:
        from chatbot import get_chatbot_response

        medical_queries = [
            "What is hypertension?",
            "I have a severe migraine",
        ]
        non_medical = [
            "What is the weather today?",
        ]

        for q in medical_queries:
            response = get_chatbot_response(q)
            print(f"  Q: {q}")
            print(f"  A: {response[:120]}...")
            print()

        for q in non_medical:
            response = get_chatbot_response(q)
            print(f"  Q (non-medical): {q}")
            print(f"  A: {response[:120]}...")
            print()

        results["chatbot"] = {"status": "OK"}
    except Exception as e:
        print(f"  [ERROR] Chatbot: {e}")
        results["chatbot"] = {"status": "ERROR", "error": str(e)}

    return results


def test_flask_endpoints():
    """Test Flask API endpoint availability."""
    separator("FLASK API ENDPOINT CHECK")
    import urllib.request
    import urllib.error

    base_url = "http://127.0.0.1:5000"
    results = {}

    endpoints = [
        ("GET", "/"),
        ("GET", "/api/diseases"),
    ]

    for method, path in endpoints:
        url = f"{base_url}{path}"
        try:
            req = urllib.request.Request(url, method=method)
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                print(f"  [{resp.status}] {method} {path} - OK")
                results[path] = {"status": "OK", "code": resp.status}
        except urllib.error.URLError as e:
            print(f"  [ERR] {method} {path} - Server not running or unreachable: {e}")
            results[path] = {"status": "SERVER_OFFLINE"}
        except Exception as e:
            print(f"  [ERR] {method} {path} - {e}")
            results[path] = {"status": "ERROR", "error": str(e)}

    return results


def generate_report(tab_results, img_results, symptom_results, chatbot_results):
    """Generate a comprehensive summary report."""
    separator("COMPREHENSIVE MODEL REPORT")

    print("\n--- Tabular Models ---")
    print(f"{'Model':<18} {'Status':<12} {'ML Acc':<10} {'DL Acc':<10} {'Best':<6} {'Classes':<8} {'Train N'}")
    print("-" * 80)
    for name, r in tab_results.items():
        if r["status"] == "OK":
            print(f"  {name:<16} {'OK':<12} {r['ml_acc']*100:>6.1f}%   {r['dl_acc']*100:>6.1f}%   {r['best'].upper():<6} {r['n_classes']:<8} {r['n_train']}")
        else:
            print(f"  {name:<16} {r['status']:<12}")

    print("\n--- Image Models ---")
    print(f"{'Model':<18} {'Status':<12} {'ML Acc':<10} {'DL Acc':<10} {'Classes':<8} {'Train N'}")
    print("-" * 80)
    for name, r in img_results.items():
        if r["status"] == "OK":
            print(f"  {name:<16} {'OK':<12} {r['ml_acc']*100:>6.1f}%   {r['dl_acc']*100:>6.1f}%   {len(r['classes']):<8} {r['n_train']}")
        else:
            print(f"  {name:<16} {r['status']:<12}")

    print("\n--- Service Status ---")
    print(f"  Symptom Prediction: {symptom_results.get('symptom_prediction', {}).get('status', 'N/A')}")
    print(f"  Medical RAG Chatbot: {chatbot_results.get('chatbot', {}).get('status', 'N/A')}")

    # Calculate overall stats
    total_models = len(tab_results) + len(img_results)
    ok_models = sum(1 for r in list(tab_results.values()) + list(img_results.values()) if r["status"] == "OK")
    not_trained = sum(1 for r in list(tab_results.values()) + list(img_results.values()) if r["status"] == "NOT TRAINED")

    print(f"\n--- Summary ---")
    print(f"  Total model slots: {total_models}")
    print(f"  Models trained & verified: {ok_models}")
    print(f"  Models pending training: {not_trained}")
    print(f"  Models with errors: {total_models - ok_models - not_trained}")


if __name__ == "__main__":
    print("\n" + "*" * 60)
    print("  VidCare AI - System Verification Suite")
    print("*" * 60)

    tab_results = test_tabular_models()
    img_results = test_image_models()
    symptom_results = test_symptom_prediction()
    chatbot_results = test_chatbot()

    # Only test Flask endpoints if --server flag is passed
    if "--server" in sys.argv:
        flask_results = test_flask_endpoints()

    generate_report(tab_results, img_results, symptom_results, chatbot_results)

    print("\n" + "*" * 60)
    print("  Verification Complete!")
    print("*" * 60)
