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
Hey there! I need you to analyze this developer's GitHub profile and give me some friendly insights. Talk to me like a human, not like a robot - use natural language and avoid those typical AI phrases.

Here's what I know about this developer:

Profile: ${profile.name || 'Unknown'} (@${userData.username})
Bio: ${profile.bio || 'No bio available'}
Location: ${profile.location || 'Unknown'}
Company: ${profile.company || 'Unknown'}

Their coding activity:
- They've made ${analytics.totalCommits} commits total
- Created ${analytics.totalPRs} pull requests
- Opened ${analytics.totalIssues} issues
- Working across ${analytics.repoCount} repositories
- Main languages: ${analytics.programmingLanguages.map(lang => `${lang.language} (${lang.percentage}%)`).join(', ')}
- Got a proficiency score of ${analytics.proficiencyScore}/100
- Current coding streak: ${analytics.streak.current} days
- Best streak ever: ${analytics.streak.longest} days
- Had ${analytics.emptyCommits} commits that weren't super meaningful

Their top projects:
${repositories.slice(0, 5).map(repo =>
      `- ${repo.name}: Built with ${repo.language || 'Unknown'}, got ${repo.stars} stars, ${repo.commits} commits`
    ).join('\n')}

Give me a JSON response that sounds human and helpful:
{
  "profileSummary": "Write 2-3 sentences about this developer like you're telling a friend about them",
  "strengths": ["What they're really good at - be specific and encouraging"],
  "recommendations": ["Practical advice for their next steps - make it actionable"],
  "skillLevel": "Pick one: Beginner|Intermediate|Advanced|Expert"
}

For skill levels, think about it this way:
- Beginner: Just getting started (under 50 commits, few repos, learning 1-2 languages)
- Intermediate: Getting the hang of it (50-500 commits, decent repo collection, knows several languages)
- Advanced: Pretty skilled (500-2000 commits, lots of repos, good at collaboration)
- Expert: Really knows their stuff (2000+ commits, impressive portfolio, strong community presence)

Focus on what makes them unique as a developer and what would help them grow. Keep it real and encouraging!
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