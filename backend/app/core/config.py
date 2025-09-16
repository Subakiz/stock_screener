from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Settings
    app_name: str = "Stock Screener API"
    debug: bool = False
    api_version: str = "v1"
    
    # Database
    database_url: str = "postgresql://user:password@localhost/stock_screener"
    
    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Alpha Vantage API
    alpha_vantage_api_key: str = "GGHF06JLSAHDOL5L"
    alpha_vantage_base_url: str = "https://www.alphavantage.co/query"
    
    # Redis (for caching)
    redis_url: str = "redis://localhost:6379/0"
    
    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:8000"]
    
    # Gemini API (placeholder)
    gemini_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"


settings = Settings()