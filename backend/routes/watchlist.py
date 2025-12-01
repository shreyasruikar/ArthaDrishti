from flask import Blueprint, jsonify, request
from services.supabase_client import supabase

watchlist_bp = Blueprint('watchlist', __name__)

@watchlist_bp.route('/', methods=['GET'])
def get_watchlist():
    """Get user's watchlist"""
    try:
        # Get user from token (you'll need to implement auth middleware)
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        
        # Get user from Supabase
        user = supabase.auth.get_user(token)
        if not user:
            return jsonify({"error": "Invalid token"}), 401
        
        user_id = user.user.id
        
        # Fetch watchlist
        response = supabase.table('watchlist').select('*').eq('user_id', user_id).order('added_at', desc=True).execute()
        
        watchlist = response.data
        
        # Enrich with current stock data
        from services.indian_stock_generator import indian_stock_gen
        
        enriched_watchlist = []
        for item in watchlist:
            stock_data = indian_stock_gen.get_stock_data(item['symbol'])
            if stock_data:
                enriched_watchlist.append({
                    'id': item['id'],
                    'symbol': item['symbol'],
                    'name': stock_data['name'],
                    'price': stock_data['price'],
                    'change': stock_data.get('change', 0),
                    'changePercent': stock_data.get('changePercent', 0),
                    'addedAt': item['added_at']
                })
        
        return jsonify({"watchlist": enriched_watchlist}), 200
        
    except Exception as e:
        print(f"Error fetching watchlist: {str(e)}")
        return jsonify({"error": str(e)}), 500


@watchlist_bp.route('/add', methods=['POST'])
def add_to_watchlist():
    """Add stock to watchlist"""
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        
        if not symbol:
            return jsonify({"error": "Symbol required"}), 400
        
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        
        user = supabase.auth.get_user(token)
        if not user:
            return jsonify({"error": "Invalid token"}), 401
        
        user_id = user.user.id
        
        # Insert into watchlist
        response = supabase.table('watchlist').insert({
            'user_id': user_id,
            'symbol': symbol.upper()
        }).execute()
        
        return jsonify({"message": "Added to watchlist", "data": response.data}), 200
        
    except Exception as e:
        print(f"Error adding to watchlist: {str(e)}")
        return jsonify({"error": str(e)}), 500


@watchlist_bp.route('/remove/<symbol>', methods=['DELETE'])
def remove_from_watchlist(symbol):
    """Remove stock from watchlist"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        
        user = supabase.auth.get_user(token)
        if not user:
            return jsonify({"error": "Invalid token"}), 401
        
        user_id = user.user.id
        
        # Delete from watchlist
        response = supabase.table('watchlist').delete().eq('user_id', user_id).eq('symbol', symbol.upper()).execute()
        
        return jsonify({"message": "Removed from watchlist"}), 200
        
    except Exception as e:
        print(f"Error removing from watchlist: {str(e)}")
        return jsonify({"error": str(e)}), 500


@watchlist_bp.route('/check/<symbol>', methods=['GET'])
def check_in_watchlist(symbol):
    """Check if stock is in user's watchlist"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({"inWatchlist": False}), 200
        
        user = supabase.auth.get_user(token)
        if not user:
            return jsonify({"inWatchlist": False}), 200
        
        user_id = user.user.id
        
        response = supabase.table('watchlist').select('id').eq('user_id', user_id).eq('symbol', symbol.upper()).execute()
        
        return jsonify({"inWatchlist": len(response.data) > 0}), 200
        
    except Exception as e:
        return jsonify({"inWatchlist": False}), 200
