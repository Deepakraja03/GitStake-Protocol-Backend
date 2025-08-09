const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const githubRoutes = require('./routes/githubRoutes');
const chatRoutes = require('./routes/chatRoutes');
const emailRoutes = require('./routes/emailRoutes');
const deepSearchRoutes = require('./routes/deepSearchRoutes');
const questRoutes = require('./routes/questRoutes');
const cronRoutes = require('./routes/cronRoutes');

// Global middleware
app.use(helmet());
app.use(cors({
  origin: [
    "https://git-stake-protocol-frontend.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173", // Vite default port
    "http://localhost:5174"  // Alternative Vite port
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/deep-search', deepSearchRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/cron', cronRoutes);

app.get('/', (req, res) => {
  res.json({
    message: '🚀GitStake Backend Running Successfully.'
  });
});


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'GitHub Analytics Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'GitHub Analytics API',
    version: '1.0.0',
    description: 'API for analyzing GitHub user profiles and repositories',
    endpoints: {
      users: {
        'GET /api/users': 'Get all analyzed users',
        'GET /api/users/leaderboard': 'Get user leaderboard',
        'GET /api/users/:username': 'Get specific user data',
        'GET /api/users/:username/analytics': 'Get user analytics summary',
        'POST /api/users/analyze': 'Analyze GitHub user',
        'PUT /api/users/:username/update': 'Update user analytics',
        'DELETE /api/users/:username': 'Delete user data'
      },
      github: {
        'GET /api/github/profile/:username': 'Get GitHub profile',
        'GET /api/github/repos/:username': 'Get user repositories',
        'GET /api/github/analytics/:username/complexity': 'Get code complexity analysis',
        'GET /api/github/analytics/:username/activity': 'Get activity analytics',
        'GET /api/github/search/repositories': 'Search repositories',
        'GET /api/github/rate-limit': 'Get API rate limit status'
      },
      chat: {
        'POST /api/chat/ask': 'Ask GitStake AI Assistant',
        'GET /api/chat/health': 'Get assistant health status'
      },
      email: {
        'POST /api/email/send-registration': 'Send registration email',
        'POST /api/email/send-level-up': 'Send level up notification',
        'POST /api/email/send-onboarding': 'Send onboarding email',
        'GET /api/email/preview/registration': 'Preview registration email'
      },
      deepSearch: {
        'POST /api/deep-search/search': 'General web search with AI response',
        'POST /api/deep-search/development': 'Search development topics',
        'POST /api/deep-search/language': 'Search programming language info',
        'POST /api/deep-search/github': 'Search GitHub and open source topics',
        'GET /api/deep-search/health': 'Deep search service health'
      },
      auth: {
        'POST /api/auth/login': 'User login',
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/logout': 'User logout'
      },
      quests: {
        'POST /api/quests/generate': 'Generate a new quest for specific level',
        'POST /api/quests/generate-weekly': 'Generate weekly quests for all levels',
        'GET /api/quests/active': 'Get active quests',
        'GET /api/quests/:questId': 'Get quest by ID',
        'POST /api/quests/:questId/stake': 'Stake user for quest',
        'POST /api/quests/:questId/submit': 'Submit solution for quest',
        'GET /api/quests/:questId/leaderboard': 'Get quest leaderboard',
        'GET /api/quests/user/:username/history': 'Get user quest history',
        'PUT /api/quests/update-statuses': 'Update quest statuses (admin)',
        'POST /api/quests/send-notifications': 'Send quest notifications (admin)',
        'POST /api/quests/auto-generate-weekly': 'Auto-generate weekly quests (cron)',
        'POST /api/quests/:questId/process-results': 'Process quest results (admin)',
        'POST /api/quests/process-all-closed': 'Process all closed quests (admin)',
        'PUT /api/quests/update-wallet': 'Update user wallet address',
        'GET /api/quests/crypto-rates': 'Get crypto reward rates by level'
      },
      cron: {
        'GET /api/cron/status': 'Get cron jobs status',
        'POST /api/cron/start-all': 'Start all cron jobs',
        'POST /api/cron/stop-all': 'Stop all cron jobs',
        'POST /api/cron/start/:jobName': 'Start specific cron job',
        'POST /api/cron/stop/:jobName': 'Stop specific cron job',
        'POST /api/cron/trigger/:jobName': 'Manually trigger cron job'
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 GitHub Analytics Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API info: http://localhost:${PORT}/api`);
});

module.exports = app;