import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.models import Stock, AIAnalysis
from .alpha_vantage import AlphaVantageService
import logging

logger = logging.getLogger(__name__)


class AIAnalysisService:
    def __init__(self, alpha_vantage_service: AlphaVantageService):
        self.alpha_vantage = alpha_vantage_service
    
    def generate_analysis(self, db: Session, stock: Stock) -> Optional[AIAnalysis]:
        """
        Generate AI analysis for a stock using Gemini 2.5 Pro.
        This is where the advanced AI analysis would be integrated.
        """
        try:
            # Fetch financial data from Alpha Vantage
            financial_data = self._fetch_financial_data(stock.symbol)
            if not financial_data:
                logger.error(f"Could not fetch financial data for {stock.symbol}")
                return None
            
            # Here is where Gemini 2.5 Pro would be called
            analysis_result = self._analyze_with_gemini(stock, financial_data)
            
            # Save analysis to database
            analysis = AIAnalysis(
                stock_id=stock.id,
                executive_summary=analysis_result.get('executive_summary'),
                sentiment_score=analysis_result.get('sentiment_score'),
                sentiment_highlights=json.dumps(analysis_result.get('sentiment_highlights', [])),
                risk_assessment=json.dumps(analysis_result.get('risk_assessment', [])),
                red_flags=json.dumps(analysis_result.get('red_flags', []))
            )
            
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error generating analysis for {stock.symbol}: {e}")
            return None
    
    def _fetch_financial_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch comprehensive financial data for analysis."""
        financial_data = {}
        
        # Get overview
        overview = self.alpha_vantage.get_company_overview(symbol)
        if overview:
            financial_data['overview'] = overview
        
        # Get income statement
        income_statement = self.alpha_vantage.get_income_statement(symbol)
        if income_statement:
            financial_data['income_statement'] = income_statement
        
        # Get balance sheet
        balance_sheet = self.alpha_vantage.get_balance_sheet(symbol)
        if balance_sheet:
            financial_data['balance_sheet'] = balance_sheet
        
        # Get cash flow
        cash_flow = self.alpha_vantage.get_cash_flow(symbol)
        if cash_flow:
            financial_data['cash_flow'] = cash_flow
        
        return financial_data if financial_data else None
    
    def _analyze_with_gemini(self, stock: Stock, financial_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        PLACEHOLDER: This is where Gemini 2.5 Pro would be integrated.
        
        The function would:
        1. Format the financial data for Gemini
        2. Send the data to Gemini 2.5 Pro with specific prompts
        3. Parse and structure the response
        
        For now, returning mock analysis data.
        """
        
        # Mock analysis - in production, this would be replaced with actual Gemini API calls
        mock_analysis = {
            'executive_summary': f"""
            {stock.name} ({stock.symbol}) shows mixed financial performance in the latest reporting period. 
            The company operates in the {stock.sector} sector and has demonstrated resilience in key metrics. 
            Revenue trends and operational efficiency metrics suggest a stable business model, though 
            market conditions present both opportunities and challenges for future growth.
            """.strip(),
            
            'sentiment_score': 0.2,  # Slightly positive
            
            'sentiment_highlights': [
                "Management expressed confidence in long-term growth prospects",
                "Strong operational efficiency improvements noted",
                "Cautious outlook due to market uncertainties"
            ],
            
            'risk_assessment': [
                {
                    'category': 'Market Risk',
                    'description': 'Exposure to economic downturns and market volatility',
                    'severity': 'Medium'
                },
                {
                    'category': 'Operational Risk',
                    'description': 'Supply chain disruptions and cost inflation pressures',
                    'severity': 'Medium'
                },
                {
                    'category': 'Regulatory Risk',
                    'description': 'Potential changes in industry regulations',
                    'severity': 'Low'
                }
            ],
            
            'red_flags': self._identify_red_flags(financial_data)
        }
        
        return mock_analysis
    
    def _identify_red_flags(self, financial_data: Dict[str, Any]) -> list:
        """Identify potential red flags in financial data."""
        red_flags = []
        
        try:
            overview = financial_data.get('overview', {})
            
            # Check P/E ratio
            pe_ratio = self._safe_float(overview.get('PERatio'))
            if pe_ratio and pe_ratio > 50:
                red_flags.append({
                    'type': 'Valuation Risk',
                    'description': f'Very high P/E ratio of {pe_ratio}, potentially overvalued'
                })
            
            # Check debt levels
            debt_to_equity = self._safe_float(overview.get('DebtToEquityRatio'))
            if debt_to_equity and debt_to_equity > 2.0:
                red_flags.append({
                    'type': 'Financial Risk',
                    'description': f'High debt-to-equity ratio of {debt_to_equity}'
                })
            
            # Check profit margins
            profit_margin = self._safe_float(overview.get('ProfitMargin'))
            if profit_margin and profit_margin < 0:
                red_flags.append({
                    'type': 'Profitability Risk',
                    'description': 'Negative profit margins indicate losses'
                })
            
        except Exception as e:
            logger.error(f"Error identifying red flags: {e}")
        
        return red_flags
    
    def _safe_float(self, value) -> Optional[float]:
        """Safely convert string to float."""
        if value is None or value == 'None' or value == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def get_latest_analysis(self, db: Session, stock_id: int) -> Optional[AIAnalysis]:
        """Get the latest AI analysis for a stock."""
        return (
            db.query(AIAnalysis)
            .filter(AIAnalysis.stock_id == stock_id)
            .order_by(AIAnalysis.analysis_date.desc())
            .first()
        )