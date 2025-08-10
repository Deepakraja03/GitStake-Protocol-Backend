const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const bossBattleController = require('../controllers/bossBattleController');

// Quest Management Routes
router.post('/generate', questController.generateQuest);
router.post('/generate-weekly', questController.generateWeeklyQuests);
router.get('/active', questController.getActiveQuests);
router.get('/:questId', questController.getQuestById);

// Quest Participation Routes
router.post('/:questId/stake', questController.stakeForQuest);
router.post('/:questId/submit', questController.submitSolution);
router.get('/:questId/leaderboard', questController.getQuestLeaderboard);

// User Quest History
router.get('/user/:username/history', questController.getUserQuestHistory);

// Admin/System Routes
router.put('/update-statuses', questController.updateQuestStatuses);
router.post('/send-notifications', questController.sendQuestNotifications);
router.post('/auto-generate-weekly', questController.autoGenerateWeeklyQuests);
router.post('/:questId/process-results', questController.processQuestResults);
router.post('/process-all-closed', questController.processAllClosedQuests);

// Wallet Management Routes
router.put('/update-wallet', questController.updateUserWallet);
router.get('/crypto-rates', questController.getCryptoRewardRates);

// Boss Battle Routes
router.post('/boss-battle/create', bossBattleController.createBossBattle);
router.get('/boss-battle/:battleId', bossBattleController.getBossBattle);
router.post('/boss-battle/:battleId/start', bossBattleController.startBossBattle);
router.post('/boss-battle/:battleId/submit', bossBattleController.submitBossSolution);
router.get('/boss-battle/user/:username/history', bossBattleController.getUserBossBattles);
router.get('/boss-battle/user/:username/perks', bossBattleController.getUserPerks);
router.get('/boss-battle/leaderboard', bossBattleController.getBossLeaderboard);

// Admin Boss Battle Routes
router.post('/boss-battle/admin/cleanup', bossBattleController.cleanupExpiredBattles);

module.exports = router;