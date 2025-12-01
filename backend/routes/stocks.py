from flask import Blueprint, jsonify, request
from services.indian_stock_generator import indian_stock_gen
from services.ai_search import ai_search
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
@stocks_bp.route('/', methods=['GET'])  # Added this alias
def get_all_stocks():
    """Get all available stocks"""
    try:
        limit = request.args.get('limit', type=int)
        stocks = indian_stock_gen.get_all_stocks(limit=limit)
        return jsonify({"stocks": stocks, "total": len(stocks)}), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/detail/<symbol>', methods=['GET'])
@stocks_bp.route('/<symbol>', methods=['GET'])  # Added this alias
def get_stock_detail(symbol):
    """Get detailed information for a specific stock"""
    try:
        stock = indian_stock_gen.get_stock_data(symbol.upper())
        
        if not stock:
            return jsonify({"error": "Stock not found"}), 404
        
        return jsonify(stock), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/historical/<symbol>', methods=['GET'])
@stocks_bp.route('/<symbol>/history', methods=['GET'])  # Added this alias
def get_historical_data(symbol):
    """Get historical data for a stock"""
    try:
        days = request.args.get('days', default=30, type=int)
        historical = indian_stock_gen.get_historical_data(symbol.upper(), days=days)
        
        if not historical:
            return jsonify({"error": "Stock not found or data unavailable"}), 404
        
        return jsonify({"symbol": symbol.upper(), "history": historical, "data": historical}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/search', methods=['GET', 'POST'])
def search_stocks():
    """
    Search stocks by query string (GET) or AI-powered natural language (POST)
    """
    try:
        if request.method == 'POST':
            # AI-powered search
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
        
        else:
            # Simple text search (GET)
            query = request.args.get('q', '')
            
            if not query:
                return jsonify({"error": "Query parameter required"}), 400
            
            results = indian_stock_gen.search_stocks(query)
            return jsonify({"results": results, "total": len(results)}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/filter', methods=['POST'])
def filter_stocks():
    """Filter stocks based on criteria"""
    try:
        filters = request.get_json()
        
        if not filters:
            return jsonify({"error": "Filters required"}), 400
        
        results = indian_stock_gen.filter_stocks(filters)
        return jsonify({"stocks": results, "total": len(results)}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/top-gainers', methods=['GET'])
def get_top_gainers():
    """Get top gaining stocks"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        gainers = indian_stock_gen.get_top_gainers(limit=limit)
        return jsonify({"gainers": gainers}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/top-losers', methods=['GET'])
def get_top_losers():
    """Get top losing stocks"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        losers = indian_stock_gen.get_top_losers(limit=limit)
        return jsonify({"losers": losers}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/most-active', methods=['GET'])
def get_most_active():
    """Get most active stocks"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        active = indian_stock_gen.get_most_active(limit=limit)
        return jsonify({"active": active}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@stocks_bp.route('/sector/<sector>', methods=['GET'])
def get_sector_stocks(sector):
    """Get all stocks in a sector"""
    try:
        stocks = indian_stock_gen.get_sector_stocks(sector)
        return jsonify({"sector": sector, "stocks": stocks, "total": len(stocks)}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
