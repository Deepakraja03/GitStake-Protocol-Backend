# GitStake - Advanced GitHub Analytics & Developer Recognition Platform

A comprehensive Node.js Express server that analyzes GitHub profiles using AI, provides developer level progression, rewards excellence, and offers intelligent assistance through dual AI systems with web search capabilities.

## 🚀 Core Features

### 📊 Comprehensive GitHub Integration (Octokit)
- **Complete Profile Analysis**: Deep dive into GitHub profiles with 50+ metrics
- **Smart Repository Filtering**: Excludes forks, focuses on programming files, filters README-only repos
- **Advanced Code Quality Assessment**: Analyzes commit quality, complexity, and programming patterns
- **Intelligent Empty Commit Detection**: Filters low-quality commits with pattern recognition
- **Multi-Language Proficiency Tracking**: Detailed language usage with repository-level breakdown
- **Collaboration Metrics**: PR, issue, merge analysis with success rates and timing
- **Contribution Streak Analysis**: Current/longest streaks with gap analysis and consistency scoring
- **Activity Pattern Recognition**: Time-based analysis (hourly, daily, monthly patterns)
- **Innovation Scoring**: Technology diversity and experimental project assessment

### 🏆 Developer Level Progression System
8 engaging developer levels with detailed criteria:
- 🌱 **Code Rookie** (0-20 points) - Just starting the coding journey
- 🔍 **Code Explorer** (21-35 points) - Exploring technologies and building foundations  
- 🔨 **Code Builder** (36-50 points) - Building solid projects and gaining momentum
- ⚡ **Code Craftsman** (51-65 points) - Crafting quality code with growing expertise
- 🏗️ **Code Architect** (66-80 points) - Designing complex systems and leading projects
- 🧙‍♂️ **Code Wizard** (81-90 points) - Mastering multiple domains with exceptional skills
- 👑 **Code Legend** (91-95 points) - Legendary contributor with massive impact
- 🚀 **Code Titan** (96-100 points) - Titan of code - reshaping the development world

### 🤖 Dual AI System
#### **Standard AI Service** (Profile Analysis)
- **Human-like Analysis**: Natural language insights without robotic phrases
- **Personalized Recommendations**: Actionable growth suggestions
- **Skill Level Assessment**: Intelligent classification with detailed reasoning
- **Encouraging Tone**: Supportive and motivational feedback

#### **Deep Search AI Service** (Web-Enhanced Responses)
- **Real-time Web Search**: Integration with `web-deep-search.vercel.app`
- **Source Attribution**: Cites reliable sources for all information
- **Two-step Processing**: Web search → AI humanization
- **Current Information**: Up-to-date answers on development topics
- **Context-Aware**: Relates answers back to GitStake and developer growth

### 💬 Intelligent Chat Assistant
- **GitStake AI Assistant**: Platform-specific guidance and support
- **Natural Conversations**: Human-like responses without AI jargon
- **Developer-Friendly**: Talks like a fellow developer
- **Multi-Modal Support**: Standard chat + deep search capabilities
- **Context Awareness**: Remembers user context and preferences

### 🗄️ Advanced MongoDB Storage & Analytics
- **Comprehensive Data Storage**: Every commit, PR, issue, merge with full details
- **Real-time Updates**: Refresh analytics on demand with change detection
- **Multi-Metric Leaderboards**: Rankings by proficiency, commits, collaboration, innovation
- **Historical Tracking**: Progress over time with trend analysis
- **Performance Optimization**: Efficient indexing, pagination, and selective loading

### 📧 Smart Email Notification System
- **Beautiful Templates**: Responsive, developer-focused email designs
- **Automated Triggers**: Level ups, achievements, analysis completion
- **Personalized Content**: Dynamic content based on user progress
- **Template Previews**: Test and preview email templates

## 📁 Enhanced Project Structure

