const axios = require('axios');

class ChatService {
  constructor() {
    this.pollinationsApiUrl = process.env.POLLINATIONS_API_URL;
  }

  /**
   * Encodes a prompt for the GitStake AI Assistant
   * @param {string} userInput - The user's message or query
   * @param {object} context - Additional context about the user or platform
   * @returns {string} - Encoded prompt with instructions
   */
  encodePrompt(userInput, context = {}) {
    const contextInfo = context.username ? `User: ${context.username}` : '';

    return `Hey! You're the GitStake Assistant - a friendly helper for developers using our platform. Talk like a real person, not like a robot. No "as an AI" or "I'm programmed to" stuff, okay?

Here's what GitStake is all about:

**What GitStake Does:**
GitStake analyzes GitHub profiles and rewards developers for their contributions. We use smart analysis to understand code quality, collaboration, and growth patterns.

**Developer Levels (the fun part!):**
We've got 8 levels that developers progress through:
- Code Rookie 🌱 (just starting out)
- Code Explorer 🔍 (learning the ropes)
- Code Builder 🔨 (building cool stuff)
- Code Craftsman ⚡ (getting really good)
- Code Architect 🏗️ (designing complex systems)
- Code Wizard 🧙‍♂️ (mastering multiple domains)
- Code Legend 👑 (legendary impact)
- Code Titan 🚀 (reshaping the dev world)

**What We Analyze:**
- GitHub profiles and repository quality
- Code complexity and commit patterns
- Programming language skills
- Collaboration through PRs and issues
- Contribution streaks and consistency
- Community engagement and impact

**Cool Features:**
- Real-time GitHub analysis
- Leaderboards and rankings
- Email notifications for achievements
- Trend analysis and growth insights
- Personalized recommendations

Context: ${contextInfo}

**How to respond:**
✅ DO:
- Sound like a helpful developer friend
- Use casual language ("you're", "that's", "it's")
- Be encouraging and supportive
- Use emojis occasionally (😊, 🚀, 💻)
- Give practical advice
- Reference GitStake features when relevant

❌ DON'T:
- Say "as an AI" or similar robotic phrases
- Be overly formal or corporate
- Give generic responses
- Ignore what they're asking about

If they ask about something not related to GitStake or development, just say: "I'm here to help with GitStake and GitHub development stuff. What would you like to know about that?"

User asked: "${userInput}"

Give them a helpful, human response that sounds natural and friendly!`;
  }

  /**
   * Fetches a chat response from the AI for a given user input
   * @param {string} userInput - The user's message or query
   * @param {object} context - Additional context
   * @param {number} timeout - Request timeout in milliseconds
   * @returns {Promise<string>} - Markdown-formatted response from GitStake Assistant
   */
  async getChatResponse(userInput, context = {}, timeout = 15000) {
    try {
      const response = await axios.post(this.pollinationsApiUrl, {
        messages: [{
          role: 'user',
          content: this.encodePrompt(userInput, context)
        }],
        model: 'openai-fast',
        private: true,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout,
      });

      let responseData;
      if (response.data?.choices?.[0]?.message?.content) {
        responseData = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        responseData = response.data;
      } else if (typeof response.data === 'object') {
        responseData = JSON.stringify(response.data);
      }

      return responseData.trim();
    } catch (error) {
      console.error('Chat Service Error:', error.message);

      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received');
      }

      return this.getFallbackResponse(userInput);
    }
  }

  /**
   * Generates a fallback response when the AI service is unavailable
   * @param {string} userInput - The user's original message
   * @returns {string} - Fallback response
   */
  getFallbackResponse(userInput) {
    const fallbackResponses = {
      greeting: `Hey there! 👋

I'm having some connection issues right now, but I'm here to help with GitStake!

**What I can help you with:**
* GitHub profile analysis and insights
* Developer level progression (from Code Rookie 🌱 to Code Titan 🚀)
* Code quality and complexity analysis
* Programming language proficiency tracking
* Collaboration metrics and leaderboard rankings

Try asking your question again in a moment, and I'll do my best to help!

Need something specific about GitStake?`,

      analytics: `I'm having some connectivity issues, but let me tell you what GitStake can do for you! 📊

**Our Analytics Features:**
* **Profile Analysis**: We dive deep into your GitHub profile
* **Code Quality**: Check how good your code really is
* **Developer Levels**: Progress through 8 levels from Rookie to Titan
* **Language Skills**: Track what languages you're best at
* **Collaboration**: See how well you work with others

Try refreshing your profile analysis on GitStake to get the latest insights!

What specific feature interests you most?`,

      general: `Oops! I'm having trouble connecting right now. 😅

But I'm here to help with GitStake stuff like:
* GitHub profile analysis and developer insights
* Code quality and complexity assessment  
* Developer progression tracking
* Programming language proficiency
* Collaboration and contribution metrics

Try asking your GitStake question again in a moment!

What would you like to know?`
    };

    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return fallbackResponses.greeting;
    } else if (lowerInput.includes('analytics') || lowerInput.includes('profile') || lowerInput.includes('github')) {
      return fallbackResponses.analytics;
    } else {
      return fallbackResponses.general;
    }
  }

  /**
   * Gets the health status of the chat service
   * @returns {Promise<object>} - Health status information
   */
  async getHealthStatus() {
    try {
      const testResponse = await axios.post(this.pollinationsApiUrl, {
        messages: [{
          role: 'user',
          content: 'Health check'
        }],
        model: 'openai-fast',
        private: true,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 5000,
      });

      return {
        status: 'healthy',
        service: 'GitStake AI Assistant',
        apiUrl: this.pollinationsApiUrl,
        responseTime: Date.now(),
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'GitStake AI Assistant',
        apiUrl: this.pollinationsApiUrl,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}

module.exports = ChatService;