import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { stockAPI } from '../services/api';
import { Stock, ScreeningFilters } from '../types';
import { useNavigate } from 'react-router-dom';

const ScreeningPage: React.FC = () => {
  const [filters, setFilters] = useState<ScreeningFilters>({});
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFilterChange = (field: keyof ScreeningFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handleScreen = async () => {
    setLoading(true);
    try {
      const stocks = await stockAPI.screenStocks(filters);
      setResults(stocks);
    } catch (error) {
      console.error('Screening failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (symbol: string) => {
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stock Screener
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Screening Filters
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Market Cap (M)"
                type="number"
                value={filters.min_market_cap || ''}
                onChange={(e) => handleFilterChange('min_market_cap', parseFloat(e.target.value) * 1e6)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Market Cap (M)"
                type="number"
                value={filters.max_market_cap ? filters.max_market_cap / 1e6 : ''}
                onChange={(e) => handleFilterChange('max_market_cap', parseFloat(e.target.value) * 1e6)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min P/E Ratio"
                type="number"
                value={filters.min_pe_ratio || ''}
                onChange={(e) => handleFilterChange('min_pe_ratio', parseFloat(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max P/E Ratio"
                type="number"
                value={filters.max_pe_ratio || ''}
                onChange={(e) => handleFilterChange('max_pe_ratio', parseFloat(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min P/B Ratio"
                type="number"
                value={filters.min_pb_ratio || ''}
                onChange={(e) => handleFilterChange('min_pb_ratio', parseFloat(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max P/B Ratio"
                type="number"
                value={filters.max_pb_ratio || ''}
                onChange={(e) => handleFilterChange('max_pb_ratio', parseFloat(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Dividend Yield (%)"
                type="number"
                value={filters.min_dividend_yield || ''}
                onChange={(e) => handleFilterChange('min_dividend_yield', parseFloat(e.target.value) / 100)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Debt/Equity"
                type="number"
                value={filters.max_debt_to_equity || ''}
                onChange={(e) => handleFilterChange('max_debt_to_equity', parseFloat(e.target.value))}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleScreen}
              disabled={loading}
              size="large"
            >
              {loading ? 'Screening...' : 'Screen Stocks'}
            </Button>
          </Box>
        </Paper>
        
        {results.length > 0 && (
          <Paper>
            <Typography variant="h6" sx={{ p: 2 }}>
              Results ({results.length} stocks)
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Market Cap</TableCell>
                    <TableCell>P/E</TableCell>
                    <TableCell>P/B</TableCell>
                    <TableCell>Div Yield</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>
                        <strong>{stock.symbol}</strong>
                      </TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>
                        {stock.sector && (
                          <Chip label={stock.sector} size="small" />
                        )}
                      </TableCell>
                      <TableCell>{formatNumber(stock.market_cap)}</TableCell>
                      <TableCell>{stock.pe_ratio?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>{stock.pb_ratio?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>
                        {stock.dividend_yield ? `${(stock.dividend_yield * 100).toFixed(2)}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleAddToWatchlist(stock.symbol)}
                          size="small"
                          title="Add to Watchlist"
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/stock/${stock.symbol}`)}
                          size="small"
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ScreeningPage;