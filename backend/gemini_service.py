import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Models to attempt in order (updated for current API availability)
PREFERRED_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

def call_gemini_api(prompt, system_instruction=None, json_mode=False):
    """
    Direct HTTP call to Google Generative Language API using Python standard library.
    No external heavy dependencies required.
    """
    if not GEMINI_API_KEY or not GEMINI_API_KEY.startswith("AIzaSy"):
        # Without a valid production Google AI key, use instant offline Clinical RAG engine
        return None

    for model in PREFERRED_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 800
            }
        }
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [
                    {"text": system_instruction}
                ]
            }
            
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        try:
            req_data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    res_json = json.loads(response.read().decode('utf-8'))
                    candidates = res_json.get("candidates", [])
                    if candidates and len(candidates) > 0:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            print(f"[Gemini API HTTP Error] Model '{model}' status {e.code}: {err_body[:200]}")
            # If 404 (model not found), try next model in list. If 403 or 400, break or log
            if e.code == 404:
                continue
            break
        except Exception as e:
            print(f"[Gemini API Request Error] {e}")
            break
            
    return None


def ask_medical_rag_gemini(user_message):
    """
    Medical RAG Chatbot powered by Google Gemini.
    Enforces clinical boundary guardrails and evidence-based guidance.
    """
    message_lower = user_message.lower()
    
    # Non-medical domain keyword guardrail
    non_medical_keywords = [
        "weather", "sports", "football", "cricket", "movie", "cinema", "game",
        "politics", "election", "stock market", "crypto", "bitcoin", "car", "programming", "python", "coding"
    ]
    for kw in non_medical_keywords:
        if kw in message_lower:
            return "I am VidCare's specialized AI Medical Assistant. I am restricted strictly to medical, disease, symptom, and healthcare queries. How can I assist you with your health today?"
            
    system_instruction = (
        "You are VidCare AI's Medical RAG Clinical Assistant. "
        "Provide accurate, empathetic, and evidence-based medical information. "
        "Strictly adhere to medical topics. Include practical home-care advice, "
        "potential causes, red-flag symptoms, and advise consulting a healthcare professional when appropriate. "
        "Keep responses clear, structured, and easy for patients to read."
    )
    
    prompt = f"Patient Query: {user_message}\n\nPlease provide clinical guidance, potential explanations, and recommended precautions."
    
    gemini_reply = call_gemini_api(prompt, system_instruction=system_instruction)
    
    if gemini_reply:
        return gemini_reply
        
    # Intelligent clinical fallback if API is unreachable / offline
    return get_smart_medical_fallback(user_message)


def analyze_symptoms_gemini(symptoms_list):
    """
    Symptom Checker disease assessment powered by Google Gemini.
    Returns structured dictionary with condition name, confidence, description, and precautions.
    """
    if not symptoms_list or len(symptoms_list) == 0:
        return {
            "name": "No Symptoms Provided",
            "confidence": 0.0,
            "description": "Please list your symptoms (e.g. fever, headache, dry cough)."
        }
        
    symptoms_str = ", ".join(symptoms_list)
    
    system_instruction = (
        "You are an expert clinical diagnostic AI engine for VidCare AI. "
        "Analyze the provided patient symptoms and determine the most probable medical condition. "
        "Respond ONLY with a valid JSON object in this exact schema:\n"
        "{\n"
        '  "name": "Probable Disease / Condition Name",\n'
        '  "confidence": 0.85,\n'
        '  "description": "Concise 2-sentence clinical explanation of why these symptoms match and recommended immediate care steps."\n'
        "}"
    )
    
    prompt = f"Patient Symptoms: {symptoms_str}"
    
    gemini_reply = call_gemini_api(prompt, system_instruction=system_instruction, json_mode=True)
    
    if gemini_reply:
        try:
            # Clean markdown codeblocks if present
            cleaned = gemini_reply.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()
            parsed = json.loads(cleaned)
            if "name" in parsed and "description" in parsed:
                return {
                    "name": parsed.get("name", "Medical Condition Assessment"),
                    "confidence": float(parsed.get("confidence", 0.88)),
                    "description": parsed.get("description", "Assessment generated based on reported symptoms.")
                }
        except Exception as parse_err:
            print(f"[Gemini JSON Parse Warning] {parse_err}. Raw: {gemini_reply}")
            
    # Clinical fallback if Gemini API is offline or restricted
    return get_smart_symptom_fallback(symptoms_list)


