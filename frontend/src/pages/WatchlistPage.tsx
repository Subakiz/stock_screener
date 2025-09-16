import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { stockAPI } from '../services/api';
import { Stock } from '../types';
import { useNavigate } from 'react-router-dom';

const WatchlistPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      const response = await stockAPI.getWatchlist();
      setStocks(response.stocks);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      await stockAPI.removeFromWatchlist(symbol);
      setStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading watchlist...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Watchlist
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadWatchlist}
          >
            Refresh
          </Button>
        </Box>

        {stocks.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Your watchlist is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Use the stock screener to find interesting stocks and add them to your watchlist.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/screen')}
            >
              Screen Stocks
            </Button>
          </Paper>
        ) : (
          <Paper>
            <Typography variant="h6" sx={{ p: 2 }}>
              {stocks.length} stocks in your watchlist
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Market Cap</TableCell>
                    <TableCell>P/E Ratio</TableCell>
                    <TableCell>P/B Ratio</TableCell>
                    <TableCell>Dividend Yield</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stocks.map((stock) => (
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
                      <TableCell>{stock.current_price?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => navigate(`/stock/${stock.symbol}`)}
                          size="small"
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleRemove(stock.symbol)}
                          size="small"
                          title="Remove from Watchlist"
                          color="error"
                        >
                          <DeleteIcon />
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

export default WatchlistPage;