```
├── config/              # Configuration files
│   └── database.js      # MongoDB connection setup
├── controllers/         # Business logic controllers
│   ├── authController.js        # Authentication management
│   ├── userController.js        # User analytics and management
│   ├── githubController.js      # Complete GitHub API operations
│   ├── chatController.js        # Standard AI chat assistant
│   ├── deepSearchController.js  # Web search + AI responses
│   └── emailController.js       # Email notification system
├── middleware/          # Custom middleware
│   ├── errorHandler.js          # Global error handling
│   ├── notFound.js              # 404 handler
│   └── validateGitHubUser.js    # GitHub user validation
├── models/              # MongoDB schemas & enums
│   ├── GitHubUser.js            # User data schema with detailed analytics
│   └── DeveloperLevel.js        # Developer progression system
├── routes/              # API route definitions
│   ├── authRoutes.js            # Authentication endpoints
│   ├── userRoutes.js            # User management and analytics
│   ├── githubRoutes.js          # GitHub API integration endpoints
│   ├── chatRoutes.js            # Standard AI chat endpoints
│   ├── deepSearchRoutes.js      # Deep search AI endpoints
│   └── emailRoutes.js           # Email notification endpoints
├── services/            # External service integrations
│   ├── githubService.js         # Comprehensive GitHub API integration
│   ├── aiService.js             # Standard AI insights generation
│   ├── chatService.js           # GitStake AI Assistant
│   ├── deepSearchAIService.js   # Web search + AI service
│   ├── emailService.js          # Email delivery service
│   ├── advancedAnalytics.js     # Advanced analytics calculations
│   └── dataProcessingHelpers.js # Data processing utilities
├── templates/           # Email templates
│   └── emailTemplates.js        # Beautiful responsive email designs
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── server.js           # Main server file
├── vercel.json         # Vercel deployment config
├── GITHUB_TOKEN_SETUP.md # GitHub token setup guide
├── GitStake-API.postman_collection.json # Complete API collection
└── README.md           # This file
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

## 📊 Complete API Endpoints

### 👤 User Analytics & Management
- `GET /api/users` - Get all analyzed users (with pagination & filtering)
- `GET /api/users/leaderboard` - Multi-metric leaderboard with developer levels
- `GET /api/users/:username` - Complete user profile with detailed analytics
- `GET /api/users/:username/analytics` - Analytics summary with insights
- `POST /api/users/analyze` - Comprehensive GitHub user analysis
- `PUT /api/users/:username/update` - Refresh user analytics with change detection
- `DELETE /api/users/:username` - Remove user data

### 🐙 GitHub API Integration (Complete Octokit Coverage)
#### Profile & Social
- `GET /api/github/profile/:username` - Complete GitHub profile
- `GET /api/github/profile/:username/events` - User activity events
- `GET /api/github/profile/:username/followers` - Followers list
- `GET /api/github/profile/:username/following` - Following list

#### Repository Management
- `GET /api/github/repos/:username` - User repositories with filters
- `GET /api/github/repos/:owner/:repo` - Detailed repository information
- `GET /api/github/repos/:owner/:repo/commits` - Repository commits with stats
- `GET /api/github/repos/:owner/:repo/contributors` - Repository contributors
- `GET /api/github/repos/:owner/:repo/languages` - Programming languages used
- `GET /api/github/repos/:owner/:repo/stats` - Repository statistics

#### Pull Requests & Issues
- `GET /api/github/repos/:owner/:repo/pulls` - Pull requests with details
- `GET /api/github/repos/:owner/:repo/pulls/:number` - Specific PR details
- `GET /api/github/repos/:owner/:repo/pulls/:number/commits` - PR commits
- `GET /api/github/repos/:owner/:repo/pulls/:number/files` - PR file changes
- `GET /api/github/repos/:owner/:repo/issues` - Repository issues
- `GET /api/github/repos/:owner/:repo/issues/:number` - Specific issue
- `GET /api/github/repos/:owner/:repo/issues/:number/comments` - Issue comments

#### Advanced Analytics
- `GET /api/github/analytics/:username/complexity` - Code complexity analysis
- `GET /api/github/analytics/:username/activity` - Activity patterns & trends
- `GET /api/github/analytics/:username/collaboration` - Collaboration metrics
- `GET /api/github/analytics/:username/quality` - Code quality assessment
- `GET /api/github/analytics/:username/trends` - Historical trend analysis

#### Search & Discovery
- `GET /api/github/search/repositories` - Repository search with filters
- `GET /api/github/search/users` - User search capabilities
- `GET /api/github/search/code` - Code search across repositories

#### Organizations & Gists
- `GET /api/github/orgs/:org` - Organization details
- `GET /api/github/orgs/:org/repos` - Organization repositories
- `GET /api/github/orgs/:org/members` - Organization members
- `GET /api/github/gists/:username` - User gists
- `GET /api/github/gists/:gist_id` - Specific gist details

#### System
- `GET /api/github/rate-limit` - GitHub API rate limit status

### 🤖 AI Chat Assistant (Standard)
- `POST /api/chat/ask` - Ask GitStake AI Assistant (platform-specific)
- `GET /api/chat/health` - Standard AI service health status

### 🔍 Deep Search AI (Web-Enhanced)
- `POST /api/deep-search/search` - General web search with AI response
- `POST /api/deep-search/development` - Search development topics with context
- `POST /api/deep-search/language` - Programming language information search
- `POST /api/deep-search/github` - GitHub and open source topic search
- `GET /api/deep-search/health` - Deep search service health status

### 📧 Email Notification System
#### Send Emails
- `POST /api/email/send-registration` - Welcome registration email
- `POST /api/email/send-level-up` - Level up achievement notification
- `POST /api/email/send-onboarding` - Profile analysis completion email
- `POST /api/email/send-leaderboard` - Leaderboard achievement notification

#### Preview Templates
- `GET /api/email/preview/registration` - Preview registration email
- `GET /api/email/preview/level-up` - Preview level up email
- `GET /api/email/preview/onboarding` - Preview onboarding email
- `GET /api/email/preview/leaderboard` - Preview leaderboard email

### 🔐 Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### 🏥 System Health & Info
- `GET /health` - Server health status with environment info
- `GET /api` - Complete API documentation with all endpoints

## 🎯 Usage Examples

### 📊 Comprehensive GitHub Analysis
```bash
# Analyze a GitHub user (returns 50+ metrics, detailed data)
curl -X POST http://localhost:3000/api/users/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "octocat"}'

