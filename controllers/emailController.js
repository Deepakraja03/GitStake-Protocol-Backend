const sendEmail = require('../services/emailService');
const { 
  registrationEmailTemplate, 
  levelUpEmailTemplate, 
  onboardingEmailTemplate,
  leaderboardEmailTemplate 
} = require('../templates/emailTemplates');

const emailController = {
  // Send registration welcome email
  sendRegistrationEmail: async (req, res, next) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email and name are required'
        });
      }

      const subject = 'Welcome to GitStake - Your Developer Journey Begins! 🚀';
      const html = registrationEmailTemplate(name);
      
      await sendEmail(email, subject, html);
      
      res.status(200).json({
        success: true,
        message: 'Registration email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Send level up achievement email
  sendLevelUpEmail: async (req, res, next) => {
    try {
      const { email, name, oldLevel, newLevel } = req.body;
      
      if (!email || !name || !oldLevel || !newLevel) {
        return res.status(400).json({
          success: false,
          message: 'Email, name, oldLevel, and newLevel are required'
        });
      }

      const subject = `🎉 Level Up! You're now a ${newLevel.name} on GitStake!`;
      const html = levelUpEmailTemplate(name, oldLevel, newLevel);
      
      await sendEmail(email, subject, html);
      
      res.status(200).json({
        success: true,
        message: 'Level up email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Send onboarding completion email
  sendOnboardingEmail: async (req, res, next) => {
    try {
      const { email, name, githubUsername } = req.body;
      
      if (!email || !name || !githubUsername) {
        return res.status(400).json({
          success: false,
          message: 'Email, name, and githubUsername are required'
        });
      }

      const subject = '🎯 Profile Analysis Complete - Welcome to GitStake!';
      const html = onboardingEmailTemplate(name, githubUsername);
      
      await sendEmail(email, subject, html);
      
      res.status(200).json({
        success: true,
        message: 'Onboarding email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Send leaderboard achievement email
  sendLeaderboardEmail: async (req, res, next) => {
    try {
      const { email, name, rank, metric } = req.body;
      
      if (!email || !name || !rank || !metric) {
        return res.status(400).json({
          success: false,
          message: 'Email, name, rank, and metric are required'
        });
      }

      const subject = `🏆 Leaderboard Achievement - You're Ranked #${rank}!`;
      const html = leaderboardEmailTemplate(name, rank, metric);
      
      await sendEmail(email, subject, html);
      
      res.status(200).json({
        success: true,
        message: 'Leaderboard email sent successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Preview email templates (for testing)
  previewRegistrationEmail: async (req, res, next) => {
    try {
      const { name = 'John Developer' } = req.query;
      const html = registrationEmailTemplate(name);
      
      res.send(html);
    } catch (error) {
      next(error);
    }
  },

  previewLevelUpEmail: async (req, res, next) => {
    try {
      const { name = 'Jane Coder' } = req.query;
      const oldLevel = { name: 'Code Builder', emoji: '🔨' };
      const newLevel = { name: 'Code Craftsman', emoji: '⚡', description: 'Crafting quality code with growing expertise' };
      
      const html = levelUpEmailTemplate(name, oldLevel, newLevel);
      
      res.send(html);
    } catch (error) {
      next(error);
    }
  },

  previewOnboardingEmail: async (req, res, next) => {
    try {
      const { name = 'Alex Developer', githubUsername = 'alexdev' } = req.query;
      const html = onboardingEmailTemplate(name, githubUsername);
      
      res.send(html);
    } catch (error) {
      next(error);
    }
  },

  previewLeaderboardEmail: async (req, res, next) => {
    try {
      const { name = 'Sarah Coder', rank = '5', metric = 'Proficiency Score' } = req.query;
      const html = leaderboardEmailTemplate(name, rank, metric);
      
      res.send(html);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = emailController;