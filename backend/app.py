from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

# ADD THESE DEBUG LINES
print("=" * 50)
print("DEBUG: Environment Variables")
print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL')}")
print(f"SUPABASE_KEY: {os.getenv('SUPABASE_KEY')[:20]}..." if os.getenv('SUPABASE_KEY') else "None")
print(f"ALPHA_VANTAGE_API_KEY: {os.getenv('ALPHA_VANTAGE_API_KEY')}")
print("=" * 50)

from routes.stocks import stocks_bp
# from routes.watchlist import watchlist_bp  # COMMENTED OUT
from routes.screener import screener_bp
from routes.portfolio import portfolio_bp
from routes.risk import risk_bp
from routes.watchlist import watchlist_bp
app = Flask(__name__)

from flask_cors import CORS

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=False,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# Rest of your app.py stays the same...
app.register_blueprint(stocks_bp, url_prefix='/api/stocks')
app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
# app.register_blueprint(watchlist_bp, url_prefix='/api/watchlist')  
app.register_blueprint(screener_bp, url_prefix='/api/screener')
app.register_blueprint(risk_bp, url_prefix='/api/risk')
app.register_blueprint(watchlist_bp, url_prefix='/api/watchlist')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok", 
        "message": "Backend is running!",
        "alpha_vantage_enabled": bool(os.getenv('ALPHA_VANTAGE_API_KEY'))
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
