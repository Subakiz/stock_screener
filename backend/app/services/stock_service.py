from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from ..models.models import Stock, User, FinancialData
from ..schemas.schemas import StockCreate, ScreeningFilters
from .alpha_vantage import AlphaVantageService
import logging

logger = logging.getLogger(__name__)


class StockService:
    def __init__(self, alpha_vantage_service: AlphaVantageService):
        self.alpha_vantage = alpha_vantage_service
    
    def get_stock_by_symbol(self, db: Session, symbol: str) -> Optional[Stock]:
        return db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    
    def create_or_update_stock(self, db: Session, symbol: str) -> Optional[Stock]:
        """Create or update stock data from Alpha Vantage."""
        symbol = symbol.upper()
        
        # Get data from Alpha Vantage
        overview_data = self.alpha_vantage.get_company_overview(symbol)
        if not overview_data:
            logger.error(f"Failed to fetch data for {symbol}")
            return None
        
        # Check if stock exists
        stock = self.get_stock_by_symbol(db, symbol)
        
        if stock:
            # Update existing stock
            self._update_stock_from_overview(stock, overview_data)
        else:
            # Create new stock
            stock = self._create_stock_from_overview(overview_data)
            db.add(stock)
        
        db.commit()
        db.refresh(stock)
        return stock
    
    def _create_stock_from_overview(self, data: dict) -> Stock:
        """Create Stock object from Alpha Vantage overview data."""
        return Stock(
            symbol=data.get('Symbol', '').upper(),
            name=data.get('Name', ''),
            sector=data.get('Sector'),
            industry=data.get('Industry'),
            market_cap=self._safe_float(data.get('MarketCapitalization')),
            pe_ratio=self._safe_float(data.get('PERatio')),
            pb_ratio=self._safe_float(data.get('PriceToBookRatio')),
            dividend_yield=self._safe_float(data.get('DividendYield')),
            debt_to_equity=self._safe_float(data.get('DebtToEquityRatio')),
            roe=self._safe_float(data.get('ReturnOnEquityTTM')),
            current_price=self._safe_float(data.get('Price'))
        )
    
    def _update_stock_from_overview(self, stock: Stock, data: dict):
        """Update existing Stock object from Alpha Vantage overview data."""
        stock.name = data.get('Name', stock.name)
        stock.sector = data.get('Sector') or stock.sector
        stock.industry = data.get('Industry') or stock.industry
        stock.market_cap = self._safe_float(data.get('MarketCapitalization')) or stock.market_cap
        stock.pe_ratio = self._safe_float(data.get('PERatio')) or stock.pe_ratio
        stock.pb_ratio = self._safe_float(data.get('PriceToBookRatio')) or stock.pb_ratio
        stock.dividend_yield = self._safe_float(data.get('DividendYield')) or stock.dividend_yield
        stock.debt_to_equity = self._safe_float(data.get('DebtToEquityRatio')) or stock.debt_to_equity
        stock.roe = self._safe_float(data.get('ReturnOnEquityTTM')) or stock.roe
        stock.current_price = self._safe_float(data.get('Price')) or stock.current_price
    
    def _safe_float(self, value) -> Optional[float]:
        """Safely convert string to float."""
        if value is None or value == 'None' or value == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def screen_stocks(self, db: Session, filters: ScreeningFilters) -> List[Stock]:
        """Screen stocks based on filters."""
        query = db.query(Stock)
        
        # Apply filters
        conditions = []
        
        if filters.min_market_cap is not None:
            conditions.append(Stock.market_cap >= filters.min_market_cap)
        if filters.max_market_cap is not None:
            conditions.append(Stock.market_cap <= filters.max_market_cap)
        
        if filters.min_pe_ratio is not None:
            conditions.append(Stock.pe_ratio >= filters.min_pe_ratio)
        if filters.max_pe_ratio is not None:
            conditions.append(Stock.pe_ratio <= filters.max_pe_ratio)
        
        if filters.min_pb_ratio is not None:
            conditions.append(Stock.pb_ratio >= filters.min_pb_ratio)
        if filters.max_pb_ratio is not None:
            conditions.append(Stock.pb_ratio <= filters.max_pb_ratio)
        
        if filters.min_dividend_yield is not None:
            conditions.append(Stock.dividend_yield >= filters.min_dividend_yield)
        if filters.max_dividend_yield is not None:
            conditions.append(Stock.dividend_yield <= filters.max_dividend_yield)
        
        if filters.min_debt_to_equity is not None:
            conditions.append(Stock.debt_to_equity >= filters.min_debt_to_equity)
        if filters.max_debt_to_equity is not None:
            conditions.append(Stock.debt_to_equity <= filters.max_debt_to_equity)
        
        if filters.min_roe is not None:
            conditions.append(Stock.roe >= filters.min_roe)
        if filters.max_roe is not None:
            conditions.append(Stock.roe <= filters.max_roe)
        
        if filters.sectors:
            conditions.append(Stock.sector.in_(filters.sectors))
        
        if conditions:
            query = query.filter(and_(*conditions))
        
        return query.all()
    
    def add_to_watchlist(self, db: Session, user: User, symbol: str) -> bool:
        """Add stock to user's watchlist."""
        stock = self.get_stock_by_symbol(db, symbol)
        if not stock:
            # Try to create/update stock from API
            stock = self.create_or_update_stock(db, symbol)
            if not stock:
                return False
        
        if stock not in user.watchlist:
            user.watchlist.append(stock)
            db.commit()
        
        return True
    
    def remove_from_watchlist(self, db: Session, user: User, symbol: str) -> bool:
        """Remove stock from user's watchlist."""
        stock = self.get_stock_by_symbol(db, symbol)
        if stock and stock in user.watchlist:
            user.watchlist.remove(stock)
            db.commit()
            return True
        return False
    
    def get_user_watchlist(self, db: Session, user: User) -> List[Stock]:
        """Get user's watchlist."""
        return user.watchlist