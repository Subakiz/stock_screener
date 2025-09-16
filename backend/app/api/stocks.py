from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..api.dependencies import get_current_active_user
from ..schemas.schemas import Stock, ScreeningFilters, User, WatchlistResponse, AIAnalysis
from ..services.stock_service import StockService
from ..services.alpha_vantage import AlphaVantageService
from ..services.ai_analysis import AIAnalysisService
from ..models.models import User as UserModel

router = APIRouter(prefix="/stocks", tags=["stocks"])

# Initialize services
alpha_vantage_service = AlphaVantageService()
stock_service = StockService(alpha_vantage_service)
ai_service = AIAnalysisService(alpha_vantage_service)


@router.get("/search/{symbol}", response_model=Stock)
def get_stock(symbol: str, db: Session = Depends(get_db)):
    """Get stock information by symbol."""
    stock = stock_service.get_stock_by_symbol(db, symbol)
    
    if not stock:
        # Try to fetch from API
        stock = stock_service.create_or_update_stock(db, symbol)
        if not stock:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stock not found"
            )
    
    return stock


@router.post("/screen", response_model=List[Stock])
def screen_stocks(
    filters: ScreeningFilters, 
    db: Session = Depends(get_db)
):
    """Screen stocks based on filters."""
    stocks = stock_service.screen_stocks(db, filters)
    return stocks


@router.post("/populate")
def populate_stocks(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Populate database with S&P 500 stocks (background task)."""
    def populate_task():
        symbols = alpha_vantage_service.get_sp500_symbols()
        for symbol in symbols[:10]:  # Limit to first 10 for demo
            try:
                stock_service.create_or_update_stock(db, symbol)
            except Exception as e:
                print(f"Error populating {symbol}: {e}")
    
    background_tasks.add_task(populate_task)
    return {"message": "Stock population started in background"}


@router.post("/watchlist/add/{symbol}")
def add_to_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Add stock to user's watchlist."""
    success = stock_service.add_to_watchlist(db, current_user, symbol)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    return {"message": f"Added {symbol} to watchlist"}


@router.delete("/watchlist/remove/{symbol}")
def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Remove stock from user's watchlist."""
    success = stock_service.remove_from_watchlist(db, current_user, symbol)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found in watchlist"
        )
    
    return {"message": f"Removed {symbol} from watchlist"}


@router.get("/watchlist", response_model=WatchlistResponse)
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get user's watchlist."""
    stocks = stock_service.get_user_watchlist(db, current_user)
    return {"stocks": stocks}


@router.get("/{symbol}/analysis", response_model=AIAnalysis)
def get_stock_analysis(
    symbol: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Get AI analysis for a stock."""
    stock = stock_service.get_stock_by_symbol(db, symbol)
    
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    # Check for existing analysis
    analysis = ai_service.get_latest_analysis(db, stock.id)
    
    if not analysis:
        # Generate new analysis in background
        def generate_analysis():
            ai_service.generate_analysis(db, stock)
        
        background_tasks.add_task(generate_analysis)
        
        raise HTTPException(
            status_code=status.HTTP_202_ACCEPTED,
            detail="Analysis generation started. Please check back in a few moments."
        )
    
    return analysis