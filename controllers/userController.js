const GitHubUser = require('../models/GitHubUser');
const GitHubService = require('../services/githubService');
const AIService = require('../services/aiService');
const { getDeveloperLevel } = require('../models/DeveloperLevel');
const sendEmail = require('../services/emailService');
const { registrationEmailTemplate, onboardingEmailTemplate, levelUpEmailTemplate } = require('../templates/emailTemplates');

const githubService = new GitHubService();
const aiService = new AIService();

const userController = {
  // Get all GitHub users from database
  getAllUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

      const users = await GitHubUser.find()
        .select('-repositories') // Exclude repositories for list view
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await GitHubUser.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        },
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get GitHub user by username
  getUserByUsername: async (req, res, next) => {
    try {
      const { username } = req.params;

      const user = await GitHubUser.findOne({ username });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Analyze and create/update GitHub user
  analyzeUser: async (req, res, next) => {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'GitHub username is required'
        });
      }

      console.log(`Starting analysis for user: ${username}`);

      // Analyze user with GitHub API
      const analysisData = await githubService.analyzeUserActivity(username);

      // Debug: Check if profile.id exists
      console.log('Profile ID:', analysisData.profile?.id);

      // Ensure githubId is available
      if (!analysisData.profile?.id) {
        console.warn('GitHub profile ID is missing, using fallback');
      }

      // Generate AI insights
      const aiInsights = await aiService.generateInsights({
        username,
        ...analysisData
      });

      // Get developer level
      const developerLevel = getDeveloperLevel(analysisData.analytics);
      console.log('Developer Level:', developerLevel);

      // Check if user already exists
      let user = await GitHubUser.findOne({ username });

      if (user) {
        // Check if level changed
        const oldDeveloperLevel = user.developerLevel;
        const levelChanged = oldDeveloperLevel?.level !== developerLevel.level;

        // Update existing user
        user.githubId = analysisData.profile.id || user.githubId || Date.now();
        user.profile = analysisData.profile;
        user.analytics = analysisData.analytics;
        user.repositories = analysisData.repositories;
        user.aiInsights = aiInsights;
        user.developerLevel = developerLevel;

        await user.save();

        // Send level up email if level changed
        if (levelChanged && user.profile.email) {
          try {
            await sendEmail(
              user.profile.email,
              `🎉 Level Up! You're now a ${developerLevel.name}!`,
              levelUpEmailTemplate(user.profile.name || username, oldDeveloperLevel, developerLevel)
            );
          } catch (emailError) {
            console.error('Failed to send level up email:', emailError.message);
          }
        }

        res.status(200).json({
          success: true,
          data: user,
          message: 'User analysis updated successfully',
          levelChanged,
          newLevel: levelChanged ? developerLevel : null
        });
      } else {
        // Create new user
        const newUser = new GitHubUser({
          username,
          githubId: analysisData.profile.id || Date.now(),
          profile: analysisData.profile,
          analytics: analysisData.analytics,
          repositories: analysisData.repositories,
          aiInsights,
          developerLevel
        });

        await newUser.save();

        // Send onboarding email if email is available
        if (newUser.profile.email) {
          try {
            await sendEmail(
              newUser.profile.email,
              '🎯 Profile Analysis Complete - Welcome to GitStake!',
              onboardingEmailTemplate(newUser.profile.name || username, username)
            );
          } catch (emailError) {
            console.error('Failed to send onboarding email:', emailError.message);
          }
        }

        res.status(201).json({
          success: true,
          data: newUser,
          message: 'User analyzed and created successfully',
          isNewUser: true,
          developerLevel
        });
      }
    } catch (error) {
      console.error('Analysis error:', error.message);
      next(error);
    }
  },

  // Update user analytics
  updateUserAnalytics: async (req, res, next) => {
    try {
      const { username } = req.params;

      const user = await GitHubUser.findOne({ username });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Re-analyze user
      const analysisData = await githubService.analyzeUserActivity(username);
      const aiInsights = await aiService.generateInsights({
        username,
        ...analysisData
      });

      // Update user data
      user.profile = analysisData.profile;
      user.analytics = analysisData.analytics;
      user.repositories = analysisData.repositories;
      user.aiInsights = aiInsights;

      await user.save();

      res.status(200).json({
        success: true,
        data: user,
        message: 'User analytics updated successfully',
        levelChanged,
        newLevel: levelChanged ? newDeveloperLevel : null
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete user
  deleteUser: async (req, res, next) => {
    try {
      const { username } = req.params;

      const user = await GitHubUser.findOneAndDelete({ username });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user analytics summary
  getUserAnalytics: async (req, res, next) => {
    try {
      const { username } = req.params;

      const user = await GitHubUser.findOne({ username })
        .select('username analytics aiInsights profile.name profile.avatarUrl');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          username: user.username,
          name: user.profile.name,
          avatarUrl: user.profile.avatarUrl,
          analytics: user.analytics,
          insights: user.aiInsights
        },
        message: 'User analytics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get leaderboard
  getLeaderboard: async (req, res, next) => {
    try {
      const { metric = 'proficiencyScore', limit = 10 } = req.query;

      const validMetrics = [
        'analytics.proficiencyScore',
        'analytics.totalCommits',
        'analytics.repoCount',
        'analytics.totalPRs',
        'analytics.streak.longest'
      ];

      const sortField = validMetrics.includes(`analytics.${metric}`) ?
        `analytics.${metric}` : 'analytics.proficiencyScore';

      const users = await GitHubUser.find()
        .select('username profile.name profile.avatarUrl analytics developerLevel')
        .sort({ [sortField]: -1 })
        .limit(parseInt(limit))
        .exec();

      res.status(200).json({
        success: true,
        data: {
          metric,
          users: users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            name: user.profile.name,
            avatarUrl: user.profile.avatarUrl,
            developerLevel: user.developerLevel,
            value: sortField.split('.').reduce((obj, key) => obj[key], user)
          }))
        },
        message: 'Leaderboard retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;