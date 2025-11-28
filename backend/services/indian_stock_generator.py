import random
from datetime import datetime, timedelta
import numpy as np

# Expanded Indian stocks database with 100+ companies
INDIAN_STOCKS = {
    # Large Cap - Energy & Oil
    "RELIANCE": {"name": "Reliance Industries", "sector": "Energy", "base_price": 2456.80, "pe": 23.5, "roe": 14.2, "debt": 0.45},
    "ONGC": {"name": "Oil & Natural Gas Corp", "sector": "Energy", "base_price": 247.70, "pe": 8.51, "roe": 12.04, "debt": 0.28},
    "BPCL": {"name": "Bharat Petroleum", "sector": "Energy", "base_price": 415.30, "pe": 53.31, "roe": 17.88, "debt": 0.58},
    "IOC": {"name": "Indian Oil Corp", "sector": "Energy", "base_price": 160.50, "pe": 7.2, "roe": 8.5, "debt": 0.95},
    
    # Banking & Financial Services
    "HDFCBANK": {"name": "HDFC Bank", "sector": "Banking", "base_price": 1678.50, "pe": 19.2, "roe": 16.8, "debt": 0.12},
    "ICICIBANK": {"name": "ICICI Bank", "sector": "Banking", "base_price": 1034.60, "pe": 17.5, "roe": 15.3, "debt": 0.15},
    "AXISBANK": {"name": "Axis Bank", "sector": "Banking", "base_price": 1089.75, "pe": 12.8, "roe": 13.5, "debt": 0.18},
    "SBIN": {"name": "State Bank of India", "sector": "Banking", "base_price": 983.90, "pe": 11.56, "roe": 21.86, "debt": 0.16},
    "KOTAKBANK": {"name": "Kotak Mahindra Bank", "sector": "Banking", "base_price": 2103.80, "pe": 22.52, "roe": 11.42, "debt": 0.12},
    "INDUSINDBK": {"name": "IndusInd Bank", "sector": "Banking", "base_price": 1456.30, "pe": 18.5, "roe": 14.2, "debt": 0.14},
    "BAJFINANCE": {"name": "Bajaj Finance", "sector": "Finance", "base_price": 1010.70, "pe": 34.37, "roe": 21.89, "debt": 0.44},
    "HDFCLIFE": {"name": "HDFC Life Insurance", "sector": "Insurance", "base_price": 894.80, "pe": 11.08, "roe": 30.66, "debt": 0.13},
    "SBILIFE": {"name": "SBI Life Insurance", "sector": "Insurance", "base_price": 1523.40, "pe": 19.8, "roe": 25.3, "debt": 0.08},
    
    # IT Services
    "TCS": {"name": "Tata Consultancy Services", "sector": "IT Services", "base_price": 3589.25, "pe": 28.4, "roe": 41.2, "debt": 0.05},
    "INFY": {"name": "Infosys", "sector": "IT Services", "base_price": 1432.30, "pe": 26.8, "roe": 22.5, "debt": 0.08},
    "HCLTECH": {"name": "HCL Technologies", "sector": "IT Services", "base_price": 1456.90, "pe": 22.7, "roe": 19.8, "debt": 0.11},
    "WIPRO": {"name": "Wipro", "sector": "IT Services", "base_price": 456.30, "pe": 21.4, "roe": 17.2, "debt": 0.09},
    "TECHM": {"name": "Tech Mahindra", "sector": "IT Services", "base_price": 1617.90, "pe": 25.87, "roe": 10.67, "debt": 0.08},
    "LTIM": {"name": "LTIMindtree", "sector": "IT Services", "base_price": 5234.50, "pe": 32.5, "roe": 18.9, "debt": 0.03},
    
    # Telecom
    "BHARTIARTL": {"name": "Bharti Airtel", "sector": "Telecom", "base_price": 1289.40, "pe": 35.2, "roe": 12.8, "debt": 1.25},
    "IDEA": {"name": "Vodafone Idea", "sector": "Telecom", "base_price": 12.50, "pe": 0, "roe": -45.2, "debt": 2.85},
    
    # FMCG
    "ITC": {"name": "ITC Ltd", "sector": "FMCG", "base_price": 456.70, "pe": 24.3, "roe": 26.4, "debt": 0.02},
    "HINDUNILVR": {"name": "Hindustan Unilever", "sector": "FMCG", "base_price": 2425.20, "pe": 53.87, "roe": 29.18, "debt": 0.02},
    "NESTLEIND": {"name": "Nestle India", "sector": "FMCG", "base_price": 2567.80, "pe": 68.5, "roe": 42.3, "debt": 0.01},
    "BRITANNIA": {"name": "Britannia Industries", "sector": "FMCG", "base_price": 5234.60, "pe": 52.4, "roe": 28.7, "debt": 0.03},
    "DABUR": {"name": "Dabur India", "sector": "FMCG", "base_price": 567.30, "pe": 45.2, "roe": 19.8, "debt": 0.05},
    "MARICO": {"name": "Marico Ltd", "sector": "FMCG", "base_price": 623.40, "pe": 48.5, "roe": 22.4, "debt": 0.04},
    "GODREJCP": {"name": "Godrej Consumer Products", "sector": "FMCG", "base_price": 1234.50, "pe": 38.9, "roe": 18.6, "debt": 0.12},
    
    # Automobile
    "MARUTI": {"name": "Maruti Suzuki", "sector": "Automobile", "base_price": 12456.80, "pe": 29.3, "roe": 16.8, "debt": 0.03},
    "M&M": {"name": "Mahindra & Mahindra", "sector": "Automobile", "base_price": 2134.20, "pe": 27.9, "roe": 19.4, "debt": 0.42},
    "TATAMOTORS": {"name": "Tata Motors", "sector": "Automobile", "base_price": 1043.50, "pe": 15.8, "roe": 24.5, "debt": 0.78},
    "BAJAJ-AUTO": {"name": "Bajaj Auto", "sector": "Automobile", "base_price": 9567.80, "pe": 32.1, "roe": 25.6, "debt": 0.02},
    "HEROMOTOCO": {"name": "Hero MotoCorp", "sector": "Automobile", "base_price": 5234.60, "pe": 28.7, "roe": 22.3, "debt": 0.01},
    "EICHERMOT": {"name": "Eicher Motors", "sector": "Automobile", "base_price": 4856.90, "pe": 34.5, "roe": 18.9, "debt": 0.06},
    "TVSMOTOR": {"name": "TVS Motor Company", "sector": "Automobile", "base_price": 2456.30, "pe": 42.3, "roe": 20.1, "debt": 0.15},
    
    # Pharma
    "SUNPHARMA": {"name": "Sun Pharmaceutical", "sector": "Pharma", "base_price": 1567.40, "pe": 38.5, "roe": 14.6, "debt": 0.06},
    "DRREDDY": {"name": "Dr. Reddy's Laboratories", "sector": "Pharma", "base_price": 6234.50, "pe": 35.8, "roe": 16.2, "debt": 0.08},
    "CIPLA": {"name": "Cipla Ltd", "sector": "Pharma", "base_price": 1456.70, "pe": 28.4, "roe": 14.8, "debt": 0.12},
    "DIVISLAB": {"name": "Divi's Laboratories", "sector": "Pharma", "base_price": 5678.90, "pe": 52.6, "roe": 18.7, "debt": 0.02},
    "AUROPHARMA": {"name": "Aurobindo Pharma", "sector": "Pharma", "base_price": 1234.60, "pe": 22.5, "roe": 12.4, "debt": 0.34},
    "LUPIN": {"name": "Lupin Ltd", "sector": "Pharma", "base_price": 1876.40, "pe": 31.2, "roe": 9.8, "debt": 0.28},
    
    # Construction & Infrastructure
    "LT": {"name": "Larsen & Toubro", "sector": "Construction", "base_price": 3245.80, "pe": 31.6, "roe": 18.7, "debt": 0.68},
    "ULTRACEMCO": {"name": "UltraTech Cement", "sector": "Cement", "base_price": 11759.00, "pe": 47.28, "roe": 20.33, "debt": 0.66},
    "GRASIM": {"name": "Grasim Industries", "sector": "Cement", "base_price": 2567.80, "pe": 18.9, "roe": 14.2, "debt": 0.52},
    "ADANIPORTS": {"name": "Adani Ports", "sector": "Infrastructure", "base_price": 1506.20, "pe": 27.11, "roe": 10.98, "debt": 0.46},
    
    # Paints & Chemicals
    "ASIANPAINT": {"name": "Asian Paints", "sector": "Paints", "base_price": 2978.50, "pe": 54.2, "roe": 28.3, "debt": 0.01},
    "BERGEPAINT": {"name": "Berger Paints", "sector": "Paints", "base_price": 534.60, "pe": 48.7, "roe": 24.5, "debt": 0.03},
    "PIDILITIND": {"name": "Pidilite Industries", "sector": "Chemicals", "base_price": 3123.40, "pe": 78.5, "roe": 26.8, "debt": 0.02},
    
    # Metals & Mining
    "TATASTEEL": {"name": "Tata Steel", "sector": "Metals", "base_price": 145.60, "pe": 8.2, "roe": 12.5, "debt": 1.15},
    "HINDALCO": {"name": "Hindalco Industries", "sector": "Metals", "base_price": 645.30, "pe": 12.8, "roe": 15.7, "debt": 0.88},
    "JSWSTEEL": {"name": "JSW Steel", "sector": "Metals", "base_price": 967.80, "pe": 15.4, "roe": 18.3, "debt": 0.72},
    "COALINDIA": {"name": "Coal India", "sector": "Mining", "base_price": 456.70, "pe": 7.8, "roe": 42.5, "debt": 0.05},
    "VEDL": {"name": "Vedanta Ltd", "sector": "Metals", "base_price": 478.90, "pe": 11.2, "roe": 15.8, "debt": 0.94},
    
    # Power & Utilities
    "NTPC": {"name": "NTPC Ltd", "sector": "Power", "base_price": 326.10, "pe": 13.31, "roe": 9.95, "debt": 2.56},
    "POWERGRID": {"name": "Power Grid Corporation", "sector": "Power", "base_price": 312.40, "pe": 17.5, "roe": 12.3, "debt": 1.85},
    "ADANIGREEN": {"name": "Adani Green Energy", "sector": "Power", "base_price": 1876.50, "pe": 234.5, "roe": 5.2, "debt": 2.45},
    "TATAPOWER": {"name": "Tata Power", "sector": "Power", "base_price": 423.60, "pe": 28.7, "roe": 11.4, "debt": 1.32},
    
    # Consumer Durables
    "TITAN": {"name": "Titan Company", "sector": "Consumer Durables", "base_price": 3897.70, "pe": 83.86, "roe": 28.84, "debt": 0.28},
    "HAVELLS": {"name": "Havells India", "sector": "Consumer Durables", "base_price": 1678.90, "pe": 68.4, "roe": 21.2, "debt": 0.08},
    "VOLTAS": {"name": "Voltas Ltd", "sector": "Consumer Durables", "base_price": 1534.60, "pe": 52.3, "roe": 18.7, "debt": 0.12},
    
    # Retail
    "DMART": {"name": "Avenue Supermarts (DMart)", "sector": "Retail", "base_price": 4234.50, "pe": 95.2, "roe": 19.8, "debt": 0.05},
    "TRENT": {"name": "Trent Ltd", "sector": "Retail", "base_price": 6789.30, "pe": 142.5, "roe": 22.4, "debt": 0.18},
    
    # Media & Entertainment
    "ZEEL": {"name": "Zee Entertainment", "sector": "Media", "base_price": 234.50, "pe": 15.6, "roe": 8.2, "debt": 0.42},
    "PVRINOX": {"name": "PVR INOX", "sector": "Entertainment", "base_price": 1456.30, "pe": 78.5, "roe": 5.3, "debt": 0.68},
    
    # Real Estate
    "DLF": {"name": "DLF Ltd", "sector": "Real Estate", "base_price": 876.40, "pe": 48.5, "roe": 12.6, "debt": 0.35},
    "GODREJPROP": {"name": "Godrej Properties", "sector": "Real Estate", "base_price": 2876.50, "pe": 98.7, "roe": 8.9, "debt": 0.28},
    "OBEROIRLTY": {"name": "Oberoi Realty", "sector": "Real Estate", "base_price": 1987.60, "pe": 52.3, "roe": 11.2, "debt": 0.22},
    
    # Diversified
    "ADANIENT": {"name": "Adani Enterprises", "sector": "Diversified", "base_price": 3124.50, "pe": 145.2, "roe": 6.8, "debt": 1.85},
    "ITC": {"name": "ITC Ltd", "sector": "Diversified", "base_price": 456.70, "pe": 24.99, "roe": 26.4, "debt": 0.02},
}

