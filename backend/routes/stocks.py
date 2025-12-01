from flask import Blueprint, jsonify, request
from services.indian_stock_generator import indian_stock_gen, INDIAN_STOCKS
from services.ai_search import ai_search  # MOVE THIS TO TOP!
import random


stocks_bp = Blueprint('stocks', __name__)

@stocks_bp.route('/data', methods=['POST'])
def get_stock_data():
    """Get real-time stock data for given symbols"""
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        
        if not symbols:
            return jsonify({"error": "No symbols provided"}), 400
        
        stocks = []
        for symbol in symbols:
            stock_data = indian_stock_gen.get_stock_data(symbol)
            if stock_data:
                stocks.append(stock_data)
        
        return jsonify({"stocks": stocks}), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    


@stocks_bp.route('/all', methods=['GET'])
def get_all_stocks():
    """Get all available stocks"""
    try:
        stocks = []
        for symbol in INDIAN_STOCKS.keys():
            stock_data = indian_stock_gen.get_stock_data(symbol)
            if stock_data:
                stocks.append(stock_data)
        
        return jsonify({"stocks": stocks}), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@stocks_bp.route('/detail/<symbol>', methods=['GET'])
def get_stock_detail(symbol):
    """Get detailed information for a specific stock"""
    try:
        stock = indian_stock_gen.get_stock_data(symbol)
        if stock:
            # Add extra details
            stock['eps'] = round(stock['price'] / stock['pe'], 2) if stock['pe'] > 0 else 0
            stock['dividendYield'] = round((hash(symbol) % 5) + 0.5, 2)
            stock['week52High'] = round(stock['price'] * 1.15, 2)
            stock['week52Low'] = round(stock['price'] * 0.85, 2)
            return jsonify(stock), 200
        
        return jsonify({"error": "Stock not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stocks_bp.route('/historical/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    """Get historical data for a stock"""
    try:
        days = request.args.get('days', 30, type=int)
        historical = indian_stock_gen.get_historical_data(symbol, days)
        
        if not historical:
            return jsonify({"error": "Stock not found or data unavailable"}), 404
        
        return jsonify({"symbol": symbol, "data": historical}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stocks_bp.route('/search', methods=['POST'])
def ai_search_stocks():
    """AI-powered natural language stock search"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({"error": "No query provided"}), 400
        
        # Parse query with AI
        filters = ai_search.parse_query(query)
        
        if not filters:
            return jsonify({
                "error": "Could not understand query",
                "filters": {}
            }), 200
        
        return jsonify({
            "filters": filters,
            "query": query
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
