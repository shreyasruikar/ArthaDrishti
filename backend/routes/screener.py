from flask import Blueprint, jsonify, request
from services.indian_stock_generator import indian_stock_gen
from data.indian_stocks_real import INDIAN_STOCKS_DATA

screener_bp = Blueprint('screener', __name__)

@screener_bp.route('/stocks', methods=['GET'])
def get_stocks():
    """Get all stocks for screener"""
    try:
        limit = request.args.get('limit', type=int)
        stocks = indian_stock_gen.get_all_stocks(limit=limit)
        return jsonify({
            "success": True,
            "stocks": stocks,
            "total": len(stocks)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@screener_bp.route('/filter', methods=['POST'])
def filter_stocks():
    """Filter stocks based on criteria"""
    try:
        filters = request.get_json()
        
        if not filters:
            return jsonify({"error": "No filters provided"}), 400
        
        results = indian_stock_gen.filter_stocks(filters)
        
        return jsonify({
            "success": True,
            "stocks": results,
            "total": len(results),
            "filters": filters
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@screener_bp.route('/search', methods=['GET'])
def search_stocks():
    """Search stocks by name or symbol"""
    try:
        query = request.args.get('q', '')
        
        if not query:
            return jsonify({"error": "Search query required"}), 400
        
        results = indian_stock_gen.search_stocks(query)
        
        return jsonify({
            "success": True,
            "results": results,
            "total": len(results)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@screener_bp.route('/sectors', methods=['GET'])
def get_sectors():
    """Get list of all sectors"""
    try:
        sectors = list(set([stock['sector'] for stock in INDIAN_STOCKS_DATA]))
        return jsonify({
            "success": True,
            "sectors": sorted(sectors)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@screener_bp.route('/sector/<sector>', methods=['GET'])
def get_sector_stocks(sector):
    """Get all stocks in a specific sector"""
    try:
        stocks = indian_stock_gen.get_sector_stocks(sector)
        return jsonify({
            "success": True,
            "sector": sector,
            "stocks": stocks,
            "total": len(stocks)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@screener_bp.route('/top-gainers', methods=['GET'])
def top_gainers():
    """Get top gaining stocks"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        gainers = indian_stock_gen.get_top_gainers(limit=limit)
        return jsonify({
            "success": True,
            "gainers": gainers
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@screener_bp.route('/top-losers', methods=['GET'])
def top_losers():
    """Get top losing stocks"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        losers = indian_stock_gen.get_top_losers(limit=limit)
        return jsonify({
            "success": True,
            "losers": losers
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@screener_bp.route('/most-active', methods=['GET'])
def most_active():
    """Get most active stocks by volume"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        active = indian_stock_gen.get_most_active(limit=limit)
        return jsonify({
            "success": True,
            "active": active
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
