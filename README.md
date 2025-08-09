# GitStake - GitHub Analytics & Developer Recognition Platform

A comprehensive Node.js Express server that analyzes GitHub profiles using AI, provides developer level progression, and rewards excellence through blockchain technology.

## 🚀 Features

### GitHub Integration (Octokit)
- **Complete Profile Analysis**: Deep dive into GitHub profiles with comprehensive metrics
- **Smart Repository Filtering**: Excludes forks, focuses on programming files, filters out README-only repos
- **Code Quality Assessment**: Analyzes commit quality, complexity, and programming patterns
- **Empty Commit Detection**: Intelligent filtering of low-quality commits
- **Programming Language Proficiency**: Multi-language expertise tracking with usage percentages
- **Collaboration Metrics**: PR, issue, and merge analysis for teamwork assessment
- **Contribution Streak Tracking**: Current and longest streak calculations
- **Advanced Analytics**: Trend analysis, activity patterns, and growth metrics

### Developer Level System
8 catchy developer progression levels:
- 🌱 **Code Rookie** (0-20 points) - Just starting the coding journey
- 🔍 **Code Explorer** (21-35 points) - Exploring technologies and building foundations
- 🔨 **Code Builder** (36-50 points) - Building solid projects and gaining momentum
- ⚡ **Code Craftsman** (51-65 points) - Crafting quality code with growing expertise
- 🏗️ **Code Architect** (66-80 points) - Designing complex systems and leading projects
- 🧙‍♂️ **Code Wizard** (81-90 points) - Mastering multiple domains with exceptional skills
- 👑 **Code Legend** (91-95 points) - Legendary contributor with massive impact
- 🚀 **Code Titan** (96-100 points) - Titan of code - reshaping the development world

### AI-Powered Insights
- **Profile Summaries**: AI-generated professional summaries
- **Strength Identification**: Personalized strength analysis
- **Growth Recommendations**: Tailored improvement suggestions
- **Skill Level Assessment**: Intelligent classification based on multiple factors
- **Chat Assistant**: GitStake AI Assistant for platform guidance and support

### MongoDB Storage & Analytics
- **Persistent Data Storage**: Efficient MongoDB integration with indexing
- **Real-time Updates**: Refresh analytics on demand
- **Leaderboard System**: Multi-metric ranking system
- **Historical Tracking**: Track progress over time
- **Performance Optimization**: Pagination, selective loading, and caching

### Email Notifications
- **Welcome Emails**: Beautiful onboarding experience
- **Level Up Notifications**: Celebrate achievements
- **Leaderboard Achievements**: Recognition for top performers
- **Profile Analysis Complete**: Confirmation of successful analysis

## 📁 Project Structure

```
├── config/              # Configuration files
│   └── database.js      # MongoDB connection
├── controllers/         # Business logic controllers
│   ├── authController.js
│   ├── userController.js
│   ├── githubController.js
│   ├── chatController.js
│   └── emailController.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js
│   ├── notFound.js
│   └── validateGitHubUser.js
├── models/              # MongoDB schemas & enums
│   ├── GitHubUser.js
│   └── DeveloperLevel.js
├── routes/              # API route definitions
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── githubRoutes.js
│   ├── chatRoutes.js
│   └── emailRoutes.js
├── services/            # External service integrations
│   ├── githubService.js # Comprehensive GitHub API integration
│   ├── aiService.js     # AI insights generation
│   ├── chatService.js   # GitStake AI Assistant
│   └── emailService.js  # Email notifications
├── templates/           # Email templates
│   └── emailTemplates.js
├── .env                 # Environment variables
├── package.json
├── server.js           # Main server file
└── README.md
```

## 🛠 Installation & Setup

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd gitstake-server
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gitstake
GITHUB_TOKEN=your_github_personal_access_token_here
POLLINATIONS_API_URL=https://text.pollinations.ai/
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

