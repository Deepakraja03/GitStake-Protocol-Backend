# GitStake Quest System 🎯

An AI-powered weekly coding challenge system that creates personalized quests for developers based on their skill levels using Pollinations.ai.

## 🌟 Features

- **AI-Generated Quests**: Leverages Pollinations.ai to create unique coding challenges
- **8 Developer Levels**: From Rookie 🌱 to Titan 🚀
- **Weekly Schedule**: Automated quest lifecycle management
- **Email Notifications**: Automated email system for all quest phases
- **Leaderboards**: Real-time rankings and scoring
- **Cron Job Automation**: Fully automated quest management
- **Comprehensive API**: RESTful endpoints for all operations

## 🗓️ Weekly Quest Schedule

| Day | Phase | Description |
|-----|-------|-------------|
| **Sunday** | Quest Creation & Staking Start | New quests generated, staking begins |
| **Monday-Tuesday** | Staking Period | Developers can stake to participate |
| **Wednesday-Thursday** | Challenge Period | Staked developers submit solutions |
| **Friday** | Quest Closes | Submissions close, results processing begins |
| **Saturday** | Results Announcement | Winners announced, rewards distributed |

## 🎯 Developer Levels

| Level | Name | Emoji | Score Range | Description |
|-------|------|-------|-------------|-------------|
| 1 | Code Rookie | 🌱 | 0-20 | Just starting the coding journey |
| 2 | Code Explorer | 🔍 | 21-35 | Exploring technologies and building foundations |
| 3 | Code Builder | 🔨 | 36-50 | Building solid projects and gaining momentum |
| 4 | Code Craftsman | ⚡ | 51-65 | Crafting quality code with growing expertise |
| 5 | Code Architect | 🏗️ | 66-80 | Designing complex systems and leading projects |
| 6 | Code Wizard | 🧙‍♂️ | 81-90 | Mastering multiple domains with exceptional skills |
| 7 | Code Legend | 👑 | 91-95 | Legendary contributor with massive impact |
| 8 | Code Titan | 🚀 | 96-100 | Titan of code - reshaping the development world |

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
POLLINATIONS_API_URL=https://text.pollinations.ai/
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
AUTO_START_CRON=true
```

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Test the System

```bash
# Run the test script
node test-quest-system.js
```

## 📡 API Endpoints

### Quest Management

```http
# Generate a quest for specific level
POST /api/quests/generate
{
  "developerLevel": "BUILDER",
  "challengeType": "algorithm",
  "techStack": ["JavaScript", "Node.js"],
  "theme": "adventure"
}

# Generate weekly quests for all levels
POST /api/quests/generate-weekly

# Get active quests
GET /api/quests/active?developerLevel=BUILDER

# Get quest by ID
GET /api/quests/{questId}
```

### Quest Participation

```http
# Stake for a quest
POST /api/quests/{questId}/stake
{
  "username": "developer123",
  "email": "developer@example.com",
  "developerLevel": "BUILDER"
}

# Submit solution
POST /api/quests/{questId}/submit
{
  "username": "developer123",
  "email": "developer@example.com",
  "solution": "function solve(input) { /* solution */ }"
}

# Get leaderboard
GET /api/quests/{questId}/leaderboard

# Get user quest history
GET /api/quests/user/{username}/history
```

### Cron Job Management

```http
# Get cron job status
GET /api/cron/status

# Start/stop all jobs
POST /api/cron/start-all
POST /api/cron/stop-all

