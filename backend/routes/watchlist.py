from flask import Blueprint, jsonify, request
from services.supabase_client import supabase

watchlist_bp = Blueprint('watchlist', __name__)

@watchlist_bp.route('/<user_id>', methods=['GET'])
def get_watchlist(user_id):
    """Get user's watchlist"""
    try:
        response = supabase.table('watchlist').select('*').eq('user_id', user_id).execute()
        return jsonify({"watchlist": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@watchlist_bp.route('/', methods=['POST'])
def add_to_watchlist():
    """Add stock to watchlist"""
    try:
        data = request.get_json()
        response = supabase.table('watchlist').insert(data).execute()
        return jsonify({"success": True, "data": response.data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@watchlist_bp.route('/<watchlist_id>', methods=['DELETE'])
def remove_from_watchlist(watchlist_id):
    """Remove stock from watchlist"""
    try:
        response = supabase.table('watchlist').delete().eq('id', watchlist_id).execute()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
