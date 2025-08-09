const { Octokit } = require('@octokit/rest');
const moment = require('moment');
const _ = require('lodash');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    
    // Programming file extensions to include
    this.programmingExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php',
      '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.m', '.h', '.hpp',
      '.sql', '.sh', '.ps1', '.pl', '.lua', '.dart', '.vue', '.svelte', '.elm'
    ];
  }

  async getUserProfile(username) {
    try {
      const { data } = await this.octokit.rest.users.getByUsername({
        username
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  async getUserRepositories(username) {
    try {
      const repos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data } = await this.octokit.rest.repos.listForUser({
          username,
          type: 'owner',
          sort: 'updated',
          per_page: 100,
          page
        });

        if (data.length === 0) {
          hasMore = false;
        } else {
          repos.push(...data);
          page++;
        }
      }

      // Filter out forks and include only repos with programming languages
      return repos.filter(repo => 
        !repo.fork && 
        repo.language && 
        repo.size > 0
      );
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  async getRepositoryCommits(owner, repo, since = null) {
    try {
      const commits = [];
      let page = 1;
      let hasMore = true;
      const sinceDate = since || moment().subtract(1, 'year').toISOString();

      while (hasMore && page <= 10) { // Limit to 10 pages to avoid rate limits
        const { data } = await this.octokit.rest.repos.listCommits({
          owner,
          repo,
          author: owner,
          since: sinceDate,
          per_page: 100,
          page
        });

        if (data.length === 0) {
          hasMore = false;
        } else {
          commits.push(...data);
          page++;
        }
      }

      return commits;
    } catch (error) {
      console.warn(`Failed to fetch commits for ${repo}: ${error.message}`);
      return [];
    }
  }

  async getRepositoryPullRequests(owner, repo) {
    try {
      const { data } = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 100
      });

      return data.filter(pr => pr.user.login === owner);
    } catch (error) {
      console.warn(`Failed to fetch PRs for ${repo}: ${error.message}`);
      return [];
    }
  }

  async getRepositoryIssues(owner, repo) {
    try {
      const { data } = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        creator: owner,
        per_page: 100
      });

      // Filter out pull requests (GitHub API includes PRs in issues)
      return data.filter(issue => !issue.pull_request);
    } catch (error) {
      console.warn(`Failed to fetch issues for ${repo}: ${error.message}`);
      return [];
    }
  }

  async getRepositoryLanguages(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.listLanguages({
        owner,
        repo
      });
      return data;
    } catch (error) {
      console.warn(`Failed to fetch languages for ${repo}: ${error.message}`);
      return {};
    }
  }

  async analyzeUserActivity(username) {
    try {
      console.log(`Starting analysis for user: ${username}`);
      
      const profile = await this.getUserProfile(username);
      const repositories = await this.getUserRepositories(username);
      
      let totalCommits = 0;
      let totalPRs = 0;
      let totalIssues = 0;
      let totalMerges = 0;
      let emptyCommits = 0;
      const languageStats = {};
      const repoDetails = [];

      // Analyze each repository
      for (const repo of repositories.slice(0, 20)) { // Limit to 20 repos to avoid rate limits
        console.log(`Analyzing repository: ${repo.name}`);
        
        const [commits, prs, issues, languages] = await Promise.all([
          this.getRepositoryCommits(username, repo.name),
          this.getRepositoryPullRequests(username, repo.name),
          this.getRepositoryIssues(username, repo.name),
          this.getRepositoryLanguages(username, repo.name)
        ]);

        // Count empty commits
        const emptyCommitsInRepo = commits.filter(commit => 
          !commit.commit.message || 
          commit.commit.message.trim().length < 10 ||
          /^(fix|update|change|modify)$/i.test(commit.commit.message.trim())
        ).length;

        // Count merged PRs
        const mergedPRs = prs.filter(pr => pr.merged_at).length;

        totalCommits += commits.length;
        totalPRs += prs.length;
        totalIssues += issues.length;
        totalMerges += mergedPRs;
        emptyCommits += emptyCommitsInRepo;

        // Aggregate language statistics
        Object.entries(languages).forEach(([lang, bytes]) => {
          languageStats[lang] = (languageStats[lang] || 0) + bytes;
        });

        repoDetails.push({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          size: repo.size,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
          commits: commits.length,
          prs: prs.length,
          issues: issues.length
        });

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Calculate language percentages
      const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
      const programmingLanguages = Object.entries(languageStats)
        .map(([language, bytes]) => ({
          language,
          count: bytes,
          percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Calculate streak (simplified - based on recent activity)
      const recentCommits = await this.getRepositoryCommits(username, repositories[0]?.name || '', moment().subtract(30, 'days').toISOString());
      const streak = this.calculateStreak(recentCommits);

      // Calculate proficiency score
      const proficiencyScore = this.calculateProficiencyScore({
        totalCommits,
        totalPRs,
        repositories: repositories.length,
        languages: programmingLanguages.length,
        emptyCommits,
        totalMerges
      });

      return {
        profile: {
          name: profile.name,
          bio: profile.bio,
          location: profile.location,
          company: profile.company,
          blog: profile.blog,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          publicRepos: profile.public_repos,
          publicGists: profile.public_gists,
          followers: profile.followers,
          following: profile.following,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        },
        analytics: {
          totalCommits,
          totalPRs,
          totalIssues,
          totalMerges,
          emptyCommits,
          programmingLanguages,
          streak,
          repoCount: repositories.length,
          proficiencyScore,
          lastAnalyzed: new Date()
        },
        repositories: repoDetails
      };
    } catch (error) {
      throw new Error(`Failed to analyze user activity: ${error.message}`);
    }
  }

  // Extended Octokit methods for comprehensive GitHub API coverage
  async getUserEvents(username, options = {}) {
    try {
      const { data } = await this.octokit.rest.activity.listEventsForAuthenticatedUser({
        username,
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch user events: ${error.message}`);
    }
  }

  async getUserFollowers(username, options = {}) {
    try {
      const { data } = await this.octokit.rest.users.listFollowersForUser({
        username,
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch followers: ${error.message}`);
    }
  }

  async getUserFollowing(username, options = {}) {
    try {
      const { data } = await this.octokit.rest.users.listFollowingForUser({
        username,
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch following: ${error.message}`);
    }
  }

  async getRepository(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  }

  async getRepositoryContributors(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.listContributors({
        owner,
        repo
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch contributors: ${error.message}`);
    }
  }

  async getRepositoryStats(owner, repo) {
    try {
      const [codeFrequency, participation, punchCard] = await Promise.all([
        this.octokit.rest.repos.getCodeFrequencyStats({ owner, repo }),
        this.octokit.rest.repos.getParticipationStats({ owner, repo }),
        this.octokit.rest.repos.getPunchCardStats({ owner, repo })
      ]);

      return {
        codeFrequency: codeFrequency.data,
        participation: participation.data,
        punchCard: punchCard.data
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository stats: ${error.message}`);
    }
  }

  async getPullRequest(owner, repo, pull_number) {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch pull request: ${error.message}`);
    }
  }

  async getPullRequestCommits(owner, repo, pull_number) {
    try {
      const { data } = await this.octokit.rest.pulls.listCommits({
        owner,
        repo,
        pull_number
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch PR commits: ${error.message}`);
    }
  }

  async getPullRequestFiles(owner, repo, pull_number) {
    try {
      const { data } = await this.octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch PR files: ${error.message}`);
    }
  }

  async getIssue(owner, repo, issue_number) {
    try {
      const { data } = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch issue: ${error.message}`);
    }
  }

  async getIssueComments(owner, repo, issue_number) {
    try {
      const { data } = await this.octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch issue comments: ${error.message}`);
    }
  }

  async searchRepositories(query, options = {}) {
    try {
      const { data } = await this.octokit.rest.search.repos({
        q: query,
        sort: options.sort || 'stars',
        order: options.order || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to search repositories: ${error.message}`);
    }
  }

  async searchUsers(query, options = {}) {
    try {
      const { data } = await this.octokit.rest.search.users({
        q: query,
        sort: options.sort || 'best-match',
        order: options.order || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  async searchCode(query, options = {}) {
    try {
      const { data } = await this.octokit.rest.search.code({
        q: query,
        sort: options.sort || 'best-match',
        order: options.order || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to search code: ${error.message}`);
    }
  }

  async getOrganization(org) {
    try {
      const { data } = await this.octokit.rest.orgs.get({ org });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch organization: ${error.message}`);
    }
  }

  async getOrganizationRepos(org, options = {}) {
    try {
      const { data } = await this.octokit.rest.repos.listForOrg({
        org,
        type: options.type || 'all',
        sort: options.sort || 'updated',
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch org repos: ${error.message}`);
    }
  }

  async getOrganizationMembers(org, options = {}) {
    try {
      const { data } = await this.octokit.rest.orgs.listMembers({
        org,
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch org members: ${error.message}`);
    }
  }

  async getUserGists(username, options = {}) {
    try {
      const { data } = await this.octokit.rest.gists.listForUser({
        username,
        per_page: options.per_page || 30,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch user gists: ${error.message}`);
    }
  }

  async getGist(gist_id) {
    try {
      const { data } = await this.octokit.rest.gists.get({ gist_id });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch gist: ${error.message}`);
    }
  }

  async getRateLimit() {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch rate limit: ${error.message}`);
    }
  }

  // Advanced analytics methods
  async analyzeCodeComplexity(username) {
    try {
      const repositories = await this.getUserRepositories(username);
      let totalComplexity = 0;
      let analyzedRepos = 0;

      for (const repo of repositories.slice(0, 10)) {
        try {
          const languages = await this.getRepositoryLanguages(username, repo.name);
          const commits = await this.getRepositoryCommits(username, repo.name);
          
          // Simple complexity calculation based on languages and commit patterns
          const languageComplexity = Object.keys(languages).length * 2;
          const commitComplexity = commits.length > 100 ? 10 : commits.length / 10;
          
          totalComplexity += languageComplexity + commitComplexity;
          analyzedRepos++;
        } catch (error) {
          console.warn(`Failed to analyze complexity for ${repo.name}`);
        }
      }

      return {
        averageComplexity: analyzedRepos > 0 ? totalComplexity / analyzedRepos : 0,
        totalComplexity,
        analyzedRepositories: analyzedRepos,
        complexityLevel: totalComplexity > 50 ? 'High' : totalComplexity > 20 ? 'Medium' : 'Low'
      };
    } catch (error) {
      throw new Error(`Failed to analyze code complexity: ${error.message}`);
    }
  }

  async getActivityAnalytics(username, timeframe = '1year') {
    try {
      const profile = await this.getUserProfile(username);
      const repositories = await this.getUserRepositories(username);
      
      // Get activity data based on timeframe
      const since = moment().subtract(1, timeframe.replace('1', '')).toISOString();
      
      let totalActivity = 0;
      const activityByMonth = {};
      
      for (const repo of repositories.slice(0, 15)) {
        try {
          const commits = await this.getRepositoryCommits(username, repo.name, { since });
          
          commits.forEach(commit => {
            const month = moment(commit.commit.author.date).format('YYYY-MM');
            activityByMonth[month] = (activityByMonth[month] || 0) + 1;
            totalActivity++;
          });
        } catch (error) {
          console.warn(`Failed to get activity for ${repo.name}`);
        }
      }

      return {
        profile: {
          username,
          name: profile.name,
          avatarUrl: profile.avatar_url
        },
        analytics: {
          totalActivity,
          averageMonthlyActivity: totalActivity / 12,
          activityByMonth,
          repositories: repositories.length,
          timeframe
        }
      };
    } catch (error) {
      throw new Error(`Failed to get activity analytics: ${error.message}`);
    }
  }

  async getCollaborationMetrics(username) {
    try {
      const repositories = await this.getUserRepositories(username);
      
      let totalPRs = 0;
      let totalIssues = 0;
      let totalCollaborators = 0;
      
      for (const repo of repositories.slice(0, 10)) {
        try {
          const [prs, issues, contributors] = await Promise.all([
            this.getRepositoryPullRequests(username, repo.name),
            this.getRepositoryIssues(username, repo.name),
            this.getRepositoryContributors(username, repo.name)
          ]);
          
          totalPRs += prs.length;
          totalIssues += issues.length;
          totalCollaborators += contributors.length;
        } catch (error) {
          console.warn(`Failed to get collaboration metrics for ${repo.name}`);
        }
      }

      return {
        totalPullRequests: totalPRs,
        totalIssues: totalIssues,
        averageCollaborators: repositories.length > 0 ? totalCollaborators / repositories.length : 0,
        collaborationScore: Math.min(100, (totalPRs * 2 + totalIssues + totalCollaborators) / 10)
      };
    } catch (error) {
      throw new Error(`Failed to get collaboration metrics: ${error.message}`);
    }
  }

  async analyzeCodeQuality(username) {
    try {
      const repositories = await this.getUserRepositories(username);
      
      let totalCommits = 0;
      let qualityCommits = 0;
      let totalPRs = 0;
      let mergedPRs = 0;
      
      for (const repo of repositories.slice(0, 10)) {
        try {
          const [commits, prs] = await Promise.all([
            this.getRepositoryCommits(username, repo.name),
            this.getRepositoryPullRequests(username, repo.name)
          ]);
          
          totalCommits += commits.length;
          totalPRs += prs.length;
          mergedPRs += prs.filter(pr => pr.merged_at).length;
          
          // Quality commits have meaningful messages
          qualityCommits += commits.filter(commit => 
            commit.commit.message.length > 20 && 
            !commit.commit.message.match(/^(fix|update|change|modify|wip)$/i)
          ).length;
        } catch (error) {
          console.warn(`Failed to analyze quality for ${repo.name}`);
        }
      }

      const commitQualityRatio = totalCommits > 0 ? qualityCommits / totalCommits : 0;
      const prMergeRatio = totalPRs > 0 ? mergedPRs / totalPRs : 0;
      
      return {
        commitQualityRatio: Math.round(commitQualityRatio * 100),
        pullRequestMergeRatio: Math.round(prMergeRatio * 100),
        qualityScore: Math.round((commitQualityRatio * 60 + prMergeRatio * 40) * 100),
        totalCommits,
        qualityCommits,
        totalPRs,
        mergedPRs
      };
    } catch (error) {
      throw new Error(`Failed to analyze code quality: ${error.message}`);
    }
  }

  async getTrendAnalysis(username, period = '6months') {
    try {
      const repositories = await this.getUserRepositories(username);
      const months = parseInt(period.replace('months', ''));
      
      const trends = {};
      const languageTrends = {};
      
      for (let i = 0; i < months; i++) {
        const monthStart = moment().subtract(i + 1, 'months').startOf('month');
        const monthEnd = moment().subtract(i, 'months').startOf('month');
        const monthKey = monthStart.format('YYYY-MM');
        
        trends[monthKey] = { commits: 0, prs: 0, issues: 0 };
        
        for (const repo of repositories.slice(0, 8)) {
          try {
            const commits = await this.getRepositoryCommits(username, repo.name, {
              since: monthStart.toISOString(),
              until: monthEnd.toISOString()
            });
            
            trends[monthKey].commits += commits.length;
            
            // Track language usage over time
            if (repo.language) {
              if (!languageTrends[repo.language]) {
                languageTrends[repo.language] = {};
              }
              languageTrends[repo.language][monthKey] = 
                (languageTrends[repo.language][monthKey] || 0) + commits.length;
            }
          } catch (error) {
            console.warn(`Failed to get trends for ${repo.name}`);
          }
        }
      }

      return {
        activityTrends: trends,
        languageTrends,
        period: `${months} months`,
        analysis: this.analyzeTrendPatterns(trends)
      };
    } catch (error) {
      throw new Error(`Failed to get trend analysis: ${error.message}`);
    }
  }

  analyzeTrendPatterns(trends) {
    const months = Object.keys(trends).sort();
    const commitCounts = months.map(month => trends[month].commits);
    
    const avgCommits = commitCounts.reduce((sum, count) => sum + count, 0) / commitCounts.length;
    const recentAvg = commitCounts.slice(-3).reduce((sum, count) => sum + count, 0) / 3;
    
    let trendDirection = 'stable';
    if (recentAvg > avgCommits * 1.2) {
      trendDirection = 'increasing';
    } else if (recentAvg < avgCommits * 0.8) {
      trendDirection = 'decreasing';
    }
    
    return {
      averageMonthlyCommits: Math.round(avgCommits),
      recentAverageCommits: Math.round(recentAvg),
      trendDirection,
      consistency: this.calculateConsistency(commitCounts)
    };
  }

  calculateConsistency(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower coefficient of variation means higher consistency
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;
    
    if (coefficientOfVariation < 0.3) return 'high';
    if (coefficientOfVariation < 0.6) return 'medium';
    return 'low';
  }

  calculateStreak(commits) {
    if (!commits.length) return { current: 0, longest: 0 };

    const commitDates = commits.map(commit => 
      moment(commit.commit.author.date).format('YYYY-MM-DD')
    );
    
    const uniqueDates = [...new Set(commitDates)].sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = moment(uniqueDates[i - 1]);
      const currentDate = moment(uniqueDates[i]);
      
      if (currentDate.diff(prevDate, 'days') === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calculate current streak from today backwards
    const today = moment().format('YYYY-MM-DD');
    const lastCommitDate = uniqueDates[uniqueDates.length - 1];
    
    if (moment(today).diff(moment(lastCommitDate), 'days') <= 1) {
      currentStreak = tempStreak;
    }

    return { current: currentStreak, longest: longestStreak };
  }

  calculateProficiencyScore(data) {
    const {
      totalCommits,
      totalPRs,
      repositories,
      languages,
      emptyCommits,
      totalMerges
    } = data;

    let score = 0;

    // Commit quality (40% of score)
    const commitQuality = totalCommits > 0 ? 
      Math.max(0, (totalCommits - emptyCommits) / totalCommits) : 0;
    score += commitQuality * 40;

    // Repository diversity (20% of score)
    const repoDiversity = Math.min(repositories / 10, 1) * 20;
    score += repoDiversity;

    // Language proficiency (20% of score)
    const langProficiency = Math.min(languages / 5, 1) * 20;
    score += langProficiency;

    // Collaboration (20% of score)
    const collaboration = Math.min((totalPRs + totalMerges) / 20, 1) * 20;
    score += collaboration;

    return Math.round(score);
  }
}

module.exports = GitHubService;