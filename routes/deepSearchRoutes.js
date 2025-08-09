const express = require('express');
const router = express.Router();
const deepSearchController = require('../controllers/deepSearchController');

// Deep Search AI Routes
router.post('/search', deepSearchController.searchAndRespond);
router.post('/development', deepSearchController.searchDevelopmentTopic);
router.post('/language', deepSearchController.searchLanguageInfo);
router.post('/github', deepSearchController.searchGitHubTopic);
router.get('/health', deepSearchController.getHealthStatus);

module.exports = router;