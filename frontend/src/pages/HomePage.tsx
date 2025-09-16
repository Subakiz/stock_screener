import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Professional Stock Screener
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
          Find undervalued stocks with AI-powered analysis
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                🔍 Smart Screening
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filter stocks by fundamental metrics like P/E ratio, market cap, 
                dividend yield, and more. Build custom screens to find opportunities.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                🤖 AI Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get detailed AI-powered analysis including sentiment analysis, 
                risk assessment, and red flag identification for any stock.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                📊 Watchlists
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your favorite stocks and monitor their performance. 
                Save custom watchlists for easy access to your investment ideas.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        {isAuthenticated ? (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/screen')}
            sx={{ mr: 2 }}
          >
            Start Screening
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;