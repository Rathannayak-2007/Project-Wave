from flask import Blueprint, request, jsonify
import time

ai_bp = Blueprint('ai_routes', __name__, url_prefix='/api/ai')

@ai_bp.route('/chat', methods=['POST'])
def chat():
    """
    Mock AI Endpoint for Hackathon Demo.
    In a real app, this would call Gemini or OpenAI APIs, injecting the
    current risk score and user message into the prompt context.
    """
    data = request.json
    user_message = data.get("message", "").lower()
    risk_score = data.get("risk_score", 5) # Default to a medium risk
    
    # Simulate AI processing delay for realism
    time.sleep(1.5)
    
    # Generate a smart, context-aware mock response
    response_text = ""
    
    if "asthma" in user_message or "health" in user_message or "breathe" in user_message:
        if risk_score > 7:
            response_text = "I notice you mentioned a respiratory concern like asthma. The current Heat Risk Score is High (over 7). High heat and humidity can trigger asthma attacks. I strongly advise you to stay indoors in air conditioning today. If you must go out, use the map to find the nearest cooling center and carry your inhaler."
        else:
            response_text = "The current conditions are moderate, but since you have respiratory concerns like asthma, please monitor your breathing carefully. Stay hydrated and avoid strenuous outdoor exercise during peak sun hours (12 PM - 4 PM)."
            
    elif "work" in user_message or "outside" in user_message or "outdoor" in user_message:
        if risk_score > 8:
            response_text = "Working outdoors in these conditions (Risk Score > 8) is dangerous. According to our Heat Action Plan, you should take a 15-minute shaded rest break every hour and drink 1 cup of water every 20 minutes. Please inform your supervisor if you feel dizzy or nauseous."
        else:
            response_text = "If you are working outdoors today, ensure you wear lightweight, light-colored clothing. The risk is currently manageable, but keep water nearby and take breaks in the shade if you start to feel fatigued."
            
    elif "water" in user_message or "drink" in user_message:
        response_text = "Hydration is critical. Based on the current heat index, you should aim to drink at least 8-10 glasses of water today. Avoid alcohol and sugary drinks as they can dehydrate you further."
        
    else:
        # Generic response based on risk score
        if risk_score >= 8:
            response_text = "The current Heat Risk Score is Extreme. Please prioritize staying indoors. You can use our map to locate emergency cooling centers if your home does not have air conditioning."
        elif risk_score >= 5:
            response_text = "The heat is moderate today. It's safe for general activities, but please remember to wear sunscreen and stay hydrated."
        else:
            response_text = "Weather conditions are currently safe. Enjoy your day, but always keep an eye on the forecast for sudden changes!"

    return jsonify({
        "status": "success",
        "response": response_text,
        "is_mock": True
    }), 200
