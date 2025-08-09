const DeepSearchAIService = require('../services/deepSearchAIService');

const deepSearchService = new DeepSearchAIService();

const deepSearchController = {
  // General web search with AI response
  searchAndRespond: async (req, res, next) => {
    try {
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const result = await deepSearchService.searchAndRespond(query, context);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Search completed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Search for development topics
  searchDevelopmentTopic: async (req, res, next) => {
    try {
      const { topic, context } = req.body;
      
      if (!topic) {
        return res.status(400).json({
          success: false,
          message: 'Development topic is required'
        });
      }

      const result = await deepSearchService.searchDevelopmentTopic(topic, context);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Development topic search completed'
      });
    } catch (error) {
      next(error);
    }
  },

  // Search for programming language information
  searchLanguageInfo: async (req, res, next) => {
    try {
      const { language, specificTopic, context } = req.body;
      
      if (!language) {
        return res.status(400).json({
          success: false,
          message: 'Programming language is required'
        });
      }

      const result = await deepSearchService.searchLanguageInfo(language, specificTopic, context);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Language information search completed'
      });
    } catch (error) {
      next(error);
    }
  },

  // Search for GitHub and open source topics
  searchGitHubTopic: async (req, res, next) => {
    try {
      const { topic, context } = req.body;
      
      if (!topic) {
        return res.status(400).json({
          success: false,
          message: 'GitHub topic is required'
        });
      }

      const result = await deepSearchService.searchGitHubTopic(topic, context);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'GitHub topic search completed'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get deep search service health
  getHealthStatus: async (req, res, next) => {
    try {
      const health = await deepSearchService.getHealthStatus();
      
      res.status(200).json({
        success: true,
        data: health,
        message: 'Deep search service health retrieved'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = deepSearchController;