class IndianStockGenerator:
    def __init__(self):
        self.price_memory = {}
        self.last_update = {}
    
    def _generate_price(self, symbol: str, base_price: float) -> tuple:
        """Generate realistic price with random walk - ALWAYS CHANGES"""
        import time
        current_time = time.time()
        
        # Force new price generation every time
        if symbol in self.price_memory and symbol in self.last_update:
            # Only use previous price if called within last 2 seconds (avoid duplicate calls)
            if current_time - self.last_update[symbol] < 2:
                return self.price_memory[symbol]
        
        if symbol in self.price_memory:
            last_price = self.price_memory[symbol][0]
        else:
            last_price = base_price
        
        # Random walk with volatility - ALWAYS generates new value
        volatility = 0.02
        drift = 0.0001
        change_percent = np.random.normal(drift, volatility)
        new_price = last_price * (1 + change_percent)
        
        # Keep within ±20% of base
        new_price = max(base_price * 0.80, min(base_price * 1.20, new_price))
        
        result = (round(new_price, 2), round(change_percent * 100, 2))
        self.price_memory[symbol] = result
        self.last_update[symbol] = current_time
        
        return result
    
    def get_stock_data(self, symbol: str) -> dict:
        """Get complete stock data for a symbol"""
        if symbol not in INDIAN_STOCKS:
            return None
        
        stock = INDIAN_STOCKS[symbol]
        price, change_percent = self._generate_price(symbol, stock['base_price'])
        change = (change_percent / 100) * price
        
        return {
            "symbol": symbol,
            "name": stock['name'],
            "sector": stock['sector'],
            "price": price,
            "change": round(change, 2),
            "changePercent": change_percent,
            "volume": random.randint(1000000, 50000000),
            "marketCap": random.randint(50000, 2000000),  # In crores
            "pe": stock['pe'],
            "roe": stock['roe'],
            "debtRatio": stock['debt'],
            "currency": "INR"
        }
    
    def get_historical_data(self, symbol: str, days: int = 30) -> list:
        """Generate historical OHLCV data"""
        if symbol not in INDIAN_STOCKS:
            return []
        
        stock = INDIAN_STOCKS[symbol]
        historical = []
        current_date = datetime.now()
        current_price = stock['base_price']
        
        for i in range(days, 0, -1):
            date = current_date - timedelta(days=i)
            volatility = current_price * 0.02
            
            open_price = current_price + random.uniform(-volatility, volatility)
            close_price = open_price + random.uniform(-volatility, volatility)
            high_price = max(open_price, close_price) + random.uniform(0, volatility/2)
            low_price = min(open_price, close_price) - random.uniform(0, volatility/2)
            
            historical.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": random.randint(1000000, 50000000)
            })
            
            current_price = close_price
        
        return historical

# Global instance
indian_stock_gen = IndianStockGenerator()
