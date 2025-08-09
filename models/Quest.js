const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  questId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  developerLevel: {
    type: String,
    required: true,
    enum: ['ROOKIE', 'EXPLORER', 'BUILDER', 'CRAFTSMAN', 'ARCHITECT', 'WIZARD', 'LEGEND', 'TITAN']
  },
  challengeType: {
    type: String,
    required: true,
    enum: ['algorithm', 'data-structure', 'system-design', 'debugging', 'optimization', 'full-stack', 'api-design']
  },
  techStack: [{
    type: String,
    required: true
  }],
  theme: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard', 'Expert', 'Legendary']
  },
  problemStatement: {
    description: String,
    examples: [{
      input: String,
      output: String,
      explanation: String
    }],
    constraints: [String],
    edgeCases: [String]
  },
  starterCode: {
    language: String,
    code: String,
    template: String
  },
  solution: {
    code: String,
    explanation: String,
    timeComplexity: String,
    spaceComplexity: String
  },
  evaluationCriteria: {
    correctness: { weight: Number, maxScore: Number },
    efficiency: { weight: Number, maxScore: Number },
    codeQuality: { weight: Number, maxScore: Number },
    creativity: { weight: Number, maxScore: Number }
  },
  learningObjectives: [String],
  achievements: [{
    name: String,
    description: String,
    condition: String,
    points: Number
  }],
  rewards: {
    winner: {
      points: Number,
      badge: String,
      title: String,
      cryptoAmount: { type: Number, default: 0 }
    },
    participation: {
      points: Number,
      badge: String,
      cryptoAmount: { type: Number, default: 0 }
    }
  },
  schedule: {
    createdAt: { type: Date, default: Date.now },
    stakingStart: Date,
    stakingEnd: Date,
    challengeStart: Date,
    challengeEnd: Date,
    resultsAnnouncement: Date,
    weekNumber: Number,
    year: Number
  },
  status: {
    type: String,
    enum: ['created', 'staking', 'active', 'closed', 'completed'],
    default: 'created'
  },
  participants: {
    staked: [{
      username: String,
      email: String,
      stakedAt: Date,
      developerLevel: String,
      walletAddress: String
    }],
    submitted: [{
      username: String,
      email: String,
      submittedAt: Date,
      solution: String,
      score: Number,
      feedback: String,
      walletAddress: String
    }]
  },
  winners: [{
    rank: Number,
    username: String,
    email: String,
    score: Number,
    solution: String,
    feedback: String,
    walletAddress: String,
    rewards: {
      points: Number,
      badge: String,
      title: String,
      cryptoAmount: Number
    }
  }],
  statistics: {
    totalStaked: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for better query performance
QuestSchema.index({ developerLevel: 1, status: 1, 'schedule.weekNumber': 1, 'schedule.year': 1 });
QuestSchema.index({ 'schedule.stakingStart': 1, 'schedule.challengeStart': 1 });

module.exports = mongoose.model('Quest', QuestSchema);