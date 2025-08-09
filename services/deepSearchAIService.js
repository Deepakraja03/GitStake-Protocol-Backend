const axios = require('axios');

class DeepSearchAIService {
  constructor() {
    this.webSearchApiUrl = 'https://web-deep-search.vercel.app/query/';
    this.pollinationsApiUrl = process.env.POLLINATIONS_API_URL;
  }

  /**
   * Performs web search and generates AI response
   * @param {string} query - The search query
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Search results and AI response
   */
  async searchAndRespond(query, context = {}) {
    try {
      console.log(`🔍 Performing deep search for: ${query}`);
      
      // Step 1: Get web search results
      const searchResults = await this.performWebSearch(query);
      
      // Step 2: Generate human-friendly response using search results
      const aiResponse = await this.generateHumanResponse(query, searchResults, context);
      
      return {
        success: true,
        query,
        searchResults,
        response: aiResponse,
        sources: searchResults.sources_used || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Deep Search AI Error:', error.message);
      return this.getFallbackResponse(query, context);
    }
  }

  /**
   * Performs web search using the deep search API
   * @param {string} query - Search query
   * @returns {Promise<object>} - Search results
   */
  async performWebSearch(query) {
    try {
      const response = await axios.post(this.webSearchApiUrl, {
        query: query
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      return {
        answer: response.data.answer || 'No search results found',
        sources_used: response.data.sources_used || []
      };
    } catch (error) {
      console.error('Web search failed:', error.message);
      throw new Error(`Web search failed: ${error.message}`);
    }
  }

  /**
   * Generates human-friendly response using search results and AI
   * @param {string} originalQuery - Original user query
   * @param {object} searchResults - Web search results
   * @param {object} context - Additional context
   * @returns {Promise<string>} - Human-friendly AI response
   */
  async generateHumanResponse(originalQuery, searchResults, context = {}) {
    const contextInfo = context.username ? `User: ${context.username}` : '';
    
    const prompt = `
You're a helpful assistant for GitStake, a platform that analyzes GitHub profiles and rewards developers. I just searched the web for information and got some results. Now I need you to give a friendly, human response.

Original question: "${originalQuery}"

Web search results:
${searchResults.answer}

Sources found:
${searchResults.sources_used.map(source => `- ${source}`).join('\n')}

Context: ${contextInfo}

Please respond in a natural, conversational way. Here's how to talk:

✅ DO:
- Sound like a friendly human who knows about development and GitHub
- Use casual language and contractions (like "you're", "it's", "that's")
- Be encouraging and supportive
- Reference GitStake when relevant
- Use the web search info to give accurate, up-to-date answers
- Keep it concise but helpful

❌ DON'T:
- Use phrases like "as an AI", "I'm programmed to", "based on my training"
- Sound robotic or overly formal
- Give generic responses
- Ignore the search results I provided
- Make it too long or wordy

If the question is about GitStake specifically, focus on our platform features:
- GitHub profile analysis
- Developer level progression (Code Rookie 🌱 to Code Titan 🚀)
- Code quality assessment
- Programming language proficiency tracking
- Collaboration metrics and leaderboards

Make your response helpful and engaging, like you're chatting with a fellow developer!
`;

    try {
      const response = await axios.post(this.pollinationsApiUrl, {
        messages: [{ role: 'user', content: prompt }],
        model: 'openai-fast',
        private: true,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      let aiResponse;
      if (response.data?.choices?.[0]?.message?.content) {
        aiResponse = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        aiResponse = response.data;
      } else {
        aiResponse = this.createFallbackFromSearch(searchResults, originalQuery);
      }

      return aiResponse.trim();
    } catch (error) {
      console.error('AI response generation failed:', error.message);
      return this.createFallbackFromSearch(searchResults, originalQuery);
    }
  }

  /**
   * Creates a fallback response using search results
   * @param {object} searchResults - Web search results
   * @param {string} query - Original query
   * @returns {string} - Fallback response
   */
  createFallbackFromSearch(searchResults, query) {
    return `Hey! I found some info about "${query}" for you.

${searchResults.answer}

Hope that helps! If you have more questions about GitStake or GitHub development, just ask.

Sources: ${searchResults.sources_used.slice(0, 3).join(', ')}`;
  }

  /**
   * Gets fallback response when everything fails
   * @param {string} query - Original query
   * @param {object} context - Context information
   * @returns {object} - Fallback response object
   */
  getFallbackResponse(query, context = {}) {
    return {
      success: false,
      query,
      response: `Hey there! I'm having trouble searching for info about "${query}" right now. 

If you're asking about GitStake features like GitHub analysis, developer levels, or code quality assessment, I'd be happy to help with that instead!

What would you like to know about GitStake?`,
      sources: [],
      error: 'Search service temporarily unavailable',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Searches for GitHub-related development topics
   * @param {string} topic - Development topic to search
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Search results and response
   */
  async searchDevelopmentTopic(topic, context = {}) {
    const enhancedQuery = `${topic} programming development best practices tutorial guide`;
    return await this.searchAndRespond(enhancedQuery, context);
  }

  /**
   * Searches for specific programming language information
   * @param {string} language - Programming language
   * @param {string} specificTopic - Specific topic about the language
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Search results and response
   */
  async searchLanguageInfo(language, specificTopic = '', context = {}) {
    const query = specificTopic ? 
      `${language} programming ${specificTopic} tutorial examples best practices` :
      `${language} programming language features syntax tutorial guide`;
    
    return await this.searchAndRespond(query, context);
  }

  /**
   * Searches for GitHub and open source related topics
   * @param {string} topic - GitHub/open source topic
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Search results and response
   */
  async searchGitHubTopic(topic, context = {}) {
    const enhancedQuery = `GitHub ${topic} open source development collaboration best practices`;
    return await this.searchAndRespond(enhancedQuery, context);
  }

  /**
   * Gets the health status of the deep search service
   * @returns {Promise<object>} - Health status information
   */
  async getHealthStatus() {
    try {
      const testSearch = await this.performWebSearch('test health check');
      
      return {
        status: 'healthy',
        service: 'Deep Search AI Service',
        webSearchApi: this.webSearchApiUrl,
        pollinationsApi: this.pollinationsApiUrl,
        lastCheck: new Date().toISOString(),
        testResult: 'success'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'Deep Search AI Service',
        webSearchApi: this.webSearchApiUrl,
        pollinationsApi: this.pollinationsApiUrl,
        error: error.message,
        lastCheck: new Date().toISOString(),
        testResult: 'failed'
      };
    }
  }
}

module.exports = DeepSearchAIService;