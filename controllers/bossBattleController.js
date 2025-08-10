const bossBattleService = require('../services/bossBattleService');
const BossBattle = require('../models/BossBattle');
const GitHubUser = require('../models/GitHubUser');

class BossBattleController {
  /**
   * Create a new boss battle for a user
   * POST /api/quests/boss-battle/create
   */
  async createBossBattle(req, res) {
    try {
      const { username, email } = req.body;

      if (!username || !email) {
        return res.status(400).json({
          success: false,
          message: 'Username and email are required'
        });
      }

      const bossBattle = await bossBattleService.createBossBattle(username, email);

      res.status(201).json({
        success: true,
        message: 'Boss battle created successfully!',
        data: {
          battleId: bossBattle.battleId,
          title: bossBattle.title,
          description: bossBattle.description,
          currentLevel: bossBattle.currentDeveloperLevel,
          targetLevel: bossBattle.targetDeveloperLevel,
          theme: bossBattle.theme,
          difficulty: bossBattle.difficulty,
          timeLimit: bossBattle.schedule.timeLimit,
          expiresAt: bossBattle.schedule.expiresAt,
          status: bossBattle.status,
          bossCharacteristics: bossBattle.bossCharacteristics,
          rewards: bossBattle.rewards
        }
      });

    } catch (error) {
      console.error('Create Boss Battle Error:', error.message);
      
      if (error.message.includes('already has an active boss battle')) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active boss battle. Complete it first!'
        });
      }

      if (error.message.includes('already at maximum level')) {
        return res.status(400).json({
          success: false,
          message: 'You are already at the maximum developer level!'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create boss battle',
        error: error.message
      });
    }
  }

  /**
   * Get boss battle details
   * GET /api/quests/boss-battle/:battleId
   */
  async getBossBattle(req, res) {
    try {
      const { battleId } = req.params;
      const { username } = req.query;

      const battle = await BossBattle.findOne({ battleId });

      if (!battle) {
        return res.status(404).json({
          success: false,
          message: 'Boss battle not found'
        });
      }

      // Check if user is authorized to view this battle
      if (username && battle.username !== username) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this boss battle'
        });
      }

      // Check if battle is expired
      if (battle.isExpired() && battle.status === 'facing') {
        battle.status = 'expired';
        await battle.save();
      }

      res.json({
        success: true,
        data: {
          battleId: battle.battleId,
          title: battle.title,
          description: battle.description,
          currentLevel: battle.currentDeveloperLevel,
          targetLevel: battle.targetDeveloperLevel,
          theme: battle.theme,
          difficulty: battle.difficulty,
          problemStatement: battle.problemStatement,
          starterCode: battle.starterCode,
          evaluationCriteria: battle.evaluationCriteria,
          learningObjectives: battle.learningObjectives,
          schedule: battle.schedule,
          status: battle.status,
          battleData: {
            attempts: battle.battleData.attempts,
            maxAttempts: battle.battleData.maxAttempts,
            hintsUsed: battle.battleData.hintsUsed,
            maxHints: battle.battleData.maxHints,
            timeSpent: battle.battleData.timeSpent,
            remainingTime: battle.getRemainingTime()
          },
          bossCharacteristics: battle.bossCharacteristics,
          rewards: battle.rewards,
          personalizedElements: battle.personalizedElements
        }
      });

    } catch (error) {
      console.error('Get Boss Battle Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get boss battle details',
        error: error.message
      });
    }
  }

  /**
   * Start a boss battle
   * POST /api/quests/boss-battle/:battleId/start
   */
  async startBossBattle(req, res) {
    try {
      const { battleId } = req.params;
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required'
        });
      }

      const battle = await bossBattleService.startBossBattle(battleId, username);

      res.json({
        success: true,
        message: 'Boss battle started! Good luck, warrior!',
        data: {
          battleId: battle.battleId,
          status: battle.status,
          startedAt: battle.schedule.startedAt,
          expiresAt: battle.schedule.expiresAt,
          remainingTime: battle.getRemainingTime(),
          problemStatement: battle.problemStatement,
          starterCode: battle.starterCode
        }
      });

    } catch (error) {
      console.error('Start Boss Battle Error:', error.message);
      
      if (error.message.includes('expired')) {
        return res.status(410).json({
          success: false,
          message: 'Boss battle has expired'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Submit solution for boss battle
   * POST /api/quests/boss-battle/:battleId/submit
   */
  async submitBossSolution(req, res) {
    try {
      const { battleId } = req.params;
      const { username, solution } = req.body;

      if (!username || !solution) {
        return res.status(400).json({
          success: false,
          message: 'Username and solution are required'
        });
      }

      const battle = await bossBattleService.submitBossSolution(battleId, username, solution);

      const isVictory = battle.status === 'won';
      const message = isVictory 
        ? '🎉 BOSS DEFEATED! You are victorious!' 
        : battle.status === 'lost' 
          ? '💀 Boss battle lost. The boss was too powerful this time.' 
          : `Solution submitted! Attempt ${battle.battleData.attempts}/${battle.battleData.maxAttempts}`;

      res.json({
        success: true,
        message,
        data: {
          battleId: battle.battleId,
          status: battle.status,
          score: battle.battleData.score,
          attempts: battle.battleData.attempts,
          maxAttempts: battle.battleData.maxAttempts,
          bossDefeated: battle.battleData.bossDefeated,
          feedback: battle.battleData.feedback,
          evaluation: battle.battleData.evaluation,
          rewards: isVictory ? battle.rewards.victory : battle.rewards.participation,
          completedAt: battle.schedule.completedAt,
          aiEvaluated: battle.battleData.evaluation && battle.battleData.evaluation.aiGenerated,
          solutionValid: battle.battleData.evaluation && battle.battleData.evaluation.isValid,
          testResults: battle.battleData.evaluation && battle.battleData.evaluation.testCaseResults,
          validationSummary: battle.battleData.evaluation && battle.battleData.evaluation.validationResults,
          emergencyMode: battle.battleData.evaluation && battle.battleData.evaluation.emergencyMode,
          serviceError: battle.battleData.evaluation && battle.battleData.evaluation.serviceError
        }
      });

    } catch (error) {
      console.error('Submit Boss Solution Error:', error.message);
      
      if (error.message.includes('expired')) {
        return res.status(410).json({
          success: false,
          message: 'Boss battle has expired'
        });
      }

      if (error.message.includes('Maximum attempts exceeded')) {
        return res.status(400).json({
          success: false,
          message: 'You have used all your attempts. The boss remains undefeated.'
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user's boss battle history
   * GET /api/quests/boss-battle/user/:username/history
   */
  async getUserBossBattles(req, res) {
    try {
      const { username } = req.params;
      const { status, limit = 10 } = req.query;

      const query = { username };
      if (status) {
        query.status = status;
      }

      const battles = await BossBattle.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('-solution -personalizedElements');

      const summary = {
        total: battles.length,
        won: battles.filter(b => b.status === 'won').length,
        lost: battles.filter(b => b.status === 'lost').length,
        active: battles.filter(b => ['initiated', 'facing'].includes(b.status)).length,
        expired: battles.filter(b => b.status === 'expired').length
      };

      res.json({
        success: true,
        data: {
          battles,
          summary
        }
      });

    } catch (error) {
      console.error('Get User Boss Battles Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get boss battle history',
        error: error.message
      });
    }
  }

  /**
   * Get user's perks and achievements
   * GET /api/quests/boss-battle/user/:username/perks
   */
  async getUserPerks(req, res) {
    try {
      const { username } = req.params;

      const user = await GitHubUser.findOne({ username }).select('perks');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          perks: user.perks || {
            totalExperiencePoints: 0,
            bossBattlesWon: 0,
            bossBattlesLost: 0,
            badges: [],
            titles: [],
            achievements: []
          }
        }
      });

    } catch (error) {
      console.error('Get User Perks Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get user perks',
        error: error.message
      });
    }
  }

  /**
   * Get boss battle leaderboard
   * GET /api/quests/boss-battle/leaderboard
   */
  async getBossLeaderboard(req, res) {
    try {
      const { limit = 20, timeframe = 'all' } = req.query;

      let dateFilter = {};
      if (timeframe === 'week') {
        dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
      } else if (timeframe === 'month') {
        dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
      }

      // Aggregate boss battle statistics
      const leaderboard = await BossBattle.aggregate([
        { $match: { status: 'won', ...dateFilter } },
        {
          $group: {
            _id: '$username',
            battlesWon: { $sum: 1 },
            totalScore: { $sum: '$battleData.score' },
            averageScore: { $avg: '$battleData.score' },
            lastVictory: { $max: '$schedule.completedAt' },
            levelsUnlocked: { $addToSet: '$targetDeveloperLevel' }
          }
        },
        {
          $project: {
            username: '$_id',
            battlesWon: 1,
            totalScore: 1,
            averageScore: { $round: ['$averageScore', 2] },
            lastVictory: 1,
            levelsUnlocked: { $size: '$levelsUnlocked' }
          }
        },
        { $sort: { battlesWon: -1, totalScore: -1 } },
        { $limit: parseInt(limit) }
      ]);

      res.json({
        success: true,
        data: {
          leaderboard,
          timeframe,
          generatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Get Boss Leaderboard Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get boss leaderboard',
        error: error.message
      });
    }
  }

  /**
   * Admin: Cleanup expired boss battles
   * POST /api/quests/boss-battle/admin/cleanup
   */
  async cleanupExpiredBattles(req, res) {
    try {
      await bossBattleService.cleanupExpiredBattles();

      res.json({
        success: true,
        message: 'Expired boss battles cleaned up successfully'
      });

    } catch (error) {
      console.error('Cleanup Expired Battles Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup expired battles',
        error: error.message
      });
    }
  }
}

module.exports = new BossBattleController();