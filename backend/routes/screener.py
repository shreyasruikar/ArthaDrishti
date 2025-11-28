from flask import Blueprint, jsonify, request
from services.indian_stock_generator import indian_stock_gen, INDIAN_STOCKS

screener_bp = Blueprint('screener', __name__)

@screener_bp.route('/filter', methods=['POST'])
def filter_stocks():
    """Filter stocks based on criteria"""
    try:
        filters = request.get_json()
        stocks = []
        
        for symbol in INDIAN_STOCKS.keys():
            stock = indian_stock_gen.get_stock_data(symbol)
            if stock:
                stocks.append(stock)
        
        return jsonify({"stocks": stocks, "count": len(stocks)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
