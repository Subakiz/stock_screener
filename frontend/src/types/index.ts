export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  dividend_yield?: number;
  debt_to_equity?: number;
  roe?: number;
  current_price?: number;
  created_at: string;
  updated_at?: string;
}

export interface ScreeningFilters {
  min_market_cap?: number;
  max_market_cap?: number;
  min_pe_ratio?: number;
  max_pe_ratio?: number;
  min_pb_ratio?: number;
  max_pb_ratio?: number;
  min_dividend_yield?: number;
  max_dividend_yield?: number;
  min_debt_to_equity?: number;
  max_debt_to_equity?: number;
  min_roe?: number;
  max_roe?: number;
  sectors?: string[];
}

export interface AIAnalysis {
  id: number;
  stock_id: number;
  executive_summary?: string;
  sentiment_score?: number;
  sentiment_highlights?: string;
  risk_assessment?: string;
  red_flags?: string;
  analysis_date: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}