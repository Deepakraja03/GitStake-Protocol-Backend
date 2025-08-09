const QuestService = require('../services/questService');
const Quest = require('../models/Quest');
const sendEmail = require('../services/emailService');
const { questStakingTemplate, questChallengeTemplate, questResultsTemplate } = require('../templates/questEmailTemplates');

const questService = new QuestService();

const questController = {
  // Generate a new quest for specific developer level
  generateQuest: async (req, res, next) => {
    try {
      const { developerLevel, challengeType, techStack, theme } = req.body;
      
      if (!developerLevel) {
        return res.status(400).json({
          success: false,
          message: 'Developer level is required'
        });
      }

      const quest = await questService.generateQuest(
        developerLevel,
        challengeType || 'algorithm',
        techStack || ['JavaScript'],
        theme || 'adventure'
      );

      res.status(201).json({
        success: true,
        data: quest,
        message: 'Quest generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Generate weekly quests for all levels
  generateWeeklyQuests: async (req, res, next) => {
    try {
      const quests = await questService.generateWeeklyQuests();

      res.status(201).json({
        success: true,
        data: quests,
        message: `Generated ${quests.length} weekly quests successfully`
      });
    } catch (error) {
      next(error);
    }
  },

  // Get active quests
  getActiveQuests: async (req, res, next) => {
    try {
      const { developerLevel } = req.query;
      const quests = await questService.getActiveQuests(developerLevel);

      res.status(200).json({
        success: true,
        data: quests,
        message: 'Active quests retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get quest by ID
  getQuestById: async (req, res, next) => {
    try {
      const { questId } = req.params;
      const { includeSolution } = req.query;
      
      const quest = await questService.getQuestById(questId, includeSolution === 'true');

      res.status(200).json({
        success: true,
        data: quest,
        message: 'Quest retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Stake user for quest
  stakeForQuest: async (req, res, next) => {
    try {
      const { questId } = req.params;
      const { username, email, developerLevel, walletAddress } = req.body;

      if (!username || !email || !developerLevel) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and developer level are required'
        });
      }

      const quest = await questService.stakeUserForQuest(questId, username, email, developerLevel, walletAddress);

      // Send staking confirmation email
      try {
        await sendEmail(
          email,
          `🎯 Staked for ${quest.title}!`,
          questStakingTemplate(username, quest)
        );
      } catch (emailError) {
        console.error('Failed to send staking email:', emailError.message);
      }

      res.status(200).json({
        success: true,
        data: {
          questId: quest.questId,
          title: quest.title,
          stakedAt: new Date(),
          totalStaked: quest.statistics.totalStaked
        },
        message: 'Successfully staked for quest'
      });
    } catch (error) {
      next(error);
    }
  },

  // Submit solution for quest
  submitSolution: async (req, res, next) => {
    try {
      const { questId } = req.params;
      const { username, email, solution } = req.body;

      if (!username || !email || !solution) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and solution are required'
        });
      }

      const quest = await questService.submitSolution(questId, username, email, solution);

      res.status(200).json({
        success: true,
        data: {
          questId: quest.questId,
          title: quest.title,
          submittedAt: new Date(),
          totalSubmissions: quest.statistics.totalSubmissions
        },
        message: 'Solution submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get quest leaderboard
  getQuestLeaderboard: async (req, res, next) => {
    try {
      const { questId } = req.params;
      
      const quest = await Quest.findOne({ questId })
        .select('questId title winners participants.submitted statistics');

      if (!quest) {
        return res.status(404).json({
          success: false,
          message: 'Quest not found'
        });
      }

      // Sort submissions by score
      const leaderboard = quest.participants.submitted
        .sort((a, b) => b.score - a.score)
        .map((submission, index) => ({
          rank: index + 1,
          username: submission.username,
          score: submission.score,
          submittedAt: submission.submittedAt
        }));

      res.status(200).json({
        success: true,
        data: {
          questId: quest.questId,
          title: quest.title,
          leaderboard,
          winners: quest.winners,
          statistics: quest.statistics
        },
        message: 'Quest leaderboard retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's quest history
  getUserQuestHistory: async (req, res, next) => {
    try {
      const { username } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const quests = await Quest.find({
        $or: [
          { 'participants.staked.username': username },
          { 'participants.submitted.username': username },
          { 'winners.username': username }
        ]
      })
      .select('questId title developerLevel status schedule statistics winners')
      .sort({ 'schedule.stakingStart': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await Quest.countDocuments({
        $or: [
          { 'participants.staked.username': username },
          { 'participants.submitted.username': username },
          { 'winners.username': username }
        ]
      });

      // Add user-specific data to each quest
      const questHistory = quests.map(quest => {
        const staked = quest.participants?.staked?.find(p => p.username === username);
        const submitted = quest.participants?.submitted?.find(p => p.username === username);
        const winner = quest.winners?.find(w => w.username === username);

        return {
          questId: quest.questId,
          title: quest.title,
          developerLevel: quest.developerLevel,
          status: quest.status,
          schedule: quest.schedule,
          userParticipation: {
            staked: !!staked,
            stakedAt: staked?.stakedAt,
            submitted: !!submitted,
            submittedAt: submitted?.submittedAt,
            score: submitted?.score,
            isWinner: !!winner,
            rank: winner?.rank,
            rewards: winner?.rewards
          },
          statistics: quest.statistics
        };
      });

      res.status(200).json({
        success: true,
        data: {
          quests: questHistory,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        },
        message: 'User quest history retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Update quest statuses (admin/cron job)
  updateQuestStatuses: async (req, res, next) => {
    try {
      await questService.updateQuestStatuses();

      res.status(200).json({
        success: true,
        message: 'Quest statuses updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Send quest notifications (admin/cron job)
  sendQuestNotifications: async (req, res, next) => {
    try {
      const result = await questService.sendScheduledNotifications();

      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheduled notifications sent successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Auto-generate weekly quests (cron job endpoint)
  autoGenerateWeeklyQuests: async (req, res, next) => {
    try {
      const quests = await questService.autoGenerateWeeklyQuests();

      res.status(201).json({
        success: true,
        data: {
          questsGenerated: quests.length,
          quests: quests.map(q => ({
            questId: q.questId,
            title: q.title,
            developerLevel: q.developerLevel,
            status: q.status
          }))
        },
        message: 'Weekly quests auto-generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Process quest results (admin/cron job)
  processQuestResults: async (req, res, next) => {
    try {
      const { questId } = req.params;
      
      if (!questId) {
        return res.status(400).json({
          success: false,
          message: 'Quest ID is required'
        });
      }

      const quest = await questService.processQuestResults(questId);

      res.status(200).json({
        success: true,
        data: {
          questId: quest.questId,
          title: quest.title,
          winners: quest.winners,
          statistics: quest.statistics
        },
        message: 'Quest results processed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Bulk process all closed quests
  processAllClosedQuests: async (req, res, next) => {
    try {
      const closedQuests = await Quest.find({ status: 'closed' });
      const processedQuests = [];

      for (const quest of closedQuests) {
        try {
          const processedQuest = await questService.processQuestResults(quest.questId);
          processedQuests.push(processedQuest);
        } catch (error) {
          console.error(`Failed to process quest ${quest.questId}:`, error.message);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          totalProcessed: processedQuests.length,
          quests: processedQuests.map(q => ({
            questId: q.questId,
            title: q.title,
            winnersCount: q.winners.length
          }))
        },
        message: `Processed ${processedQuests.length} closed quests`
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user wallet address
  updateUserWallet: async (req, res, next) => {
    try {
      const { username, walletAddress } = req.body;

      if (!username || !walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Username and wallet address are required'
        });
      }

      const user = await questService.updateUserWallet(username, walletAddress);

      res.status(200).json({
        success: true,
        data: {
          username: user.username,
          walletAddress: user.walletAddress
        },
        message: 'Wallet address updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get crypto reward rates
  getCryptoRewardRates: async (req, res, next) => {
    try {
      const rates = questService.getCryptoRewardRates();

      res.status(200).json({
        success: true,
        data: rates,
        message: 'Crypto reward rates retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = questController;