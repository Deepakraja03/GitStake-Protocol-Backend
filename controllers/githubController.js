const GitHubService = require('../services/githubService');
const { getDeveloperLevel } = require('../models/DeveloperLevel');

const githubService = new GitHubService();

const githubController = {
  // Profile Routes
  getProfile: async (req, res, next) => {
    try {
      const { username } = req.params;
      const profile = await githubService.getUserProfile(username);
      
      res.status(200).json({
        success: true,
        data: profile,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getProfileEvents: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { page = 1, per_page = 30 } = req.query;
      
      const events = await githubService.getUserEvents(username, { page, per_page });
      
      res.status(200).json({
        success: true,
        data: events,
        message: 'Profile events retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getFollowers: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { page = 1, per_page = 30 } = req.query;
      
      const followers = await githubService.getUserFollowers(username, { page, per_page });
      
      res.status(200).json({
        success: true,
        data: followers,
        message: 'Followers retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getFollowing: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { page = 1, per_page = 30 } = req.query;
      
      const following = await githubService.getUserFollowing(username, { page, per_page });
      
      res.status(200).json({
        success: true,
        data: following,
        message: 'Following retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Repository Routes
  getUserRepositories: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { type = 'owner', sort = 'updated', per_page = 30, page = 1 } = req.query;
      
      const repos = await githubService.getUserRepositories(username, { type, sort, per_page, page });
      
      res.status(200).json({
        success: true,
        data: repos,
        message: 'Repositories retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getRepository: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const repository = await githubService.getRepository(owner, repo);
      
      res.status(200).json({
        success: true,
        data: repository,
        message: 'Repository retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getRepositoryCommits: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const { since, until, author, page = 1, per_page = 30 } = req.query;
      
      const commits = await githubService.getRepositoryCommits(owner, repo, { 
        since, until, author, page, per_page 
      });
      
      res.status(200).json({
        success: true,
        data: commits,
        message: 'Repository commits retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getRepositoryContributors: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const contributors = await githubService.getRepositoryContributors(owner, repo);
      
      res.status(200).json({
        success: true,
        data: contributors,
        message: 'Repository contributors retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getRepositoryLanguages: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const languages = await githubService.getRepositoryLanguages(owner, repo);
      
      res.status(200).json({
        success: true,
        data: languages,
        message: 'Repository languages retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getRepositoryStats: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const stats = await githubService.getRepositoryStats(owner, repo);
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Repository statistics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Pull Request Routes
  getRepositoryPullRequests: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const { state = 'open', sort = 'created', direction = 'desc', page = 1, per_page = 30 } = req.query;
      
      const prs = await githubService.getRepositoryPullRequests(owner, repo, {
        state, sort, direction, page, per_page
      });
      
      res.status(200).json({
        success: true,
        data: prs,
        message: 'Pull requests retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getPullRequest: async (req, res, next) => {
    try {
      const { owner, repo, pull_number } = req.params;
      const pr = await githubService.getPullRequest(owner, repo, pull_number);
      
      res.status(200).json({
        success: true,
        data: pr,
        message: 'Pull request retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getPullRequestCommits: async (req, res, next) => {
    try {
      const { owner, repo, pull_number } = req.params;
      const commits = await githubService.getPullRequestCommits(owner, repo, pull_number);
      
      res.status(200).json({
        success: true,
        data: commits,
        message: 'Pull request commits retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getPullRequestFiles: async (req, res, next) => {
    try {
      const { owner, repo, pull_number } = req.params;
      const files = await githubService.getPullRequestFiles(owner, repo, pull_number);
      
      res.status(200).json({
        success: true,
        data: files,
        message: 'Pull request files retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Issues Routes
  getRepositoryIssues: async (req, res, next) => {
    try {
      const { owner, repo } = req.params;
      const { state = 'open', sort = 'created', direction = 'desc', page = 1, per_page = 30 } = req.query;
      
      const issues = await githubService.getRepositoryIssues(owner, repo, {
        state, sort, direction, page, per_page
      });
      
      res.status(200).json({
        success: true,
        data: issues,
        message: 'Repository issues retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getIssue: async (req, res, next) => {
    try {
      const { owner, repo, issue_number } = req.params;
      const issue = await githubService.getIssue(owner, repo, issue_number);
      
      res.status(200).json({
        success: true,
        data: issue,
        message: 'Issue retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getIssueComments: async (req, res, next) => {
    try {
      const { owner, repo, issue_number } = req.params;
      const comments = await githubService.getIssueComments(owner, repo, issue_number);
      
      res.status(200).json({
        success: true,
        data: comments,
        message: 'Issue comments retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Advanced Analytics Routes
  getCodeComplexity: async (req, res, next) => {
    try {
      const { username } = req.params;
      const complexity = await githubService.analyzeCodeComplexity(username);
      
      res.status(200).json({
        success: true,
        data: complexity,
        message: 'Code complexity analysis completed'
      });
    } catch (error) {
      next(error);
    }
  },

  getActivityAnalytics: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { timeframe = '1year' } = req.query;
      
      const activity = await githubService.getActivityAnalytics(username, timeframe);
      const developerLevel = getDeveloperLevel(activity.analytics);
      
      res.status(200).json({
        success: true,
        data: {
          ...activity,
          developerLevel
        },
        message: 'Activity analytics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getCollaborationMetrics: async (req, res, next) => {
    try {
      const { username } = req.params;
      const collaboration = await githubService.getCollaborationMetrics(username);
      
      res.status(200).json({
        success: true,
        data: collaboration,
        message: 'Collaboration metrics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getCodeQuality: async (req, res, next) => {
    try {
      const { username } = req.params;
      const quality = await githubService.analyzeCodeQuality(username);
      
      res.status(200).json({
        success: true,
        data: quality,
        message: 'Code quality analysis completed'
      });
    } catch (error) {
      next(error);
    }
  },

  getTrendAnalysis: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { period = '6months' } = req.query;
      
      const trends = await githubService.getTrendAnalysis(username, period);
      
      res.status(200).json({
        success: true,
        data: trends,
        message: 'Trend analysis completed'
      });
    } catch (error) {
      next(error);
    }
  },

  // Search Routes
  searchRepositories: async (req, res, next) => {
    try {
      const { q, sort = 'stars', order = 'desc', page = 1, per_page = 30 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query (q) is required'
        });
      }
      
      const results = await githubService.searchRepositories(q, { sort, order, page, per_page });
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Repository search completed'
      });
    } catch (error) {
      next(error);
    }
  },

  searchUsers: async (req, res, next) => {
    try {
      const { q, sort = 'best-match', order = 'desc', page = 1, per_page = 30 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query (q) is required'
        });
      }
      
      const results = await githubService.searchUsers(q, { sort, order, page, per_page });
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'User search completed'
      });
    } catch (error) {
      next(error);
    }
  },

  searchCode: async (req, res, next) => {
    try {
      const { q, sort = 'best-match', order = 'desc', page = 1, per_page = 30 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query (q) is required'
        });
      }
      
      const results = await githubService.searchCode(q, { sort, order, page, per_page });
      
      res.status(200).json({
        success: true,
        data: results,
        message: 'Code search completed'
      });
    } catch (error) {
      next(error);
    }
  },

  // Organization Routes
  getOrganization: async (req, res, next) => {
    try {
      const { org } = req.params;
      const organization = await githubService.getOrganization(org);
      
      res.status(200).json({
        success: true,
        data: organization,
        message: 'Organization retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getOrganizationRepos: async (req, res, next) => {
    try {
      const { org } = req.params;
      const { type = 'all', sort = 'updated', page = 1, per_page = 30 } = req.query;
      
      const repos = await githubService.getOrganizationRepos(org, { type, sort, page, per_page });
      
      res.status(200).json({
        success: true,
        data: repos,
        message: 'Organization repositories retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getOrganizationMembers: async (req, res, next) => {
    try {
      const { org } = req.params;
      const { page = 1, per_page = 30 } = req.query;
      
      const members = await githubService.getOrganizationMembers(org, { page, per_page });
      
      res.status(200).json({
        success: true,
        data: members,
        message: 'Organization members retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Gist Routes
  getUserGists: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { page = 1, per_page = 30 } = req.query;
      
      const gists = await githubService.getUserGists(username, { page, per_page });
      
      res.status(200).json({
        success: true,
        data: gists,
        message: 'User gists retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  getGist: async (req, res, next) => {
    try {
      const { gist_id } = req.params;
      const gist = await githubService.getGist(gist_id);
      
      res.status(200).json({
        success: true,
        data: gist,
        message: 'Gist retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Rate Limit Route
  getRateLimit: async (req, res, next) => {
    try {
      const rateLimit = await githubService.getRateLimit();
      
      res.status(200).json({
        success: true,
        data: rateLimit,
        message: 'Rate limit information retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = githubController;