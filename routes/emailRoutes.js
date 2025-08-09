const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Email sending routes
router.post('/send-registration', emailController.sendRegistrationEmail);
router.post('/send-level-up', emailController.sendLevelUpEmail);
router.post('/send-onboarding', emailController.sendOnboardingEmail);
router.post('/send-leaderboard', emailController.sendLeaderboardEmail);

// Email template preview routes (for testing)
router.get('/preview/registration', emailController.previewRegistrationEmail);
router.get('/preview/level-up', emailController.previewLevelUpEmail);
router.get('/preview/onboarding', emailController.previewOnboardingEmail);
router.get('/preview/leaderboard', emailController.previewLeaderboardEmail);

module.exports = router;