const mongoose = require('mongoose');

const GitHubUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  githubId: {
    type: Number,
    required: true,
    unique: true,
    default: function() {
      return Date.now(); // Fallback if not provided
    }
  },
  profile: {
    name: String,
    bio: String,
    location: String,
    company: String,
    blog: String,
    email: String,
    avatarUrl: String,
    publicRepos: Number,
    publicGists: Number,
    followers: Number,
    following: Number,
    createdAt: Date,
    updatedAt: Date
  },
  analytics: {
    totalCommits: { type: Number, default: 0 },
    totalPRs: { type: Number, default: 0 },
    totalIssues: { type: Number, default: 0 },
    totalMerges: { type: Number, default: 0 },
    emptyCommits: { type: Number, default: 0 },
    programmingLanguages: [{
      language: String,
      count: Number,
      percentage: Number
    }],
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 }
    },
    repoCount: { type: Number, default: 0 },
    proficiencyScore: { type: Number, default: 0 },
    lastAnalyzed: { type: Date, default: Date.now }
  },
  repositories: [{
    name: String,
    fullName: String,
    description: String,
    language: String,
    stars: Number,
    forks: Number,
    size: Number,
    createdAt: Date,
    updatedAt: Date,
    pushedAt: Date,
    commits: Number,
    prs: Number,
    issues: Number
  }],
  aiInsights: {
    profileSummary: String,
    strengths: [String],
    recommendations: [String],
    skillLevel: String,
    generatedAt: Date
  },
  developerLevel: {
    level: String,
    name: String,
    emoji: String,
    minScore: Number,
    maxScore: Number,
    description: String,
    currentScore: Number
  }
}, {
  timestamps: true
});

// Index for better query performance
GitHubUserSchema.index({ username: 1, 'analytics.lastAnalyzed': -1 });

module.exports = mongoose.model('GitHubUser', GitHubUserSchema);