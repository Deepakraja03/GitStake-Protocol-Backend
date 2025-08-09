# GitStake Quest System API Documentation

## Overview

The GitStake Quest System is an AI-powered coding challenge platform that creates weekly quests for developers based on their skill levels. The system leverages Pollinations.ai to generate engaging coding challenges and manages the complete quest lifecycle from creation to results.

## Quest Lifecycle

### Weekly Schedule
- **Sunday**: New quests are generated and staking begins
- **Monday-Tuesday**: Staking period (developers can stake to participate)
- **Wednesday-Thursday**: Challenge period (staked developers can submit solutions)
- **Friday**: Quest closes, results are processed
- **Saturday**: Winners are announced and rewards distributed

## Developer Levels

The system supports 8 developer levels, each with unique characteristics:

1. **ROOKIE** 🌱 - Just starting the coding journey (0-20 points)
2. **EXPLORER** 🔍 - Exploring technologies and building foundations (21-35 points)
3. **BUILDER** 🔨 - Building solid projects and gaining momentum (36-50 points)
4. **CRAFTSMAN** ⚡ - Crafting quality code with growing expertise (51-65 points)
5. **ARCHITECT** 🏗️ - Designing complex systems and leading projects (66-80 points)
6. **WIZARD** 🧙‍♂️ - Mastering multiple domains with exceptional skills (81-90 points)
7. **LEGEND** 👑 - Legendary contributor with massive impact (91-95 points)
8. **TITAN** 🚀 - Titan of code - reshaping the development world (96-100 points)

## API Endpoints

### Quest Management

#### Generate Quest
```http
POST /api/quests/generate
Content-Type: application/json

{
  "developerLevel": "BUILDER",
  "challengeType": "algorithm",
  "techStack": ["JavaScript", "Node.js"],
  "theme": "adventure"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questId": "QUEST_BUILDER_W45_2024",
    "title": "Code Builder's Adventure Challenge 🔨",
    "description": "An exciting coding adventure...",
    "developerLevel": "BUILDER",
    "challengeType": "algorithm",
    "techStack": ["JavaScript", "Node.js"],
    "schedule": {
      "stakingStart": "2024-11-10T00:00:00.000Z",
      "stakingEnd": "2024-11-12T23:59:59.000Z",
      "challengeStart": "2024-11-13T00:00:00.000Z",
      "challengeEnd": "2024-11-14T23:59:59.000Z",
      "resultsAnnouncement": "2024-11-16T00:00:00.000Z"
    },
    "status": "created"
  },
  "message": "Quest generated successfully"
}
```

#### Generate Weekly Quests
```http
POST /api/quests/generate-weekly
```

Generates quests for all developer levels for the current week.

#### Get Active Quests
```http
GET /api/quests/active?developerLevel=BUILDER
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "questId": "QUEST_BUILDER_W45_2024",
      "title": "Code Builder's Adventure Challenge 🔨",
      "developerLevel": "BUILDER",
      "status": "staking",
      "schedule": {...},
      "statistics": {
        "totalStaked": 15,
        "totalSubmissions": 0
      }
    }
  ]
}
```

#### Get Quest by ID
```http
GET /api/quests/QUEST_BUILDER_W45_2024?includeSolution=false
```

### Quest Participation

#### Stake for Quest
```http
POST /api/quests/QUEST_BUILDER_W45_2024/stake
Content-Type: application/json

{
  "username": "developer123",
  "email": "developer@example.com",
  "developerLevel": "BUILDER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questId": "QUEST_BUILDER_W45_2024",
    "title": "Code Builder's Adventure Challenge 🔨",
    "stakedAt": "2024-11-10T10:30:00.000Z",
    "totalStaked": 16
  },
  "message": "Successfully staked for quest"
}
```

#### Submit Solution
```http
POST /api/quests/QUEST_BUILDER_W45_2024/submit
Content-Type: application/json

{
  "username": "developer123",
  "email": "developer@example.com",
  "solution": "function solve(input) { /* solution code */ }"
}
```

#### Get Quest Leaderboard
```http
GET /api/quests/QUEST_BUILDER_W45_2024/leaderboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questId": "QUEST_BUILDER_W45_2024",
    "title": "Code Builder's Adventure Challenge 🔨",
    "leaderboard": [
      {
        "rank": 1,
        "username": "developer123",
        "score": 95,
        "submittedAt": "2024-11-13T14:30:00.000Z"
      }
    ],
    "winners": [...],
    "statistics": {...}
  }
}
```

### User Quest History

#### Get User Quest History
```http
GET /api/quests/user/developer123/history?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "questId": "QUEST_BUILDER_W45_2024",
        "title": "Code Builder's Adventure Challenge 🔨",
        "developerLevel": "BUILDER",
        "status": "completed",
        "userParticipation": {
          "staked": true,
          "stakedAt": "2024-11-10T10:30:00.000Z",
          "submitted": true,
          "submittedAt": "2024-11-13T14:30:00.000Z",
          "score": 95,
          "isWinner": true,
          "rank": 1,
          "rewards": {
            "points": 500,
            "badge": "Quest Champion",
            "title": "Challenge Master"
          }
        }
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25
    }
  }
}
```

### Admin/System Endpoints

#### Update Quest Statuses
```http
PUT /api/quests/update-statuses
```

Updates quest statuses based on their schedules (staking → active → closed → completed).

#### Send Quest Notifications
```http
POST /api/quests/send-notifications
```

Sends scheduled notifications based on quest phases.

#### Auto-Generate Weekly Quests
```http
POST /api/quests/auto-generate-weekly
```

Automatically generates quests for all levels (used by cron job).

#### Process Quest Results
```http
POST /api/quests/QUEST_BUILDER_W45_2024/process-results
```

Processes quest results, determines winners, and calculates scores.

