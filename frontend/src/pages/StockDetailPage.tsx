import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, TrendingUp, Warning } from '@mui/icons-material';
import { stockAPI } from '../services/api';
import { Stock, AIAnalysis } from '../types';

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (symbol) {
      loadStockData();
    }
  }, [symbol]);

  const loadStockData = async () => {
    if (!symbol) return;
    
    try {
      const stockData = await stockAPI.searchStock(symbol);
      setStock(stockData);
      
      // Try to load analysis
      try {
        const analysisData = await stockAPI.getAnalysis(symbol);
        setAnalysis(analysisData);
      } catch (analysisError: any) {
        if (analysisError.response?.status === 202) {
          setAnalysisLoading(true);
          // Poll for analysis completion
          setTimeout(() => loadAnalysis(), 5000);
        }
      }
    } catch (error: any) {
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async () => {
    if (!symbol) return;
    
    try {
      const analysisData = await stockAPI.getAnalysis(symbol);
      setAnalysis(analysisData);
      setAnalysisLoading(false);
    } catch (error: any) {
      if (error.response?.status === 202) {
        // Still processing, try again
        setTimeout(() => loadAnalysis(), 5000);
      } else {
        setAnalysisLoading(false);
      }
    }
  };

  const handleAddToWatchlist = async () => {
    if (!symbol) return;
    
    try {
      await stockAPI.addToWatchlist(symbol);
      // Show success message
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getSentimentColor = (score: number | undefined) => {
    if (!score) return 'default';
    if (score > 0.2) return 'success';
    if (score < -0.2) return 'error';
    return 'warning';
  };

  const getSentimentText = (score: number | undefined) => {
    if (!score) return 'Neutral';
    if (score > 0.2) return 'Positive';
    if (score < -0.2) return 'Negative';
    return 'Neutral';
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !stock) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Stock not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {stock.symbol}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {stock.name}
            </Typography>
            {stock.sector && (
              <Chip label={stock.sector} sx={{ mt: 1 }} />
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddToWatchlist}
          >
            Add to Watchlist
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Financial Metrics */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Financial Metrics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Market Cap
                    </Typography>
                    <Typography variant="h6">
                      {formatNumber(stock.market_cap)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      P/E Ratio
                    </Typography>
                    <Typography variant="h6">
                      {stock.pe_ratio?.toFixed(2) || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      P/B Ratio
                    </Typography>
                    <Typography variant="h6">
                      {stock.pb_ratio?.toFixed(2) || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Price
                    </Typography>
                    <Typography variant="h6">
                      {stock.current_price?.toFixed(2) || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Dividend Yield
                    </Typography>
                    <Typography variant="h6">
                      {stock.dividend_yield ? `${(stock.dividend_yield * 100).toFixed(2)}%` : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Debt/Equity
                    </Typography>
                    <Typography variant="h6">
                      {stock.debt_to_equity?.toFixed(2) || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ROE
                    </Typography>
                    <Typography variant="h6">
                      {stock.roe ? `${(stock.roe * 100).toFixed(2)}%` : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Company Info
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Industry
                </Typography>
                <Typography variant="body1">
                  {stock.industry || 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* AI Analysis */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                AI Analysis
              </Typography>
              
              {analysisLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Generating AI analysis...</Typography>
                </Box>
              ) : analysis ? (
                <Grid container spacing={3}>
                  {/* Executive Summary */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Executive Summary
                        </Typography>
                        <Typography variant="body1">
                          {analysis.executive_summary}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Sentiment */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Sentiment Analysis
                        </Typography>
                        <Chip
                          label={getSentimentText(analysis.sentiment_score)}
                          color={getSentimentColor(analysis.sentiment_score)}
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2">
                          Score: {analysis.sentiment_score?.toFixed(2) || 'N/A'}
                        </Typography>
                        {analysis.sentiment_highlights && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Key Highlights:
                            </Typography>
                            {JSON.parse(analysis.sentiment_highlights).map((highlight: string, index: number) => (
                              <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                                • {highlight}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Red Flags */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="error">
                          <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Red Flags
                        </Typography>
                        {analysis.red_flags ? (
                          JSON.parse(analysis.red_flags).map((flag: any, index: number) => (
                            <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                              <Typography variant="body2">
                                <strong>{flag.type}:</strong> {flag.description}
                              </Typography>
                            </Alert>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No red flags identified
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  AI analysis not available. This feature requires additional setup.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default StockDetailPage;