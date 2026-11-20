"""
VidCare AI - Medical RAG Chatbot Service
Integrates Google Gemini API with clinical domain guardrails and fallback knowledge retrieval.
"""
from gemini_service import ask_medical_rag_gemini

def get_chatbot_response(message):
    """
    Returns AI-generated clinical response from Google Gemini model
    with strict domain boundaries and safety protocols.
    """
    if not message or not message.strip():
        return "Please provide a medical question or describe your symptoms so I can assist you."
        
    return ask_medical_rag_gemini(message.strip())