#### Process All Closed Quests
```http
POST /api/quests/process-all-closed
```

Bulk processes all quests in 'closed' status.

## Cron Job Management

### Get Cron Jobs Status
```http
GET /api/cron/status
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "weeklyQuestGeneration",
      "description": "Generate weekly quests every Sunday",
      "running": true
    },
    {
      "name": "statusUpdate",
      "description": "Update quest statuses every hour",
      "running": true
    },
    {
      "name": "notifications",
      "description": "Send scheduled notifications daily at 9 AM",
      "running": true
    },
    {
      "name": "resultsProcessing",
      "description": "Process quest results every Friday",
      "running": true
    }
  ]
}
```

### Start/Stop Cron Jobs
```http
POST /api/cron/start-all
POST /api/cron/stop-all
POST /api/cron/start/weeklyQuestGeneration
POST /api/cron/stop/weeklyQuestGeneration
```

### Manually Trigger Cron Job
```http
POST /api/cron/trigger/weeklyQuestGeneration
```

## Quest Data Structure

### Quest Model
```javascript
{
  questId: "QUEST_BUILDER_W45_2024",
  title: "Code Builder's Adventure Challenge 🔨",
  description: "An engaging story with learning objectives...",
  developerLevel: "BUILDER",
  challengeType: "algorithm",
  techStack: ["JavaScript", "Node.js"],
  theme: "adventure",
  duration: "2-3 hours",
  difficulty: "Medium",
  
  problemStatement: {
    description: "Detailed problem description...",
    examples: [
      {
        input: "example input",
        output: "expected output",
        explanation: "why this output"
      }
    ],
    constraints: ["constraint 1", "constraint 2"],
    edgeCases: ["edge case 1", "edge case 2"]
  },
  
  starterCode: {
    language: "JavaScript",
    code: "function solve(input) {\n  // Your code here\n}",
    template: "function solve(input)"
  },
  
  solution: {
    code: "complete solution code",
    explanation: "solution explanation",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)"
  },
  
  evaluationCriteria: {
    correctness: { weight: 40, maxScore: 50 },
    efficiency: { weight: 30, maxScore: 50 },
    codeQuality: { weight: 20, maxScore: 50 },
    creativity: { weight: 10, maxScore: 50 }
  },
  
  learningObjectives: ["objective 1", "objective 2"],
  
  achievements: [
    {
      name: "First Solver",
      description: "First to submit correct solution",
      condition: "Submit correct solution first",
      points: 50
    }
  ],
  
  rewards: {
    winner: {
      points: 500,
      badge: "Quest Champion",
      title: "Challenge Master"
    },
    participation: {
      points: 100,
      badge: "Participant"
    }
  },
  
  schedule: {
    createdAt: "2024-11-09T00:00:00.000Z",
    stakingStart: "2024-11-10T00:00:00.000Z",
    stakingEnd: "2024-11-12T23:59:59.000Z",
    challengeStart: "2024-11-13T00:00:00.000Z",
    challengeEnd: "2024-11-14T23:59:59.000Z",
    resultsAnnouncement: "2024-11-16T00:00:00.000Z",
    weekNumber: 45,
    year: 2024
  },
  
  status: "staking", // created, staking, active, closed, completed
  
  participants: {
    staked: [
      {
        username: "developer123",
        email: "developer@example.com",
        stakedAt: "2024-11-10T10:30:00.000Z",
        developerLevel: "BUILDER"
      }
    ],
    submitted: [
      {
        username: "developer123",
        email: "developer@example.com",
        submittedAt: "2024-11-13T14:30:00.000Z",
        solution: "solution code",
        score: 95,
        feedback: "Excellent solution!"
      }
    ]
  },
  
  winners: [
    {
      rank: 1,
      username: "developer123",
      email: "developer@example.com",
      score: 95,
      solution: "winning solution",
      feedback: "Outstanding work!",
      rewards: {
        points: 500,
        badge: "Quest Champion",
        title: "Challenge Master"
      }
    }
  ],
  
  statistics: {
    totalStaked: 25,
    totalSubmissions: 18,
    averageScore: 78.5,
    completionRate: 72
  },
  
  aiGenerated: {
    prompt: "AI generation prompt used",
    generatedAt: "2024-11-09T00:00:00.000Z",
    model: "openai-fast",
    version: "1.0"
  }
}
```

## Email Notifications

The system automatically sends three types of emails:

1. **Staking Notification** - When a user stakes for a quest
2. **Challenge Start** - When the challenge period begins (Wednesday)
3. **Results Announcement** - When winners are announced (Saturday)

## Environment Variables

```env
POLLINATIONS_API_URL=https://text.pollinations.ai/
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
AUTO_START_CRON=true
```

## Cron Schedule

- **Sunday 00:00 UTC**: Generate weekly quests
- **Every hour**: Update quest statuses
- **Daily 09:00 UTC**: Send scheduled notifications
- **Friday 01:00 UTC**: Process closed quest results

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

## Rate Limiting

- AI quest generation includes 2-second delays between requests
- Email sending is throttled to prevent spam
- Cron jobs include error handling and retry logic

## Testing

Use the provided Postman collection `GitStake-API.postman_collection.json` for testing all endpoints.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

4. The cron jobs will auto-start in production or when `AUTO_START_CRON=true`

## Manual Testing

You can manually trigger quest generation and processing:

```bash
# Generate weekly quests
curl -X POST http://localhost:3000/api/cron/trigger/weeklyQuestGeneration

# Update quest statuses
curl -X POST http://localhost:3000/api/cron/trigger/statusUpdate

# Send notifications
curl -X POST http://localhost:3000/api/cron/trigger/notifications

# Process results
curl -X POST http://localhost:3000/api/cron/trigger/resultsProcessing
```