# Manually trigger jobs
POST /api/cron/trigger/weeklyQuestGeneration
POST /api/cron/trigger/statusUpdate
POST /api/cron/trigger/notifications
POST /api/cron/trigger/resultsProcessing
```

## 🤖 AI Quest Generation

The system uses Pollinations.ai to generate unique coding challenges. Each quest includes:

- **Engaging Title**: Level-specific with emojis
- **Story-driven Description**: Immersive narrative with learning objectives
- **Problem Statement**: Detailed with examples and edge cases
- **Starter Code**: Language-specific templates
- **Complete Solution**: With complexity analysis
- **Evaluation Criteria**: Weighted scoring system
- **Achievements**: Gamification elements
- **Rewards**: Points, badges, and titles

### AI Prompt Structure

The system uses a sophisticated prompt that includes:
- Developer level context and scoring criteria
- Challenge type and tech stack requirements
- Theme and narrative elements
- JSON template for consistent output
- Complexity scaling based on level

## ⏰ Automated Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| **Weekly Quest Generation** | Sunday 00:00 UTC | Generate quests for all levels |
| **Status Updates** | Every hour | Update quest statuses based on schedule |
| **Notifications** | Daily 09:00 UTC | Send scheduled email notifications |
| **Results Processing** | Friday 01:00 UTC | Process closed quests and determine winners |

## 📧 Email System

Automated emails are sent for:

1. **Staking Confirmation**: When a user stakes for a quest
2. **Challenge Start**: When the challenge period begins (Wednesday)
3. **Results Announcement**: When winners are announced (Saturday)

All emails use responsive HTML templates with GitStake branding.

## 🏆 Scoring & Rewards

### Evaluation Criteria
- **Correctness** (40%): Solution accuracy
- **Efficiency** (30%): Algorithm performance
- **Code Quality** (20%): Clean, readable code
- **Creativity** (10%): Innovative approaches

### Rewards System
- **Winner Rewards**: High points, exclusive badges, special titles
- **Participation Rewards**: Base points, participation badges
- **Achievements**: Bonus points for special conditions

## 🧪 Testing

### Manual Testing

```bash
# Test quest generation
curl -X POST http://localhost:3000/api/quests/generate \
  -H "Content-Type: application/json" \
  -d '{"developerLevel":"BUILDER","challengeType":"algorithm","techStack":["JavaScript"],"theme":"adventure"}'

# Test staking
curl -X POST http://localhost:3000/api/quests/{questId}/stake \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","developerLevel":"BUILDER"}'
```

### Automated Testing

```bash
# Run comprehensive test suite
node test-quest-system.js
```

### Postman Collection

Import the provided Postman collections:
- `QUEST_POSTMAN_ENDPOINTS.json`
- `CRON_POSTMAN_ENDPOINTS.json`

## 🔧 Configuration

### Quest Generation Settings

```javascript
// Customize in services/questService.js
const challengeTypes = ['algorithm', 'data-structure', 'debugging', 'optimization'];
const techStacks = [
  ['JavaScript', 'Node.js'],
  ['Python'],
  ['Java'],
  ['TypeScript', 'React']
];
const themes = ['adventure', 'mystery', 'space', 'fantasy', 'cyberpunk'];
```

### Cron Job Schedules

```javascript
// Customize in services/cronService.js
'0 0 * * 0'    // Sunday 00:00 - Weekly quest generation
'0 * * * *'    // Every hour - Status updates
'0 9 * * *'    // Daily 09:00 - Notifications
'0 1 * * 5'    // Friday 01:00 - Results processing
```

## 📊 Database Schema

### Quest Model
- Basic quest information (title, description, level)
- Problem statement with examples and constraints
- Starter code and complete solution
- Evaluation criteria and rewards
- Schedule and status tracking
- Participant data (staked, submitted)
- Winners and statistics
- AI generation metadata

### Indexes
- `{ developerLevel: 1, status: 1, 'schedule.weekNumber': 1 }`
- `{ 'schedule.stakingStart': 1, 'schedule.challengeStart': 1 }`

## 🚨 Error Handling

- Comprehensive error handling for AI generation failures
- Fallback quest generation when AI is unavailable
- Email delivery error handling with logging
- Database operation error recovery
- Rate limiting protection

## 🔒 Security

- Input validation for all endpoints
- Email sanitization
- Rate limiting on AI requests
- Secure environment variable handling
- MongoDB injection prevention

## 📈 Monitoring

- Comprehensive logging for all operations
- Cron job execution tracking
- Email delivery status monitoring
- AI generation success/failure rates
- Quest participation analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the API documentation
2. Run the test script to verify setup
3. Check server logs for errors
4. Review environment variable configuration

## 🎯 Roadmap

- [ ] Advanced AI evaluation of submitted solutions
- [ ] Real-time collaboration features
- [ ] Mobile app integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with popular IDEs
- [ ] Social features and team challenges