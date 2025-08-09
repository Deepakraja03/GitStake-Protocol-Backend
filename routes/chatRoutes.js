const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chat Assistant Routes
router.post('/ask', chatController.askAssistant);
router.get('/health', chatController.getAssistantHealth);

module.exports = router;