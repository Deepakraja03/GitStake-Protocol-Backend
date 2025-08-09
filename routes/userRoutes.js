const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validateGitHubUser = require('../middleware/validateGitHubUser');

// GET /api/users - Get all GitHub users
router.get('/', userController.getAllUsers);

// GET /api/users/leaderboard - Get leaderboard
router.get('/leaderboard', userController.getLeaderboard);

// GET /api/users/:username - Get user by username
router.get('/:username', userController.getUserByUsername);

// GET /api/users/:username/analytics - Get user analytics summary
router.get('/:username/analytics', userController.getUserAnalytics);

// POST /api/users/analyze - Analyze GitHub user
router.post('/analyze', validateGitHubUser, userController.analyzeUser);

// PUT /api/users/:username/update - Update user analytics
router.put('/:username/update', userController.updateUserAnalytics);

// DELETE /api/users/:username - Delete user
router.delete('/:username', userController.deleteUser);

module.exports = router;