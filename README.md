# Production-Grade Stock Screener

A comprehensive full-stack stock screener application with AI-powered analysis, built with modern technologies for scalability and performance.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **Dynamic Stock Screening**: Real-time filtering with fundamental metrics
- **Personal Watchlists**: Save and track favorite stocks
- **Detailed Stock Analysis**: Comprehensive financial data and metrics
- **AI-Powered Analysis**: Advanced analysis using financial reports (Gemini 2.5 Pro integration ready)

### Technical Features
- **Real-time Data**: Alpha Vantage API integration with rate limiting
- **Responsive UI**: Material-UI components with professional design
- **Secure Backend**: FastAPI with JWT authentication
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for performance optimization
- **Containerized**: Docker and Docker Compose for easy deployment

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **Caching**: Redis
- **API Integration**: Alpha Vantage for financial data
- **Data Processing**: Pandas and NumPy

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Chart.js with react-chartjs-2

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Web Server**: Nginx (production)
- **Process Manager**: Uvicorn

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Alpha Vantage API key (free at https://www.alphavantage.co/support/#api-key)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock_screener
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start database services**
   ```bash
   cd ..
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Set environment variables**
   ```bash
   export DATABASE_URL=postgresql://user:password@localhost/stock_screener
   export REDIS_URL=redis://localhost:6379/0
   export SECRET_KEY=your-secret-key
   export ALPHA_VANTAGE_API_KEY=your-api-key
   ```

6. **Run the backend**
   ```bash
   cd backend
   python run.py
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "password"
}
```

### Stock Endpoints

#### Search Stock
```http
GET /api/v1/stocks/search/{symbol}
Authorization: Bearer <token>
```

#### Screen Stocks
```http
POST /api/v1/stocks/screen
Authorization: Bearer <token>
Content-Type: application/json

{
  "min_market_cap": 1000000000,
  "max_pe_ratio": 25,
  "min_dividend_yield": 0.02,
  "sectors": ["Technology", "Healthcare"]
}
```

#### Watchlist Management
```http
# Add to watchlist
POST /api/v1/stocks/watchlist/add/{symbol}
Authorization: Bearer <token>

# Remove from watchlist
DELETE /api/v1/stocks/watchlist/remove/{symbol}
Authorization: Bearer <token>

# Get watchlist
GET /api/v1/stocks/watchlist
Authorization: Bearer <token>
```

#### AI Analysis
```http
GET /api/v1/stocks/{symbol}/analysis
Authorization: Bearer <token>
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/stock_screener

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
GEMINI_API_KEY=your-gemini-api-key

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

### Docker Environment

For production deployment, update `docker-compose.yml` with:
- Strong passwords and secrets
- Proper volume mounts
- Network security configurations
- Resource limits

## 🤖 AI Analysis Integration

The application includes a placeholder for Gemini 2.5 Pro integration. To enable:

1. **Get Gemini API access**
   - Visit Google AI Studio
   - Generate API key

2. **Update configuration**
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Implement analysis logic**
   - Update `backend/app/services/ai_analysis.py`
   - Replace mock analysis with Gemini API calls
   - Format financial data for AI consumption

### AI Analysis Features
- **Executive Summary**: Concise financial overview
- **Sentiment Analysis**: Management tone and outlook
- **Risk Assessment**: Identified business risks
- **Red Flag Detection**: Potential warning signs

## 📊 Screening Capabilities

### Available Filters
- Market Cap (min/max)
- P/E Ratio (min/max)
- P/B Ratio (min/max)
- Dividend Yield (min/max)
- Debt-to-Equity Ratio (max)
- Return on Equity (min/max)
- Sector selection

### Supported Metrics
- Financial ratios and multiples
- Growth indicators
- Profitability measures
- Valuation metrics
- Risk indicators

## 🔒 Security

### Authentication
- JWT tokens with configurable expiration
- Bcrypt password hashing
- Secure cookie handling

### API Security
- Rate limiting on external API calls
- Input validation and sanitization
- CORS configuration
- SQL injection prevention via ORM

### Data Protection
- Environment variable configuration
- Secure database connections
- No sensitive data in logs

## 🚀 Deployment

### Production Deployment

1. **Prepare environment**
   ```bash
   # Update environment variables
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose up -d --build
   ```

3. **Database migration** (if needed)
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

### Cloud Deployment Options

#### Google Cloud Run
- Build and push images to Google Container Registry
- Deploy backend and frontend as separate services
- Use Cloud SQL for PostgreSQL
- Use Redis Cloud or Google Memory Store

#### AWS
- Use ECS or EKS for container orchestration
- RDS for PostgreSQL
- ElastiCache for Redis
- ALB for load balancing

## 📝 Development

### Project Structure
```
stock_screener/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Configuration and security
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── contexts/     # React contexts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Adding New Features

1. **Backend**: Add endpoints in `api/`, business logic in `services/`
2. **Frontend**: Create components in `components/`, pages in `pages/`
3. **Database**: Add models in `models/`, run migrations
4. **API**: Update schemas in `schemas/`

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance

### Optimization Features
- Database query optimization
- Redis caching for API responses
- Efficient data pagination
- Connection pooling
- Lazy loading in frontend

### Monitoring
- Health check endpoints
- Request/response logging
- Error tracking
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the troubleshooting section
- Open an issue on GitHub

## 🔄 Updates

Stay updated with:
- Regular dependency updates
- Security patches
- Feature enhancements
- Performance improvements