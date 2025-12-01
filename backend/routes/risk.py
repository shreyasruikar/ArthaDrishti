from flask import Blueprint, jsonify
import os
import json
from groq import Groq

risk_bp = Blueprint('risk', __name__)

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))

@risk_bp.route('/assess/<symbol>', methods=['GET'])
def assess_risk(symbol):
    """AI-powered risk assessment for a stock"""
    from services.indian_stock_generator import indian_stock_gen
    
    stock = indian_stock_gen.get_stock_data(symbol)
    if not stock:
        return jsonify({"error": "Stock not found"}), 404
    
    prompt = f"""You are a financial risk analyst. Analyze this Indian stock and provide a concise risk assessment.

Stock: {stock['name']} ({stock['symbol']})
Sector: {stock['sector']}
Price: ₹{stock['price']}
P/E Ratio: {stock['pe']}
ROE: {stock['roe']}%
Debt Ratio: {stock['debtRatio']}
Market Cap: ₹{stock['marketCap']} Cr

Provide a JSON response with:
1. "level": Risk level (Low/Moderate/High)
2. "score": Risk score 1-10 (10 = highest risk)
3. "explanation": 2-3 sentence explanation of key risk factors

Example format:
{{"level": "Moderate", "score": 5, "explanation": "The company shows decent profitability with ROE above 15%, but carries moderate debt. Valuation appears reasonable for the sector."}}

Return only valid JSON, no markdown or extra text.
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=300
        )
        
        result = response.choices[0].message.content.strip()

        # --- Clean markdown safely ---
        if result.startswith("```"):
            # Remove ```json ... ``` wrapper
            parts = result.split("```")
            if len(parts) >= 2:
                cleaned = parts[1].strip()
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:].strip()
                result = cleaned
        
        # Parse JSON
        risk_data = json.loads(result)
        
        return jsonify({
            "symbol": symbol,
            "risk": risk_data
        }), 200
    
    except Exception as e:
        print(f"Error in risk assessment: {str(e)}")
        return jsonify({
            "symbol": symbol,
            "risk": {
                "level": "Moderate",
                "score": 5,
                "explanation": "Unable to generate AI assessment. Please check fundamentals manually."
            }
        }), 200
