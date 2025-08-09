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
    
    return `You are GitStake Assistant, a friendly and knowledgeable AI helper designed to assist developers with queries about GitStake, a revolutionary platform that rewards developers for their GitHub contributions through blockchain technology.

### About GitStake Platform
- **GitStake Overview**: GitStake is a decentralized platform that analyzes GitHub profiles using AI and rewards developers based on their open-source contributions, code quality, and collaboration patterns.
- **Developer Levels**: We use 8 catchy developer levels: Code Rookie 🌱, Code Explorer 🔍, Code Builder 🔨, Code Craftsman ⚡, Code Architect 🏗️, Code Wizard 🧙‍♂️, Code Legend 👑, and Code Titan 🚀.
- **Analytics Features**: 
  - Comprehensive GitHub profile analysis using Octokit
  - Code complexity and quality assessment
  - Programming language proficiency scoring
  - Contribution streak tracking
  - Empty commit detection and filtering
  - Repository quality analysis (excludes forks, focuses on programming files)
  - Collaboration metrics (PRs, issues, merges)
  - AI-powered insights and recommendations
- **Scoring System**: Our AI analyzes commit quality, repository diversity, language expertise, and collaboration patterns to generate proficiency scores and developer level classifications.
- **Leaderboard**: Weekly rankings based on various metrics like proficiency score, total commits, repository count, and collaboration activity.
- **Real-time Updates**: Users can refresh their analytics anytime to get the latest GitHub data.

### Platform Features
- **Profile Analysis**: Deep dive into GitHub profiles with AI-powered insights
- **Code Quality Assessment**: Analyze code complexity, commit quality, and programming patterns
- **Developer Progression**: Track growth from Code Rookie to Code Titan
- **Collaboration Metrics**: Measure teamwork through PRs, issues, and community contributions
- **Language Proficiency**: Track expertise across multiple programming languages
- **Trend Analysis**: Understand coding patterns and improvement areas
- **Email Notifications**: Get updates about achievements and platform news

### Context Information
${contextInfo}

Guidelines for your response:
1. Start with a friendly greeting like "Hey there!" or "Hi, GitStake Assistant here!"
2. Use emojis sparingly to keep it engaging (e.g., 😊, 🚀, 💻)
3. Format your response using markdown:
   - Use ## for main sections
   - Use ### for subsections  
   - Use ** for emphasis
   - Use bullet points (*) for lists
   - Use > for tips or key notes
4. Keep explanations developer-focused and platform-specific
5. If the question is off-topic (not about GitStake, GitHub analytics, or development), politely redirect: "I'm GitStake Assistant, and I specialize in helping with GitHub analytics and developer growth on our platform. How can I help you with that?"
6. End with a supportive note like "Need more help?" or "What else can I assist you with on GitStake?"

Respond in a casual, developer-friendly tone while staying focused on GitStake and GitHub analytics.

The user asked: ${userInput}

Provide a clear, structured, and platform-specific response in markdown.`;
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
      greeting: `## Hey there! 👋

I'm GitStake Assistant, but I'm having some connection issues right now. 

**What I can help you with:**
* GitHub profile analysis and insights
* Developer level progression (from Code Rookie 🌱 to Code Titan 🚀)
* Code quality and complexity analysis
* Programming language proficiency tracking
* Collaboration metrics and leaderboard rankings

Please try asking your question again in a moment!

Need immediate help? Check out our platform documentation or contact support.`,

      analytics: `## GitHub Analytics Help 📊

I'm currently experiencing connectivity issues, but here's what GitStake offers:

**Our Analytics Features:**
* **Profile Analysis**: Comprehensive GitHub profile evaluation
* **Code Quality**: Complexity and quality assessment
* **Developer Levels**: 8 progression levels from Rookie to Titan
* **Language Proficiency**: Multi-language expertise tracking
* **Collaboration Metrics**: PR, issue, and merge analysis

Try refreshing your profile analysis on the platform for the latest insights!

What specific analytics feature would you like to know more about?`,

      general: `## Oops! 😅

Sorry, I'm GitStake Assistant and I'm having trouble connecting right now.

**I specialize in:**
* GitHub profile analysis and developer insights
* Code quality and complexity assessment  
* Developer progression tracking
* Programming language proficiency
* Collaboration and contribution metrics

Please try asking your GitStake-related question again in a moment!

Need more help?`
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