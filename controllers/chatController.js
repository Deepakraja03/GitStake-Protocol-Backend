const ChatService = require('../services/chatService');

const chatService = new ChatService();

const chatController = {
  // Ask the GitStake AI Assistant
  askAssistant: async (req, res, next) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      const response = await chatService.getChatResponse(message, context);
      
      res.status(200).json({
        success: true,
        data: {
          response,
          timestamp: new Date().toISOString()
        },
        message: 'Chat response generated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get assistant health status
  getAssistantHealth: async (req, res, next) => {
    try {
      const health = await chatService.getHealthStatus();
      
      res.status(200).json({
        success: true,
        data: health,
        message: 'Assistant health status retrieved'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = chatController;