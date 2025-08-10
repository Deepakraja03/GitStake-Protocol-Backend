const mongoose = require('mongoose');

const BossBattleSchema = new mongoose.Schema({
  battleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  currentDeveloperLevel: {
    type: String,
    required: true,
    enum: ['ROOKIE', 'EXPLORER', 'BUILDER', 'CRAFTSMAN', 'ARCHITECT', 'WIZARD', 'LEGEND', 'TITAN']
  },
  targetDeveloperLevel: {
    type: String,
    required: true,
    enum: ['EXPLORER', 'BUILDER', 'CRAFTSMAN', 'ARCHITECT', 'WIZARD', 'LEGEND', 'TITAN', 'ULTIMATE']
  },
  challengeType: {
    type: String,
    required: true,
    enum: ['algorithm', 'data-structure', 'system-design', 'debugging', 'optimization', 'full-stack', 'api-design', 'boss-challenge']
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
    enum: ['Hard', 'Expert', 'Legendary', 'Ultimate', 'Boss']
  },
  problemStatement: {
    description: String,
    bossStory: String, // Special story for boss battle
    examples: [{
      input: String,
      output: String,
      explanation: String
    }],
    constraints: [String],
    edgeCases: [String],
    bossRequirements: [String] // Special requirements for boss battle
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
    creativity: { weight: Number, maxScore: Number },
    bossChallenge: { weight: Number, maxScore: Number } // Special boss criteria
  },
  learningObjectives: [String],
  bossPerks: {
    experiencePoints: { type: Number, default: 0 },
    skillBoosts: [{
      skill: String,
      boost: Number
    }],
    badges: [String],
    titles: [String],
    specialAbilities: [String]
  },
  schedule: {
    createdAt: { type: Date, default: Date.now },
    initiatedAt: Date,
    startedAt: Date,
    completedAt: Date,
    expiresAt: Date, // Boss battles have expiration
    timeLimit: { type: Number, default: 72 } // Hours to complete
  },
  status: {
    type: String,
    enum: ['initiated', 'facing', 'won', 'lost', 'expired'],
    default: 'initiated'
  },
  battleData: {
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    hintsUsed: { type: Number, default: 0 },
    maxHints: { type: Number, default: 2 },
    timeSpent: { type: Number, default: 0 }, // Minutes
    solution: String,
    submittedAt: Date,
    score: { type: Number, default: 0 },
    feedback: String,
    bossDefeated: { type: Boolean, default: false },
    evaluation: {
      score: Number,
      feedback: String,
      strengths: [String],
      improvements: [String],
      breakdown: {
        correctness: Number,
        efficiency: Number,
        codeQuality: Number,
        bossChallenge: Number
      },
      testCaseResults: [{
        testCase: Number,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        executionTime: String,
        error: String
      }],
      complexityAnalysis: {
        timeComplexity: String,
        spaceComplexity: String,
        isOptimal: Boolean
      },
      validationResults: {
        isValid: Boolean,
        testsPassed: Number,
        totalTests: Number,
        errors: [String]
      },
      evaluatedAt: Date,
      aiGenerated: { type: Boolean, default: true },
      isValid: { type: Boolean, default: false },
      serviceError: { type: Boolean, default: false },
      emergencyMode: { type: Boolean, default: false },
      emergencyError: { type: Boolean, default: false }
    },
    submissionHistory: [{
      attempt: Number,
      solution: String,
      score: Number,
      feedback: String,
      submittedAt: Date
    }]
  },
  rewards: {
    victory: {
      experiencePoints: Number,
      levelBoost: Number,
      badges: [String],
      titles: [String],
      cryptoReward: { type: Number, default: 0 },
      specialPerks: [String]
    },
    participation: {
      experiencePoints: Number,
      consolationReward: String
    }
  },
  personalizedElements: {
    basedOnStrengths: [String], // User's coding strengths
    basedOnWeaknesses: [String], // Areas to improve
    preferredLanguages: [String],
    codingStyle: String,
    challengePreferences: [String]
  },
  bossCharacteristics: {
    name: String,
    description: String,
    difficulty: String,
    specialPowers: [String],
    weaknesses: [String],
    lore: String
  }
}, {
  timestamps: true
});

// Index for better query performance
BossBattleSchema.index({ username: 1, status: 1, createdAt: -1 });
BossBattleSchema.index({ targetDeveloperLevel: 1, status: 1 });
BossBattleSchema.index({ 'schedule.expiresAt': 1 });

// Method to check if battle is expired
BossBattleSchema.methods.isExpired = function () {
  return new Date() > this.schedule.expiresAt;
};

// Method to calculate remaining time
BossBattleSchema.methods.getRemainingTime = function () {
  const now = new Date();
  const expires = this.schedule.expiresAt;
  return expires > now ? Math.ceil((expires - now) / (1000 * 60 * 60)) : 0; // Hours
};

// Static method to generate battle ID
BossBattleSchema.statics.generateBattleId = function (username, targetLevel) {
  const timestamp = Date.now();
  return `BOSS_${username.toUpperCase()}_${targetLevel}_${timestamp}`;
};

module.exports = mongoose.model('BossBattle', BossBattleSchema);