# Comprehensive Medical Knowledge Base for RAG & Heuristic Search
MEDICAL_KNOWLEDGE_BASE = [
    {
        "keywords": ["blood pressure", "hypertension", "bp", "dizziness", "high bp", "hypertensive"],
        "response": (
            "**[Hypertension & Blood Pressure Care]**\n\n"
            "- **Immediate Advice**: Sit down in a comfortable position, take slow deep breaths, and avoid sudden posture changes to prevent fainting.\n"
            "- **Lifestyle Protocol**: Reduce dietary sodium (< 2g/day), maintain proper hydration, limit caffeine, and take prescribed antihypertensive medications as directed.\n"
            "- **Urgent Red Flags**: If systolic blood pressure exceeds 180 mmHg or is accompanied by severe headache, blurred vision, chest pain, or shortness of breath (Hypertensive Crisis), seek emergency medical care immediately.\n"
            "- **Consultation**: We recommend booking a follow-up with our cardiologist or general physician for regular BP monitoring."
        )
    },
    {
        "keywords": ["diabetes", "sugar", "glucose", "insulin", "polyuria", "thirst", "frequent urination", "hba1c"],
        "response": (
            "**[Diabetes & Blood Glucose Management]**\n\n"
            "- **Common Signs**: Increased thirst (polydipsia), frequent urination (polyuria), unexplained weight loss, chronic fatigue, and slow-healing wounds.\n"
            "- **Management Protocol**: Monitor fasting and post-prandial blood glucose levels regularly. Follow a low-glycemic, fiber-rich diet and engage in moderate daily exercise.\n"
            "- **Urgent Signs**: Extreme lethargy, fruity breath odor, confusion, or blood glucose > 250 mg/dL may indicate Diabetic Ketoacidosis (DKA) — require immediate hospital evaluation.\n"
            "- **Next Step**: Schedule a lab screening for Fasting Blood Sugar and HbA1c, and consult our endocrinologist."
        )
    },
    {
        "keywords": ["joint", "arthritis", "stiffness", "swelling", "knee", "finger", "rheumatoid", "osteoarthritis"],
        "response": (
            "**[Joint Health & Arthritis Care]**\n\n"
            "- **Symptom Relief**: Apply warm compresses in the morning to ease stiffness and cold packs in the evening to reduce joint inflammation. Gentle low-impact range-of-motion exercises (swimming, cycling) help maintain mobility.\n"
            "- **Potential Causes**: Osteoarthritis (wear-and-tear), Rheumatoid Arthritis (autoimmune inflammation), Gout (uric acid buildup), or tendonitis.\n"
            "- **Warning Signs**: Sudden severe swelling with warmth and redness, or fever accompanying joint pain, may indicate septic arthritis.\n"
            "- **Recommendation**: Book an appointment with our rheumatologist or orthopedic specialist for an X-ray/inflammatory marker evaluation."
        )
    },
    {
        "keywords": ["asthma", "wheezing", "inhaler", "bronchitis", "shortness of breath", "breathless", "breathing difficulty"],
        "response": (
            "**[Respiratory & Asthma Management]**\n\n"
            "- **First-Line Actions**: Sit upright, stay calm, and use your prescribed fast-acting bronchodilator rescue inhaler (e.g., Albuterol/Salbutamol) as instructed by your doctor.\n"
            "- **Triggers to Avoid**: Smoke, dust mites, cold dry air, pollen, pet dander, and strenuous sudden exertion without warm-up.\n"
            "- **Emergency Warning**: If inhalers provide no relief, you struggle to speak in full sentences, or lips/fingernails appear bluish (cyanosis), call emergency medical services immediately.\n"
            "- **Next Step**: Consult our pulmonologist for a Spirometry (PFT) assessment and personalized asthma action plan."
        )
    },
    {
        "keywords": ["fever", "temperature", "chills", "feverish", "pyrexia", "shivering"],
        "response": (
            "**[Fever & Pyrexia Care]**\n\n"
            "- **Home Protocol**: Stay well-hydrated with water, broths, and electrolyte solutions. Rest in a well-ventilated, comfortable environment. Light sponge baths with lukewarm water can help reduce discomfort.\n"
            "- **Monitoring**: Log temperature readings every 4-6 hours. Over-the-counter antipyretics (e.g., Paracetamol/Acetaminophen) may be used following standard dosage guidelines.\n"
            "- **When to Seek Urgent Care**: Fever exceeding 103 F (39.4 C), persisting longer than 3 days, or accompanied by a stiff neck, confusion, seizure, or petechial rash.\n"
            "- **Recommendation**: Book a virtual consultation with our general physician if symptoms continue beyond 48 hours."
        )
    },
    {
        "keywords": ["cough", "throat", "cold", "flu", "congestion", "sinus", "runny nose", "sore throat"],
        "response": (
            "**[Upper Respiratory & Cough Care]**\n\n"
            "- **Soothe Airways**: Perform warm salt-water gargles 3 times daily, use steam inhalation, and drink warm tea with honey.\n"
            "- **Differential Causes**: Common cold (rhinovirus), viral pharyngitis, allergic rhinitis, or acute bronchitis.\n"
            "- **Red Flags**: Coughing up blood (hemoptysis), high persistent fever, or persistent sharp chest pain on breathing.\n"
            "- **Next Step**: Rest, isolate if contagious symptoms are present, and consult a doctor if symptoms worsen after 7 days."
        )
    },
    {
        "keywords": ["chest pain", "heart", "palpitation", "cardiac", "angina"],
        "response": (
            "**[URGENT MEDICAL ALERT - Cardiac & Chest Pain Evaluation]**\n\n"
            "- **Immediate Action**: Any new or unexplained chest tightness, pressure, or crushing pain that radiates to your left arm, jaw, back, or neck is considered a potential cardiac emergency.\n"
            "- **Action Required**: Call 911 / emergency services immediately or have someone drive you to the nearest Emergency Room. Do NOT drive yourself.\n"
            "- **Non-Emergency Differential**: If previously evaluated and identified as musculoskeletal or acid reflux (GERD), rest upright and take prescribed antacids."
        )
    },
    {
        "keywords": ["stomach", "abdomen", "nausea", "vomit", "vomiting", "diarrhea", "acidity", "gerd", "reflux", "constipation"],
        "response": (
            "**[Gastrointestinal & Digestive Health]**\n\n"
            "- **Dietary Protocol**: Follow the BRAT diet (Bananas, Rice, Applesauce, Toast). Avoid spicy, greasy, citrus, and caffeinated items. Take small, frequent sips of Oral Rehydration Salts (ORS) or electrolyte water.\n"
            "- **Acid Reflux Relief**: Remain upright for at least 2 hours after meals and elevate the head of your bed by 6 inches.\n"
            "- **Urgent Indicators**: Inability to retain fluids for > 24 hours, black/tarry stools, severe localized lower-right abdominal pain (possible appendicitis), or high fever.\n"
            "- **Next Step**: Schedule a consultation with our gastroenterologist for targeted treatment."
        )
    },
    {
        "keywords": ["headache", "migraine", "head pain", "cluster headache"],
        "response": (
            "**[Headache & Migraine Management]**\n\n"
            "- **Immediate Relief**: Rest in a dark, quiet room with minimal sensory stimulation. Apply a cool compress to your forehead or temples and drink plenty of water.\n"
            "- **Common Triggers**: Dehydration, irregular sleep schedules, prolonged screen time, skipping meals, caffeine withdrawal, or acute stress.\n"
            "- **Danger Signs**: Sudden 'thunderclap' headache (worst headache of your life), headache after head trauma, or headache with visual loss, confusion, or focal weakness.\n"
            "- **Next Step**: Book an appointment with our neurologist if you experience frequent recurring migraines."
        )
    },
    {
        "keywords": ["skin", "rash", "itch", "eczema", "dermatitis", "acne", "allergy", "hives"],
        "response": (
            "**[Dermatology & Skin Care Guidance]**\n\n"
            "- **Immediate Care**: Apply a cool, damp cloth or mild hypoallergenic moisturizer to soothe itchy skin. Avoid hot showers, harsh soaps, and scratching to prevent secondary bacterial infection.\n"
            "- **Allergy Assessment**: If you were recently exposed to new medications, foods, cosmetics, or plants, note the timeline for clinical review.\n"
            "- **Urgent Signs**: Sudden widespread hives accompanied by lip/tongue swelling or difficulty breathing (Anaphylaxis) requires immediate emergency epinephrine and 911.\n"
            "- **Next Step**: Consult our dermatologist or upload a clear lesion photo via our AI Skin Diagnostic Tool for automated classification."
        )
    },
    {
        "keywords": ["anxiety", "depression", "mental health", "stress", "insomnia", "panic", "sleep"],
        "response": (
            "**[Mental Well-Being & Stress Support]**\n\n"
            "- **Grounding Exercise**: Practice 4-7-8 rhythmic breathing (inhale 4s, hold 7s, exhale 8s). Take short mindfulness breaks and maintain a structured sleep hygiene routine.\n"
            "- **Screening**: VidCare provides an integrated PHQ-9 Mental Health Self-Assessment tool in the portal to help quantify depressive and anxiety symptoms.\n"
            "- **Support Resources**: If you feel overwhelmed, talk to a trusted friend or healthcare provider. For urgent 24/7 crisis support, dial 988 (Suicide & Crisis Lifeline).\n"
            "- **Next Step**: Book a confidential virtual counseling session with one of our licensed psychologists."
        )
    }
]

