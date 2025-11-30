from flask import Blueprint, jsonify, request
from services.supabase_client import supabase
from services.indian_stock_generator import indian_stock_gen
from datetime import datetime

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/holdings', methods=['GET'])
def get_holdings():
    """Get all portfolio holdings (demo mode, no auth)"""
    try:
        if supabase is None:
            return jsonify({'error': 'Supabase not configured'}), 500

        # Get ALL holdings (no user filtering in demo)
        result = supabase.table('portfolio').select('*').execute()

        holdings = []
        total_invested = 0
        total_current = 0

        for holding in result.data:
            # Get current stock price from generator
            stock = indian_stock_gen.get_stock_data(holding['symbol'])

            if stock:
                invested_value = holding['quantity'] * float(holding['buy_price'])
                current_value = holding['quantity'] * float(stock['price'])
                profit_loss = current_value - invested_value
                profit_loss_percent = (profit_loss / invested_value) * 100 if invested_value > 0 else 0

                holdings.append({
                    'id': holding['id'],
                    'symbol': holding['symbol'],
                    'name': stock['name'],
                    'quantity': holding['quantity'],
                    'buyPrice': float(holding['buy_price']),
                    'currentPrice': float(stock['price']),
                    'investedValue': round(invested_value, 2),
                    'currentValue': round(current_value, 2),
                    'profitLoss': round(profit_loss, 2),
                    'profitLossPercent': round(profit_loss_percent, 2),
                    'buyDate': holding.get('buy_date'),
                    'sector': stock['sector']
                })

                total_invested += invested_value
                total_current += current_value

        total_profit_loss = total_current - total_invested
        total_profit_loss_percent = (total_profit_loss / total_invested) * 100 if total_invested > 0 else 0

        return jsonify({
            'holdings': holdings,
            'summary': {
                'totalInvested': round(total_invested, 2),
                'totalCurrent': round(total_current, 2),
                'totalProfitLoss': round(total_profit_loss, 2),
                'totalProfitLossPercent': round(total_profit_loss_percent, 2)
            }
        }), 200

    except Exception as e:
        print(f"Error fetching holdings: {str(e)}")
        return jsonify({'error': str(e)}), 500


@portfolio_bp.route('/holdings', methods=['POST'])
def add_holding():
    """Add a new holding to portfolio (demo mode)"""
    try:
        if supabase is None:
            return jsonify({'error': 'Supabase not configured'}), 500

        data = request.get_json()

        symbol = data.get('symbol')
        quantity = data.get('quantity')
        buy_price = data.get('buyPrice')
        buy_date = data.get('buyDate', datetime.now().date().isoformat())

        if not all([symbol, quantity, buy_price]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Verify stock exists in generator
        stock = indian_stock_gen.get_stock_data(symbol)
        if not stock:
            return jsonify({'error': 'Stock not found'}), 404

        # Insert into Supabase (no user_id in demo)
        result = supabase.table('portfolio').insert({
            'symbol': symbol,
            'quantity': quantity,
            'buy_price': buy_price,
            'buy_date': buy_date
        }).execute()

        return jsonify({'message': 'Holding added successfully', 'data': result.data}), 201

    except Exception as e:
        print(f"Error adding holding: {str(e)}")
        return jsonify({'error': str(e)}), 500


@portfolio_bp.route('/holdings/<holding_id>', methods=['DELETE'])
def delete_holding(holding_id):
    """Delete a holding from portfolio (demo mode)"""
    try:
        if supabase is None:
            return jsonify({'error': 'Supabase not configured'}), 500

        supabase.table('portfolio').delete().eq('id', holding_id).execute()

        return jsonify({'message': 'Holding deleted successfully'}), 200

    except Exception as e:
        print(f"Error deleting holding: {str(e)}")
        return jsonify({'error': str(e)}), 500


@portfolio_bp.route('/holdings/<holding_id>', methods=['PUT'])
def update_holding(holding_id):
    """Update a holding (demo mode)"""
    try:
        if supabase is None:
            return jsonify({'error': 'Supabase not configured'}), 500

        data = request.get_json()

        update_data = {}
        if 'quantity' in data:
            update_data['quantity'] = data['quantity']
        if 'buyPrice' in data:
            update_data['buy_price'] = data['buyPrice']
        if 'buyDate' in data:
            update_data['buy_date'] = data['buyDate']

        update_data['updated_at'] = datetime.now().isoformat()

        result = supabase.table('portfolio').update(update_data).eq('id', holding_id).execute()

        return jsonify({'message': 'Holding updated successfully', 'data': result.data}), 200

    except Exception as e:
        print(f"Error updating holding: {str(e)}")
        return jsonify({'error': str(e)}), 500
