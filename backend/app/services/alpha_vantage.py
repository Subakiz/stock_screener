import requests
import time
from typing import Dict, Any, Optional, List
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)


class AlphaVantageService:
    def __init__(self):
        self.api_key = settings.alpha_vantage_api_key
        self.base_url = settings.alpha_vantage_base_url
        self.rate_limit_calls = 0
        self.rate_limit_reset_time = time.time()
        
    def _make_request(self, params: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Make API request with rate limiting."""
        current_time = time.time()
        
        # Reset rate limit counter every minute
        if current_time - self.rate_limit_reset_time > 60:
            self.rate_limit_calls = 0
            self.rate_limit_reset_time = current_time
            
        # Alpha Vantage free tier: 5 calls per minute
        if self.rate_limit_calls >= 5:
            sleep_time = 60 - (current_time - self.rate_limit_reset_time)
            if sleep_time > 0:
                logger.info(f"Rate limit reached, sleeping for {sleep_time:.2f} seconds")
                time.sleep(sleep_time)
                self.rate_limit_calls = 0
                self.rate_limit_reset_time = time.time()
        
        params['apikey'] = self.api_key
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            self.rate_limit_calls += 1
            
            data = response.json()
            
            # Check for API errors
            if "Error Message" in data:
                logger.error(f"API Error: {data['Error Message']}")
                return None
            if "Note" in data:
                logger.warning(f"API Note: {data['Note']}")
                return None
                
            return data
            
        except requests.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None
    
    def get_company_overview(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get company overview data."""
        params = {
            'function': 'OVERVIEW',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_income_statement(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get income statement data."""
        params = {
            'function': 'INCOME_STATEMENT',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_balance_sheet(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get balance sheet data."""
        params = {
            'function': 'BALANCE_SHEET',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_cash_flow(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get cash flow data."""
        params = {
            'function': 'CASH_FLOW',
            'symbol': symbol
        }
        return self._make_request(params)
    
    def get_time_series_daily(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get daily time series data."""
        params = {
            'function': 'TIME_SERIES_DAILY',
            'symbol': symbol,
            'outputsize': 'compact'  # Last 100 data points
        }
        return self._make_request(params)
    
    def get_sp500_symbols(self) -> List[str]:
        """
        Get S&P 500 symbols. In a real implementation, this would
        fetch from a reliable source. For now, returning a subset.
        """
        # This is a small subset for demonstration
        # In production, you'd fetch this from a reliable source
        return [
            'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'META', 'NVDA', 'JPM',
            'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'BAC', 'NFLX',
            'ADBE', 'CRM', 'CMCSA', 'XOM', 'VZ', 'KO', 'ABT', 'ORCL', 'PFE',
            'WMT', 'CVX', 'CSCO', 'PEP', 'TMO', 'ACN', 'ABBV', 'COST', 'AVGO',
            'DHR', 'LLY', 'NEE', 'TXN', 'MDT', 'UNP', 'PM', 'HON', 'LOW',
            'QCOM', 'IBM', 'CHTR', 'LIN', 'UPS', 'RTX', 'BMY', 'AMGN'
        ]