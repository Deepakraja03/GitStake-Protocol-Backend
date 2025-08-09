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
const { range } = require('lodash');

// Global middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/email', emailRoutes);


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
      auth: {
        'POST /api/auth/login': 'User login',
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/logout': 'User logout'
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