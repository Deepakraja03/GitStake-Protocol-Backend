const axios = require('axios');

class AIService {
  constructor() {
    this.pollinationsApiUrl = process.env.POLLINATIONS_API_URL;
  }

  async generateInsights(userData) {
    try {
      const prompt = this.createAnalysisPrompt(userData);
      
      const response = await axios.post(this.pollinationsApiUrl, {
        messages: [{ role: 'user', content: prompt }],
        model: 'openai-fast',
        private: true,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 60000,
      });

      let rawContent;
      if (response.data?.choices?.[0]?.message?.content) {
        rawContent = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        rawContent = response.data;
      } else if (typeof response.data === 'object') {
        rawContent = JSON.stringify(response.data);
      }

      return this.parseAIResponse(rawContent);
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return this.generateFallbackInsights(userData);
    }
  }

  createAnalysisPrompt(userData) {
    const { profile, analytics, repositories } = userData;
    
    return `
Analyze this GitHub developer profile and provide insights in JSON format:

Profile: ${profile.name || 'Unknown'} (@${userData.username})
Bio: ${profile.bio || 'No bio available'}
Location: ${profile.location || 'Unknown'}
Company: ${profile.company || 'Unknown'}

Analytics:
- Total Commits: ${analytics.totalCommits}
- Total Pull Requests: ${analytics.totalPRs}
- Total Issues: ${analytics.totalIssues}
- Repository Count: ${analytics.repoCount}
- Programming Languages: ${analytics.programmingLanguages.map(lang => `${lang.language} (${lang.percentage}%)`).join(', ')}
- Proficiency Score: ${analytics.proficiencyScore}/100
- Current Streak: ${analytics.streak.current} days
- Longest Streak: ${analytics.streak.longest} days
- Empty Commits: ${analytics.emptyCommits}

Top Repositories:
${repositories.slice(0, 5).map(repo => 
  `- ${repo.name}: ${repo.language || 'Unknown'}, ${repo.stars} stars, ${repo.commits} commits`
).join('\n')}

Please provide a JSON response with:
{
  "profileSummary": "A 2-3 sentence summary of the developer's profile and activity",
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "skillLevel": "Beginner|Intermediate|Advanced|Expert"
}

Base the skill level on:
- Beginner: <50 commits, <5 repos, 1-2 languages
- Intermediate: 50-500 commits, 5-20 repos, 2-5 languages
- Advanced: 500-2000 commits, 20+ repos, 5+ languages, good PR activity
- Expert: 2000+ commits, extensive repo portfolio, multiple languages, high collaboration

Focus on programming skills, collaboration patterns, and growth opportunities.
`;
  }

  parseAIResponse(rawContent) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          profileSummary: parsed.profileSummary || 'AI-generated summary not available',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          skillLevel: parsed.skillLevel || 'Intermediate',
          generatedAt: new Date()
        };
      }
      
      // Fallback parsing if JSON extraction fails
      return this.parsePlainTextResponse(rawContent);
    } catch (error) {
      console.error('Failed to parse AI response:', error.message);
      return this.generateFallbackInsights();
    }
  }

  parsePlainTextResponse(content) {
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      profileSummary: lines.find(line => line.toLowerCase().includes('summary')) || 
                     'This developer shows consistent activity across multiple repositories.',
      strengths: lines.filter(line => line.includes('•') || line.includes('-'))
                     .slice(0, 3)
                     .map(line => line.replace(/[•-]\s*/, '').trim()) || 
                ['Active contributor', 'Multi-language experience'],
      recommendations: ['Continue building diverse projects', 'Increase collaboration through PRs', 'Document code better'],
      skillLevel: 'Intermediate',
      generatedAt: new Date()
    };
  }

  generateFallbackInsights(userData = null) {
    const fallbackInsights = {
      profileSummary: 'This developer demonstrates consistent coding activity with a focus on practical development.',
      strengths: ['Regular commit activity', 'Multi-repository experience', 'Programming language diversity'],
      recommendations: ['Increase collaboration through pull requests', 'Add more detailed commit messages', 'Consider contributing to open source projects'],
      skillLevel: 'Intermediate',
      generatedAt: new Date()
    };

    if (userData?.analytics) {
      const { analytics } = userData;
      
      // Adjust skill level based on analytics
      if (analytics.totalCommits > 2000 && analytics.repoCount > 20) {
        fallbackInsights.skillLevel = 'Expert';
        fallbackInsights.strengths.push('Extensive project portfolio');
      } else if (analytics.totalCommits > 500 && analytics.repoCount > 10) {
        fallbackInsights.skillLevel = 'Advanced';
        fallbackInsights.strengths.push('Strong development experience');
      } else if (analytics.totalCommits < 50) {
        fallbackInsights.skillLevel = 'Beginner';
        fallbackInsights.recommendations.unshift('Focus on building more projects');
      }

      // Add language-specific insights
      if (analytics.programmingLanguages.length > 5) {
        fallbackInsights.strengths.push('Multi-language proficiency');
      }

      if (analytics.totalPRs > 20) {
        fallbackInsights.strengths.push('Strong collaboration skills');
      }
    }

    return fallbackInsights;
  }

  async generateProfileSummary(userData) {
    const prompt = `
Create a brief professional summary for this GitHub developer:

Username: ${userData.username}
Total Commits: ${userData.analytics.totalCommits}
Repositories: ${userData.analytics.repoCount}
Main Languages: ${userData.analytics.programmingLanguages.slice(0, 3).map(l => l.language).join(', ')}
Proficiency Score: ${userData.analytics.proficiencyScore}/100

Write a 1-2 sentence professional summary highlighting their key strengths and experience level.
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
        timeout: 30000,
      });

      let summary;
      if (response.data?.choices?.[0]?.message?.content) {
        summary = response.data.choices[0].message.content.trim();
      } else if (typeof response.data === 'string') {
        summary = response.data.trim();
      } else {
        summary = `Experienced developer with ${userData.analytics.totalCommits} commits across ${userData.analytics.repoCount} repositories.`;
      }

      return summary;
    } catch (error) {
      console.error('Failed to generate profile summary:', error.message);
      return `Active developer with ${userData.analytics.totalCommits} commits and expertise in ${userData.analytics.programmingLanguages[0]?.language || 'multiple languages'}.`;
    }
  }
}

module.exports = AIService;