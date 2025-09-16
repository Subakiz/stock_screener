from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Stock schemas
class StockBase(BaseModel):
    symbol: str
    name: str
    sector: Optional[str] = None
    industry: Optional[str] = None


class StockCreate(StockBase):
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    debt_to_equity: Optional[float] = None
    roe: Optional[float] = None
    current_price: Optional[float] = None


class Stock(StockBase):
    id: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    debt_to_equity: Optional[float] = None
    roe: Optional[float] = None
    current_price: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Screening filters
class ScreeningFilters(BaseModel):
    min_market_cap: Optional[float] = None
    max_market_cap: Optional[float] = None
    min_pe_ratio: Optional[float] = None
    max_pe_ratio: Optional[float] = None
    min_pb_ratio: Optional[float] = None
    max_pb_ratio: Optional[float] = None
    min_dividend_yield: Optional[float] = None
    max_dividend_yield: Optional[float] = None
    min_debt_to_equity: Optional[float] = None
    max_debt_to_equity: Optional[float] = None
    min_roe: Optional[float] = None
    max_roe: Optional[float] = None
    sectors: Optional[List[str]] = None


# Financial Data schemas
class FinancialDataBase(BaseModel):
    fiscal_year: int
    fiscal_quarter: Optional[int] = None
    revenue: Optional[float] = None
    net_income: Optional[float] = None
    total_assets: Optional[float] = None
    total_debt: Optional[float] = None
    cash_flow_from_operations: Optional[float] = None


class FinancialData(FinancialDataBase):
    id: int
    stock_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# AI Analysis schemas
class AIAnalysisBase(BaseModel):
    executive_summary: Optional[str] = None
    sentiment_score: Optional[float] = None
    sentiment_highlights: Optional[str] = None
    risk_assessment: Optional[str] = None
    red_flags: Optional[str] = None


class AIAnalysis(AIAnalysisBase):
    id: int
    stock_id: int
    analysis_date: datetime

    class Config:
        from_attributes = True


# Watchlist schemas
class WatchlistResponse(BaseModel):
    stocks: List[Stock]