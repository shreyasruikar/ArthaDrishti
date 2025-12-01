"""
Indian Stock Data Generator using real market data
"""
import random
from datetime import datetime, timedelta
from data.indian_stocks_real import INDIAN_STOCKS_DATA, get_stock_by_symbol, get_all_symbols


class IndianStockGenerator:
    def __init__(self):
        self.stocks = INDIAN_STOCKS_DATA
        self.symbols = get_all_symbols()
    
    def get_stock_data(self, symbol):
        """Get real stock data by symbol"""
        stock = get_stock_by_symbol(symbol)
        if not stock:
            return None
        
        # Add slight price variation to simulate live market (±1%)
        price_variation = random.uniform(-0.01, 0.01)
        current_price = stock['price'] * (1 + price_variation)
        
        # Calculate change from base price
        change = current_price - stock['price']
        change_percent = (change / stock['price']) * 100
        
        return {
            'symbol': stock['symbol'],
            'name': stock['name'],
            'price': round(current_price, 2),
            'change': round(change, 2),
            'changePercent': round(change_percent, 2),
            'volume': random.randint(100000, 10000000),
            'marketCap': stock['market_cap'],
            'pe': stock['pe_ratio'],
            'peRatio': stock['pe_ratio'],
            'dividendYield': stock['dividend_yield'],
            'week52High': round(current_price * random.uniform(1.1, 1.3), 2),
            'week52Low': round(current_price * random.uniform(0.7, 0.9), 2),
            'sector': stock['sector'],
            'roce': stock['roce'],
            'roe': stock['roce'],
            'debtRatio': round(random.uniform(0.1, 1.5), 2),
            'quarterlyProfit': stock['quarterly_profit'],
            'profitGrowth': stock['profit_growth'],
            'quarterlySales': stock['quarterly_sales'],
            'salesGrowth': stock['sales_growth']
        }
    
    def get_all_stocks(self, limit=None):
        """Get all stocks with optional limit"""
        all_stocks = []
        symbols = self.symbols[:limit] if limit else self.symbols
        
        for symbol in symbols:
            stock_data = self.get_stock_data(symbol)
            if stock_data:
                all_stocks.append(stock_data)
        
        return all_stocks
    
    def search_stocks(self, query):
        """Search stocks by symbol or name"""
        query = query.lower()
        results = []
        
        for stock in self.stocks:
            if (query in stock['symbol'].lower() or 
                query in stock['name'].lower()):
                stock_data = self.get_stock_data(stock['symbol'])
                if stock_data:
                    results.append(stock_data)
        
        return results[:10]  # Limit to 10 results
    
    def filter_stocks(self, filters):
        """
        Filter stocks based on criteria
        filters: dict with keys like 'minPrice', 'maxPrice', 'minPE', 'maxPE', 
                'sector', 'minMarketCap', 'minDividendYield', etc.
        """
        filtered = []
        
        for stock in self.stocks:
            # Apply filters
            if 'minPrice' in filters and stock['price'] < filters['minPrice']:
                continue
            if 'maxPrice' in filters and stock['price'] > filters['maxPrice']:
                continue
            if 'minPE' in filters and stock['pe_ratio'] and stock['pe_ratio'] < filters['minPE']:
                continue
            if 'maxPE' in filters and stock['pe_ratio'] and stock['pe_ratio'] > filters['maxPE']:
                continue
            if 'sector' in filters and stock['sector'] != filters['sector']:
                continue
            if 'minMarketCap' in filters and stock['market_cap'] < filters['minMarketCap']:
                continue
            if 'minDividendYield' in filters and stock['dividend_yield'] < filters['minDividendYield']:
                continue
            if 'minROCE' in filters and stock['roce'] < filters['minROCE']:
                continue
            
            stock_data = self.get_stock_data(stock['symbol'])
            if stock_data:
                filtered.append(stock_data)
        
        return filtered
    
    def get_historical_data(self, symbol, days=30):
        """Generate historical price data"""
        stock = get_stock_by_symbol(symbol)
        if not stock:
            return None
        
        historical = []
        current_price = stock['price']
        
        for i in range(days, 0, -1):
            date = datetime.now() - timedelta(days=i)
            # Generate realistic price movement (±2% daily)
            daily_change = random.uniform(-0.02, 0.02)
            price = current_price * (1 + daily_change)
            
            historical.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(price * random.uniform(0.98, 1.02), 2),
                'high': round(price * random.uniform(1.00, 1.03), 2),
                'low': round(price * random.uniform(0.97, 1.00), 2),
                'close': round(price, 2),
                'volume': random.randint(100000, 5000000)
            })
            
            current_price = price
        
        return historical
    
    def get_top_gainers(self, limit=10):
        """Get top gaining stocks"""
        all_stocks = self.get_all_stocks()
        sorted_stocks = sorted(all_stocks, key=lambda x: x['changePercent'], reverse=True)
        return sorted_stocks[:limit]
    
    def get_top_losers(self, limit=10):
        """Get top losing stocks"""
        all_stocks = self.get_all_stocks()
        sorted_stocks = sorted(all_stocks, key=lambda x: x['changePercent'])
        return sorted_stocks[:limit]
    
    def get_most_active(self, limit=10):
        """Get most active stocks by volume"""
        all_stocks = self.get_all_stocks()
        sorted_stocks = sorted(all_stocks, key=lambda x: x['volume'], reverse=True)
        return sorted_stocks[:limit]
    
    def get_sector_stocks(self, sector):
        """Get all stocks in a sector"""
        sector_stocks = []
        
        for stock in self.stocks:
            if stock['sector'].lower() == sector.lower():
                stock_data = self.get_stock_data(stock['symbol'])
                if stock_data:
                    sector_stocks.append(stock_data)
        
        return sector_stocks


# Create singleton instance
indian_stock_gen = IndianStockGenerator()