### 3. GitHub Token Setup
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with these scopes:
   - `public_repo` (for public repository access)
   - `read:user` (for user profile information)
   - `read:org` (for organization data)
3. Add the token to your `.env` file

### 4. Email Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for the application
3. Add your email and app password to the `.env` file

### 5. Database Setup
- **Local MongoDB**: Ensure MongoDB is running locally
- **MongoDB Atlas**: Use the connection string format in `.env`

### 6. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📊 API Endpoints

### User Analytics
- `GET /api/users` - Get all analyzed users (with pagination)
- `GET /api/users/leaderboard` - Get user leaderboard by metrics
- `GET /api/users/:username` - Get specific user's complete data
- `GET /api/users/:username/analytics` - Get user's analytics summary
- `POST /api/users/analyze` - Analyze a GitHub user (creates/updates)
- `PUT /api/users/:username/update` - Refresh user's analytics
- `DELETE /api/users/:username` - Delete user data

### GitHub API Integration
- `GET /api/github/profile/:username` - Get GitHub profile
- `GET /api/github/profile/:username/events` - Get user events
- `GET /api/github/profile/:username/followers` - Get followers
- `GET /api/github/repos/:username` - Get user repositories
- `GET /api/github/repos/:owner/:repo` - Get specific repository
- `GET /api/github/repos/:owner/:repo/commits` - Get repository commits
- `GET /api/github/repos/:owner/:repo/pulls` - Get pull requests
- `GET /api/github/repos/:owner/:repo/issues` - Get issues
- `GET /api/github/analytics/:username/complexity` - Code complexity analysis
- `GET /api/github/analytics/:username/activity` - Activity analytics
- `GET /api/github/analytics/:username/collaboration` - Collaboration metrics
- `GET /api/github/analytics/:username/quality` - Code quality analysis
- `GET /api/github/analytics/:username/trends` - Trend analysis
- `GET /api/github/search/repositories` - Search repositories
- `GET /api/github/search/users` - Search users
- `GET /api/github/search/code` - Search code
- `GET /api/github/rate-limit` - Get API rate limit status

### AI Chat Assistant
- `POST /api/chat/ask` - Ask GitStake AI Assistant
- `GET /api/chat/health` - Get assistant health status

### Email Notifications
- `POST /api/email/send-registration` - Send registration email
- `POST /api/email/send-level-up` - Send level up notification
- `POST /api/email/send-onboarding` - Send onboarding email
- `POST /api/email/send-leaderboard` - Send leaderboard achievement
- `GET /api/email/preview/*` - Preview email templates

### Authentication (Basic)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### System
- `GET /health` - Server health status
- `GET /api` - API documentation and endpoints

## 🎯 Usage Examples

### Analyze a GitHub User
```bash
curl -X POST http://localhost:3000/api/users/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "octocat"}'
```

### Get User Analytics with Developer Level
```bash
curl http://localhost:3000/api/users/octocat/analytics
```

### Get Leaderboard
```bash
curl "http://localhost:3000/api/users/leaderboard?metric=proficiencyScore&limit=10"
```

### Ask GitStake AI Assistant
```bash
curl -X POST http://localhost:3000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I improve my developer level?", "context": {"username": "octocat"}}'
```

### Get Code Complexity Analysis
```bash
curl http://localhost:3000/api/github/analytics/octocat/complexity
```

### Send Level Up Email
```bash
curl -X POST http://localhost:3000/api/email/send-level-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Developer",
    "oldLevel": {"name": "Code Builder", "emoji": "🔨"},
    "newLevel": {"name": "Code Craftsman", "emoji": "⚡", "description": "Crafting quality code with growing expertise"}
  }'
```

## 🔍 Advanced Analytics Features

### Code Quality Assessment
- **Commit Quality Scoring**: Analyzes commit message quality and meaningfulness
- **Empty Commit Detection**: Filters out generic commits like "fix", "update"
- **Pull Request Success Rate**: Tracks merge success and collaboration patterns
- **Code Complexity Analysis**: Multi-language complexity assessment
- **Repository Quality**: Focuses on programming repositories, excludes documentation-only