# Get user analytics with developer level
curl http://localhost:3000/api/users/octocat/analytics

# Get multi-metric leaderboard
curl "http://localhost:3000/api/users/leaderboard?metric=proficiencyScore&limit=10"
```

### 🤖 AI Assistant Interactions
```bash
# Standard GitStake AI Assistant
curl -X POST http://localhost:3000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I improve from Code Builder to Code Craftsman?",
    "context": {"username": "developer123"}
  }'

# Deep Search AI (Web-enhanced responses)
curl -X POST http://localhost:3000/api/deep-search/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "React hooks best practices 2025",
    "context": {"username": "developer123"}
  }'

# Search programming language info
curl -X POST http://localhost:3000/api/deep-search/language \
  -H "Content-Type: application/json" \
  -d '{
    "language": "TypeScript",
    "specificTopic": "advanced types",
    "context": {"username": "developer123"}
  }'
```

### 🔍 Advanced GitHub Analytics
```bash
# Code complexity analysis
curl http://localhost:3000/api/github/analytics/octocat/complexity

# Activity patterns and trends
curl http://localhost:3000/api/github/analytics/octocat/activity?timeframe=1year

# Collaboration metrics
curl http://localhost:3000/api/github/analytics/octocat/collaboration

# Code quality assessment
curl http://localhost:3000/api/github/analytics/octocat/quality
```

### 📧 Email Notifications
```bash
# Send level up notification
curl -X POST http://localhost:3000/api/email/send-level-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "name": "John Developer",
    "oldLevel": {"name": "Code Builder", "emoji": "🔨"},
    "newLevel": {
      "name": "Code Craftsman", 
      "emoji": "⚡", 
      "description": "Crafting quality code with growing expertise"
    }
  }'

# Preview email template
curl "http://localhost:3000/api/email/preview/registration?name=John Developer"
```

### 🐙 GitHub API Operations
```bash
# Get repository details with stats
curl http://localhost:3000/api/github/repos/octocat/Hello-World

# Search repositories with filters
curl "http://localhost:3000/api/github/search/repositories?q=javascript&sort=stars&order=desc"

