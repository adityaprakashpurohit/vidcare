"""Quick API test for running Flask server."""
import urllib.request
import json

BASE = "http://127.0.0.1:5000"

def test_endpoint(method, path, data=None):
    url = f"{BASE}{path}"
    try:
        if data:
            req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
        else:
            req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            return resp.status, result
    except Exception as e:
        return None, str(e)


print("=" * 60)
print("  VidCare API Endpoint Tests")
print("=" * 60)

# 1. Root
code, data = test_endpoint("GET", "/")
print(f"\n1. GET / => {code}")
print(f"   Service: {data.get('service', '?')}")

# 2. Diseases catalog
code, data = test_endpoint("GET", "/api/diseases")
print(f"\n2. GET /api/diseases => {code}")
if isinstance(data, list):
    for d in data:
        print(f"   - {d['name']:12s} | {d['title']:25s} | kind={d['kind']:8s} | acc={d['specs']['accuracy']}")

# 3. Symptom prediction
code, data = test_endpoint("POST", "/api/predict", {"symptoms": ["fever", "headache", "cough"]})
print(f"\n3. POST /api/predict => {code}")
if isinstance(data, dict) and "prediction" in data:
    p = data["prediction"]
    print(f"   Prediction: {p.get('name', '?')} ({p.get('confidence', 0)*100:.0f}%)")

# 4. Chat
code, data = test_endpoint("POST", "/api/chat", {"message": "What causes high blood pressure?"})
print(f"\n4. POST /api/chat => {code}")
if isinstance(data, dict) and "response" in data:
    print(f"   Response: {data['response'][:120]}...")

# 5. Heart prediction (tabular)
code, data = test_endpoint("POST", "/api/predict/heart", {"Age": 55, "Sex": "M", "ChestPainType": "ATA", "RestingBP": 140, "Cholesterol": 250, "FastingBS": 0, "RestingECG": "Normal", "MaxHR": 150, "ExerciseAngina": "N", "Oldpeak": 1.0, "ST_Slope": "Flat"})
print(f"\n5. POST /api/predict/heart => {code}")
if isinstance(data, dict):
    print(f"   Finding: {data.get('finding', '?')}")
    print(f"   Risk: {data.get('risk_label', '?')} ({data.get('confidence', '?')}%)")

# 6. Liver prediction (tabular)
code, data = test_endpoint("POST", "/api/predict/liver", {"Age": 45, "Gender": "Male", "Total_Bilirubin": 2.5, "Direct_Bilirubin": 1.2, "Alkaline_Phosphotase": 350, "Alamine_Aminotransferase": 55, "Aspartate_Aminotransferase": 60, "Total_Protiens": 6.0, "Albumin": 2.8, "Albumin_and_Globulin_Ratio": 0.8})
print(f"\n6. POST /api/predict/liver => {code}")
if isinstance(data, dict):
    print(f"   Finding: {data.get('finding', '?')}")
    print(f"   Risk: {data.get('risk_label', '?')} ({data.get('confidence', '?')}%)")

# 7. BMI
code, data = test_endpoint("POST", "/api/bmi", {"weight": 75, "height": 170})
print(f"\n7. POST /api/bmi => {code}")
if isinstance(data, dict):
    print(f"   BMI: {data.get('bmi', '?')} - {data.get('category', '?')}")

# 8. Mental health
code, data = test_endpoint("POST", "/api/mental-health", {"score": 12})
print(f"\n8. POST /api/mental-health => {code}")
if isinstance(data, dict):
    print(f"   Severity: {data.get('severity', '?')}")

print(f"\n{'=' * 60}")
print("  All endpoints tested!")
print(f"{'=' * 60}")