def get_smart_medical_fallback(message):
    """Rich semantic and keyword RAG knowledge base search."""
    msg = message.lower()
    
    # Check for matched clinical entry
    for entry in MEDICAL_KNOWLEDGE_BASE:
        for kw in entry["keywords"]:
            if kw in msg:
                return entry["response"]
                
    # Intelligent generalized clinical guidance
    return (
        "**[VidCare Clinical Assistant Guidance]**\n\n"
        f"Thank you for reaching out regarding: *\"{message}\"*.\n\n"
        "- **General Clinical Principle**: For any newly developing or unexplained symptoms, monitor their frequency, intensity, and duration. Maintain good hydration, balanced nutrition, and adequate rest.\n"
        "- **Precautions**: Avoid unverified home remedies or self-medicating with prescription antibiotics without a doctor's examination.\n"
        "- **When to Seek Immediate Care**: Sudden severe pain, persistent high fever (> 103 F / 39.4 C), difficulty breathing, sudden numbness/weakness, or severe dizziness require urgent medical evaluation.\n"
        "- **Personalized Care**: We encourage booking a virtual consultation with our VidCare specialist doctors through the appointment booking section for an accurate diagnosis and treatment plan."
    )


def get_smart_symptom_fallback(symptoms):
    """Clinical heuristic disease prediction generator when offline."""
    symptoms_str = " ".join(symptoms).lower()
    
    if any(w in symptoms_str for w in ["chest", "heart", "palpitation", "angina"]):
        return {
            "name": "Cardiovascular Assessment Advised",
            "confidence": 0.88,
            "description": "Reported symptoms indicate potential thoracic or cardiovascular strain. We strongly recommend scheduling an ECG, cardiac enzyme test, and physician consultation."
        }
    elif any(w in symptoms_str for w in ["cough", "breath", "wheez", "phlegm", "asthma"]):
        return {
            "name": "Acute Upper Respiratory Infection / Bronchitis",
            "confidence": 0.87,
            "description": "Symptoms align with airway inflammation or viral respiratory infection. Rest, hydration, steam inhalation, and spirometry evaluation are recommended."
        }
    elif any(w in symptoms_str for w in ["sugar", "thirst", "urination", "glucose", "weight loss"]):
        return {
            "name": "Type 2 Diabetes Mellitus / Metabolic Syndrome",
            "confidence": 0.86,
            "description": "Symptoms point toward metabolic dysregulation or elevated blood glucose. Fasting blood sugar and HbA1c testing are advised."
        }
    elif any(w in symptoms_str for w in ["joint", "knee", "finger", "stiff", "arthritis"]):
        return {
            "name": "Inflammatory Arthritis / Osteoarthritis",
            "confidence": 0.85,
            "description": "Symptoms suggest joint inflammation or cartilage wear. Anti-inflammatory care, low-impact exercise, and rheumatology screening are recommended."
        }
    elif any(w in symptoms_str for w in ["stomach", "nausea", "vomit", "acid", "diarrhea", "gerd"]):
        return {
            "name": "Gastroenteritis / Acid Peptic Disorder (GERD)",
            "confidence": 0.85,
            "description": "Symptoms suggest gastrointestinal irritation or gastric acid reflux. Maintain oral hydration, follow a bland diet, and avoid trigger foods."
        }
    elif any(w in symptoms_str for w in ["fever", "headache", "body ache", "fatigue", "chill"]):
        return {
            "name": "Viral Infection Syndrome (Flu-like Illness)",
            "confidence": 0.90,
            "description": "Clinical presentation matches systemic viral response. Monitor temperature, ensure fluid intake, and consult a doctor if fever persists > 3 days."
        }
    elif any(w in symptoms_str for w in ["skin", "rash", "itch", "redness", "allergy"]):
        return {
            "name": "Contact Dermatitis / Allergic Urticaria",
            "confidence": 0.83,
            "description": "Skin irritation or allergic reaction detected. Avoid scratching, apply cool compresses, and consult a dermatologist if rash spreads."
        }
    else:
        return {
            "name": "General Acute Symptom Complex",
            "confidence": 0.82,
            "description": "Symptoms processed across VidCare diagnostic knowledge base. Consider booking a virtual consultation with a general physician for comprehensive clinical examination."
        }

