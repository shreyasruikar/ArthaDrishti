import os
import requests
import time
from typing import Dict, List, Optional
from datetime import datetime

class AlphaVantageService:
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self):
        self.api_key = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
        self.request_count = 0
        self.last_request_time = 0
        
    def _rate_limit(self):
        """Ensure we don't exceed 5 requests per minute"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < 12:  # 60 seconds / 5 requests = 12 seconds between requests
            sleep_time = 12 - time_since_last
            print(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
        self.request_count += 1
    
    def get_quote(self, symbol: str) -> Optional[Dict]:
        """Get real-time quote for a symbol using GLOBAL_QUOTE"""
        self._rate_limit()
        
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': self.api_key
        }
        
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            data = response.json()
            
            if 'Global Quote' in data and data['Global Quote']:
                quote = data['Global Quote']
                return {
                    'symbol': quote.get('01. symbol', symbol),
                    'price': float(quote.get('05. price', 0)),
                    'change': float(quote.get('09. change', 0)),
                    'changePercent': float(quote.get('10. change percent', '0').replace('%', '')),
                    'volume': int(quote.get('06. volume', 0)),
                    'previousClose': float(quote.get('08. previous close', 0))
                }
            
            return None
            
        except Exception as e:
            print(f"Error fetching quote for {symbol}: {str(e)}")
            return None
    
    def get_company_overview(self, symbol: str) -> Optional[Dict]:
        """Get company overview including fundamentals"""
        self._rate_limit()
        
        params = {
            'function': 'OVERVIEW',
            'symbol': symbol,
            'apikey': self.api_key
        }
        
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            data = response.json()
            
            if data and 'Symbol' in data:
                return {
                    'symbol': data.get('Symbol'),
                    'name': data.get('Name'),
                    'sector': data.get('Sector'),
                    'marketCap': int(data.get('MarketCapitalization', 0)),
                    'pe': float(data.get('PERatio', 0)) if data.get('PERatio') != 'None' else 0,
                    'roe': float(data.get('ReturnOnEquityTTM', 0)) if data.get('ReturnOnEquityTTM') != 'None' else 0,
                    'debtToEquity': float(data.get('DebtEquityRatio', 0)) if data.get('DebtEquityRatio') != 'None' else 0,
                    'dividendYield': float(data.get('DividendYield', 0)) if data.get('DividendYield') != 'None' else 0,
                    'eps': float(data.get('EPS', 0)) if data.get('EPS') != 'None' else 0,
                    'week52High': float(data.get('52WeekHigh', 0)) if data.get('52WeekHigh') != 'None' else 0,
                    'week52Low': float(data.get('52WeekLow', 0)) if data.get('52WeekLow') != 'None' else 0,
                }
            
            return None
            
        except Exception as e:
            print(f"Error fetching overview for {symbol}: {str(e)}")
            return None
    
    def get_time_series_daily(self, symbol: str, outputsize: str = 'compact') -> Optional[List[Dict]]:
        """Get daily time series data (last 100 days for compact)"""
        self._rate_limit()
        
        params = {
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'outputsize': outputsize,  # 'compact' or 'full'
            'apikey': self.api_key
        }
        
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            data = response.json()
            
            if 'Time Series (Daily)' in data:
                time_series = data['Time Series (Daily)']
                result = []
                
                for date, values in sorted(time_series.items()):
                    result.append({
                        'date': date,
                        'open': float(values['1. open']),
                        'high': float(values['2. high']),
                        'low': float(values['3. low']),
                        'close': float(values['4. close']),
                        'volume': int(values['5. volume'])
                    })
                
                return result
            
            return None
            
        except Exception as e:
            print(f"Error fetching time series for {symbol}: {str(e)}")
            return None
    
    def get_bulk_quotes(self, symbols: List[str]) -> Dict[str, Dict]:
        """Get quotes for multiple symbols (respecting rate limits)"""
        results = {}
        
        for symbol in symbols:
            quote = self.get_quote(symbol)
            if quote:
                results[symbol] = quote
        
        return results

# Global instance
alpha_vantage = AlphaVantageService()