### Developer Progression System
- **Multi-Factor Scoring**: Combines commits, repositories, languages, and collaboration
- **Dynamic Level Calculation**: Real-time level updates based on latest activity
- **Progress Tracking**: Historical progression and achievement milestones
- **Personalized Recommendations**: AI-powered suggestions for improvement

### Collaboration Metrics
- **Pull Request Analysis**: Creation, merge rates, and review participation
- **Issue Management**: Issue creation, resolution, and community engagement
- **Team Contribution**: Multi-repository collaboration patterns
- **Open Source Impact**: Contribution to external projects and communities

### Trend Analysis
- **Activity Patterns**: Monthly and yearly contribution trends
- **Language Evolution**: Programming language adoption over time
- **Consistency Scoring**: Regular contribution pattern analysis
- **Growth Trajectory**: Predictive insights for developer progression

## 🚀 Performance & Scalability

### Rate Limiting & Optimization
- **GitHub API Rate Limiting**: Intelligent request management (5000/hour)
- **Request Batching**: Efficient API call optimization
- **Caching Strategy**: MongoDB-based result caching
- **Pagination**: Efficient data loading for large datasets

### Database Optimization
- **Indexing Strategy**: Optimized queries for username and analytics
- **Selective Loading**: Field-specific data retrieval
- **Aggregation Pipelines**: Efficient leaderboard calculations
- **Connection Pooling**: Optimized MongoDB connections

## 🔒 Security & Best Practices

### Security Features
- **Helmet.js**: Security headers and protection
- **CORS Configuration**: Cross-origin request management
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without data leakage

### Code Quality
- **Modular Architecture**: Clean separation of concerns
- **Error Boundaries**: Comprehensive error handling
- **Logging**: Structured logging with Morgan
- **Environment Configuration**: Secure environment variable management

## 🤖 AI Integration

### GitStake AI Assistant
- **Platform-Specific Knowledge**: Specialized in GitStake and GitHub analytics
- **Developer Guidance**: Personalized advice for skill improvement
- **Level Progression Help**: Guidance on reaching next developer level
- **Fallback Responses**: Graceful handling of service unavailability

### AI-Powered Insights
- **Profile Analysis**: Intelligent summary generation
- **Strength Identification**: Pattern recognition for developer strengths
- **Recommendation Engine**: Personalized improvement suggestions
- **Skill Assessment**: Multi-factor skill level determination

## 📧 Email System

### Beautiful Email Templates
- **Modern Design**: Professional, developer-focused styling
- **Responsive Layout**: Mobile-friendly email templates
- **Brand Consistency**: GitStake branding and color scheme
- **Interactive Elements**: Call-to-action buttons and links

### Automated Notifications
- **Welcome Series**: Onboarding email sequence
- **Achievement Alerts**: Level up and milestone notifications
- **Leaderboard Updates**: Weekly ranking notifications
- **Analysis Complete**: Profile analysis confirmation

## 🔧 Development & Deployment

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run in production mode
npm start
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `GITHUB_TOKEN`: GitHub Personal Access Token
- `POLLINATIONS_API_URL`: AI service endpoint
- `EMAIL`: Gmail address for notifications
- `EMAIL_PASSWORD`: Gmail app password

### Deployment Considerations
- **MongoDB Atlas**: Cloud database for production
- **Environment Security**: Secure token and credential management
- **Rate Limiting**: GitHub API quota management
- **Error Monitoring**: Comprehensive logging and monitoring
- **Scalability**: Horizontal scaling considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub API**: Comprehensive developer data
- **Octokit**: Excellent GitHub API client
- **Pollinations AI**: AI-powered insights
- **MongoDB**: Reliable data storage
- **Express.js**: Robust web framework

---

**GitStake** - Where GitHub contributions meet recognition and rewards! 🚀