# Get pull request details
curl http://localhost:3000/api/github/repos/octocat/Hello-World/pulls/1
```

## 🔍 Advanced Analytics Features

### 📈 Comprehensive Code Quality Assessment
- **Intelligent Commit Analysis**: Quality scoring with pattern recognition for meaningful vs empty commits
- **Message Quality Metrics**: Average length, common patterns, and improvement suggestions
- **Pull Request Success Analytics**: Merge rates, review times, and collaboration effectiveness
- **Multi-Language Complexity Scoring**: Language-specific complexity assessment and proficiency tracking
- **Repository Quality Filtering**: Smart filtering of programming repos, excluding documentation-only projects
- **Code Change Analysis**: Lines added/deleted, file modification patterns, and impact assessment

### 🏆 Dynamic Developer Progression System
- **Multi-Dimensional Scoring**: 25+ factors including code quality, collaboration, innovation, and consistency
- **Real-Time Level Updates**: Instant recalculation with change detection and level-up notifications
- **Progress Milestone Tracking**: Historical progression with achievement timestamps
- **Personalized Growth Paths**: AI-powered recommendations based on current level and activity patterns
- **Peer Comparison**: Contextual ranking against developers with similar experience levels

### 🤝 Advanced Collaboration Metrics
- **Cross-Repository Analysis**: Collaboration patterns across multiple projects and organizations
- **Community Engagement Scoring**: Issue resolution, PR reviews, and discussion participation
- **Team Dynamics Assessment**: Contributor relationship mapping and influence analysis
- **Open Source Impact Measurement**: External contributions, community building, and project leadership
- **Mentorship Indicators**: Code review quality, issue guidance, and knowledge sharing patterns

### 📊 Comprehensive Trend Analysis
- **Multi-Timeframe Activity Patterns**: Hourly, daily, weekly, monthly, and yearly trend analysis
- **Language Evolution Tracking**: Technology adoption patterns and skill development over time
- **Consistency & Reliability Scoring**: Regular contribution patterns with gap analysis
- **Innovation Metrics**: Experimental project identification and technology diversity assessment
- **Predictive Growth Modeling**: Future trajectory predictions based on current patterns

### 🔬 Detailed Data Collections
- **Complete Commit History**: Every commit with file changes, stats, and quality metrics
- **Full Pull Request Analysis**: All PRs with merge data, review comments, and collaboration details
- **Comprehensive Issue Tracking**: Complete issue lifecycle with resolution patterns and engagement
- **Contributor Network Mapping**: Detailed collaboration graphs and influence metrics
- **Repository Performance Analytics**: Individual repo scoring with activity and impact assessment

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

## 🤖 Dual AI System Integration

### 🎯 Standard AI Service (Profile Analysis)
- **Human-Like Analysis**: Natural language insights without robotic phrases or AI jargon
- **Platform-Specific Knowledge**: Deep understanding of GitStake features and developer progression
- **Personalized Growth Guidance**: Tailored advice for reaching the next developer level
- **Encouraging Communication**: Supportive, motivational tone that sounds like a developer friend
- **Contextual Recommendations**: Actionable suggestions based on current skill level and activity patterns

### 🔍 Deep Search AI Service (Web-Enhanced Intelligence)
- **Real-Time Web Search**: Integration with `web-deep-search.vercel.app` for current information
- **Two-Step Processing**: Web search → AI humanization for natural, conversational responses
- **Source Attribution**: Reliable source citations for all information provided
- **Current Technology Insights**: Up-to-date information on development trends, tools, and best practices
- **Context-Aware Responses**: Relates web search results back to GitStake features and user growth

### 💬 Intelligent Chat Capabilities
- **Natural Conversation Flow**: Human-like responses that avoid typical AI language patterns
- **Developer-Focused Communication**: Talks like an experienced developer colleague
- **Multi-Modal Support**: Choose between standard GitStake assistance or web-enhanced responses
- **Contextual Memory**: Remembers user information and preferences across conversations
- **Fallback Intelligence**: Graceful degradation with helpful responses when services are unavailable

### 🧠 Advanced AI Features
- **Profile Intelligence**: Comprehensive GitHub profile analysis with personality insights
- **Strength Pattern Recognition**: Identifies unique developer strengths and growth opportunities
- **Recommendation Engine**: Multi-factor analysis for personalized improvement suggestions
- **Skill Level Assessment**: Intelligent classification using 25+ metrics and behavioral patterns
- **Trend Prediction**: Future growth trajectory analysis based on current development patterns

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

## 🚀 What Makes GitStake Special

### 🎯 **Comprehensive Analysis**
- **50+ Metrics**: Most detailed GitHub analysis available
- **Real-Time Processing**: Instant updates with change detection
- **Enterprise-Level Insights**: Professional-grade analytics in one API call
- **Complete Data Access**: Every commit, PR, issue, merge with full details

### 🤖 **Dual AI Intelligence**
- **Human-Like Responses**: No robotic language, talks like a real developer
- **Web-Enhanced Knowledge**: Current, up-to-date information through web search
- **Context-Aware**: Understands your developer journey and provides relevant guidance
- **Encouraging Support**: Motivational feedback that helps you grow

### 🏆 **Gamified Progression**
- **8 Engaging Levels**: From Code Rookie 🌱 to Code Titan 🚀
- **Multi-Factor Scoring**: Quality over quantity approach
- **Achievement System**: Email notifications for milestones and level-ups
- **Peer Comparison**: See how you rank against other developers

### 📊 **Professional Features**
- **MongoDB Integration**: Persistent, scalable data storage
- **Email Automation**: Beautiful, responsive notification system
- **API-First Design**: Complete REST API with Postman collection
- **Production Ready**: Comprehensive error handling, rate limiting, security

### 🔧 **Developer Experience**
- **Easy Setup**: Detailed documentation and setup guides
- **Comprehensive Testing**: Complete Postman collection included
- **Flexible Deployment**: Works locally, on cloud platforms, or containers
- **Extensible Architecture**: Clean, modular codebase for easy customization

---

**GitStake** - Where GitHub contributions meet recognition, rewards, and intelligent growth guidance! 🚀

*Transform your GitHub profile into a comprehensive developer portfolio with AI-powered insights and gamified progression.*