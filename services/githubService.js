const { Octokit } = require('@octokit/rest');
const moment = require('moment');
const _ = require('lodash');
const AdvancedAnalytics = require('./advancedAnalytics');
const DataProcessingHelpers = require('./dataProcessingHelpers');

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
      
      // Debug: Log the profile data to ensure id is present
      console.log('GitHub Profile Data:', { id: data.id, login: data.login, name: data.name });
      
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
      console.log(`🔍 Starting comprehensive analysis for user: ${username}`);
      
      // Get basic profile and repositories
      const [profile, repositories, userEvents] = await Promise.all([
        this.getUserProfile(username),
        this.getUserRepositories(username),
        this.getUserEvents(username).catch(() => []) // Fallback to empty array if fails
      ]);

      console.log(`📊 Found ${repositories.length} repositories to analyze`);

      // Initialize comprehensive analytics
      let totalCommits = 0;
      let totalPRs = 0;
      let totalIssues = 0;
      let totalMerges = 0;
      let emptyCommits = 0;
      let qualityCommits = 0;
      let totalStars = 0;
      let totalForks = 0;
      let totalWatchers = 0;
      let totalCodeSize = 0;
      
      const languageStats = {};
      const repoDetails = [];
      const commitPatterns = {};
      const collaborationData = {
        uniqueCollaborators: new Set(),
        crossRepoContributions: 0,
        communityEngagement: 0
      };

      // Detailed data collections
      const allCommits = [];
      const allPullRequests = [];
      const allIssues = [];
      const allMerges = [];
      const allContributors = [];
      const allLanguages = {};
      const repositoryStats = [];
      
      // Advanced metrics
      const activityByMonth = {};
      const commitTimePatterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };
      const repoCategories = { personal: 0, forked: 0, contributed: 0, starred: 0 };
      const techStack = new Set();

      // Analyze each repository with comprehensive details
      const repoLimit = Math.min(repositories.length, 30); // Analyze up to 30 repos
      for (let i = 0; i < repoLimit; i++) {
        const repo = repositories[i];
        console.log(`🔬 Analyzing repository ${i + 1}/${repoLimit}: ${repo.name}`);
        
        try {
          // Get comprehensive repo data
          const [commits, prs, issues, languages, contributors, repoStats] = await Promise.all([
            this.getRepositoryCommits(username, repo.name),
            this.getRepositoryPullRequests(username, repo.name),
            this.getRepositoryIssues(username, repo.name),
            this.getRepositoryLanguages(username, repo.name),
            this.getRepositoryContributors(username, repo.name).catch(() => []),
            this.getRepositoryStats(username, repo.name).catch(() => null)
          ]);

          // Analyze commits in detail
          const repoCommitAnalysis = this.analyzeCommitQuality(commits);
          const repoActivityPattern = this.analyzeActivityPatterns(commits);
          
          // Collect detailed commit data
          const detailedCommits = commits.map(commit => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: {
              name: commit.commit.author.name,
              email: commit.commit.author.email,
              date: commit.commit.author.date,
              login: commit.author?.login || 'unknown'
            },
            committer: {
              name: commit.commit.committer.name,
              email: commit.commit.committer.email,
              date: commit.commit.committer.date,
              login: commit.committer?.login || 'unknown'
            },
            repository: repo.name,
            url: commit.html_url,
            stats: commit.stats || null,
            files: commit.files ? commit.files.map(file => ({
              filename: file.filename,
              status: file.status,
              additions: file.additions,
              deletions: file.deletions,
              changes: file.changes
            })) : [],
            isQuality: !this.isEmptyCommit(commit.commit.message),
            messageLength: commit.commit.message.length,
            linesChanged: (commit.stats?.additions || 0) + (commit.stats?.deletions || 0)
          }));
          allCommits.push(...detailedCommits);

          // Collect detailed PR data
          const detailedPRs = prs.map(pr => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            body: pr.body,
            state: pr.state,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            closed_at: pr.closed_at,
            merged_at: pr.merged_at,
            merge_commit_sha: pr.merge_commit_sha,
            author: {
              login: pr.user.login,
              avatar_url: pr.user.avatar_url
            },
            repository: repo.name,
            url: pr.html_url,
            draft: pr.draft,
            mergeable: pr.mergeable,
            mergeable_state: pr.mergeable_state,
            merged: !!pr.merged_at,
            comments: pr.comments,
            review_comments: pr.review_comments,
            commits: pr.commits,
            additions: pr.additions,
            deletions: pr.deletions,
            changed_files: pr.changed_files,
            labels: pr.labels?.map(label => ({
              name: label.name,
              color: label.color,
              description: label.description
            })) || []
          }));
          allPullRequests.push(...detailedPRs);

          // Collect detailed issues data
          const detailedIssues = issues.map(issue => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body,
            state: issue.state,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            closed_at: issue.closed_at,
            author: {
              login: issue.user.login,
              avatar_url: issue.user.avatar_url
            },
            assignees: issue.assignees?.map(assignee => ({
              login: assignee.login,
              avatar_url: assignee.avatar_url
            })) || [],
            repository: repo.name,
            url: issue.html_url,
            comments: issue.comments,
            labels: issue.labels?.map(label => ({
              name: label.name,
              color: label.color,
              description: label.description
            })) || [],
            milestone: issue.milestone ? {
              title: issue.milestone.title,
              description: issue.milestone.description,
              state: issue.milestone.state,
              due_on: issue.milestone.due_on
            } : null
          }));
          allIssues.push(...detailedIssues);

          // Collect merge data
          const mergedPRs = prs.filter(pr => pr.merged_at);
          const detailedMerges = mergedPRs.map(pr => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            merged_at: pr.merged_at,
            merge_commit_sha: pr.merge_commit_sha,
            author: {
              login: pr.user.login,
              avatar_url: pr.user.avatar_url
            },
            repository: repo.name,
            url: pr.html_url,
            additions: pr.additions,
            deletions: pr.deletions,
            changed_files: pr.changed_files,
            commits: pr.commits
          }));
          allMerges.push(...detailedMerges);

          // Collect contributors data
          const detailedContributors = contributors.map(contributor => ({
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
            repository: repo.name,
            url: contributor.html_url,
            type: contributor.type
          }));
          allContributors.push(...detailedContributors);
          
          // Update totals
          totalCommits += commits.length;
          totalPRs += prs.length;
          totalIssues += issues.length;
          totalStars += repo.stargazers_count;
          totalForks += repo.forks_count;
          totalWatchers += repo.watchers_count || 0;
          totalCodeSize += repo.size;
          
          // Count merged PRs and quality metrics
          totalMerges += mergedPRs.length;
          emptyCommits += repoCommitAnalysis.emptyCommits;
          qualityCommits += repoCommitAnalysis.qualityCommits;

          // Analyze collaboration
          collaborationData.uniqueCollaborators.add(...contributors.map(c => c.login));
          if (contributors.length > 1) collaborationData.crossRepoContributions++;

          // Language and tech stack analysis
          Object.entries(languages).forEach(([lang, bytes]) => {
            languageStats[lang] = (languageStats[lang] || 0) + bytes;
            techStack.add(lang);
            
            // Store detailed language data per repository
            if (!allLanguages[lang]) {
              allLanguages[lang] = {
                totalBytes: 0,
                repositories: [],
                percentage: 0
              };
            }
            allLanguages[lang].totalBytes += bytes;
            allLanguages[lang].repositories.push({
              name: repo.name,
              bytes: bytes,
              percentage: 0 // Will be calculated later
            });
          });

          // Activity patterns
          Object.entries(repoActivityPattern.monthlyActivity).forEach(([month, count]) => {
            activityByMonth[month] = (activityByMonth[month] || 0) + count;
          });

          // Time patterns
          Object.entries(repoActivityPattern.timePatterns).forEach(([period, count]) => {
            commitTimePatterns[period] += count;
          });

          // Repository categorization
          if (repo.fork) repoCategories.forked++;
          else if (repo.owner.login === username) repoCategories.personal++;
          else repoCategories.contributed++;

          // Detailed repository info
          repoDetails.push({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count || 0,
            size: repo.size,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            commits: commits.length,
            prs: prs.length,
            issues: issues.length,
            mergedPRs,
            contributors: contributors.length,
            isPrivate: repo.private,
            hasWiki: repo.has_wiki,
            hasPages: repo.has_pages,
            openIssues: repo.open_issues_count,
            defaultBranch: repo.default_branch,
            topics: repo.topics || [],
            license: repo.license?.name || null,
            commitQuality: {
              total: commits.length,
              quality: repoCommitAnalysis.qualityCommits,
              empty: repoCommitAnalysis.emptyCommits,
              averageMessageLength: repoCommitAnalysis.averageMessageLength
            },
            activityScore: this.calculateRepoActivityScore(repo, commits, prs, issues),
            detailedStats: repoStats,
            lastCommitDate: commits.length > 0 ? commits[0].commit.author.date : null,
            firstCommitDate: commits.length > 0 ? commits[commits.length - 1].commit.author.date : null,
            avgCommitsPerMonth: this.calculateAvgCommitsPerMonth(commits, repo.created_at),
            codeFrequency: repoStats?.codeFrequency || null,
            participation: repoStats?.participation || null
          });

          // Store repository stats
          repositoryStats.push({
            repository: repo.name,
            commits: commits.length,
            pullRequests: prs.length,
            issues: issues.length,
            merges: mergedPRs.length,
            contributors: contributors.length,
            languages: Object.keys(languages),
            totalBytes: Object.values(languages).reduce((sum, bytes) => sum + bytes, 0),
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count || 0,
            size: repo.size,
            createdAt: repo.created_at,
            lastActivity: repo.pushed_at,
            isPrivate: repo.private,
            hasIssues: repo.has_issues,
            hasWiki: repo.has_wiki,
            hasPages: repo.has_pages,
            openIssues: repo.open_issues_count,
            license: repo.license?.name || null,
            topics: repo.topics || [],
            description: repo.description
          });

        } catch (error) {
          console.warn(`⚠️ Failed to analyze repository ${repo.name}:`, error.message);
          // Add basic repo info even if detailed analysis fails
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
            commits: 0,
            prs: 0,
            issues: 0,
            error: 'Analysis failed'
          });
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // Calculate comprehensive language statistics
      const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
      const programmingLanguages = Object.entries(languageStats)
        .map(([language, bytes]) => ({
          language,
          count: bytes,
          percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
          repositories: repoDetails.filter(repo => repo.language === language).length
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Advanced streak calculation using collected commits
      const streak = this.calculateAdvancedStreak(allCommits);

      // Comprehensive proficiency scoring
      const advancedMetrics = {
        codeQualityRatio: totalCommits > 0 ? qualityCommits / totalCommits : 0,
        collaborationScore: collaborationData.uniqueCollaborators.size,
        communityImpact: totalStars + (totalForks * 2),
        languageDiversity: programmingLanguages.length,
        projectComplexity: totalCodeSize / repositories.length,
        consistencyScore: this.calculateConsistencyScore(activityByMonth),
        innovationScore: this.calculateInnovationScore(repoDetails, techStack)
      };

      const proficiencyScore = this.calculateAdvancedProficiencyScore({
        totalCommits,
        totalPRs,
        repositories: repositories.length,
        languages: programmingLanguages.length,
        emptyCommits,
        totalMerges,
        ...advancedMetrics
      });

      // Developer insights and patterns
      const developerInsights = {
        primaryLanguages: programmingLanguages.slice(0, 3),
        preferredWorkTime: Object.entries(commitTimePatterns)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
        mostActiveMonth: Object.entries(activityByMonth)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
        collaborationStyle: collaborationData.crossRepoContributions > 5 ? 'collaborative' : 'independent',
        projectFocus: repoCategories.personal > repoCategories.forked ? 'creator' : 'contributor',
        techStackBreadth: techStack.size,
        averageRepoSize: totalCodeSize / repositories.length,
        communityEngagement: totalStars + totalForks + totalWatchers
      };

      // Calculate detailed language statistics
      const totalLanguageBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
      Object.keys(allLanguages).forEach(lang => {
        allLanguages[lang].percentage = totalLanguageBytes > 0 ? 
          Math.round((allLanguages[lang].totalBytes / totalLanguageBytes) * 100) : 0;
        
        // Calculate percentage for each repository
        allLanguages[lang].repositories.forEach(repo => {
          repo.percentage = allLanguages[lang].totalBytes > 0 ? 
            Math.round((repo.bytes / allLanguages[lang].totalBytes) * 100) : 0;
        });
      });

      // Sort and organize data
      const sortedCommits = allCommits.sort((a, b) => new Date(b.author.date) - new Date(a.author.date));
      const sortedPRs = allPullRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const sortedIssues = allIssues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const sortedMerges = allMerges.sort((a, b) => new Date(b.merged_at) - new Date(a.merged_at));

      // Generate comprehensive statistics
      const commitStats = this.generateCommitStatistics(sortedCommits);
      const prStats = this.generatePRStatistics(sortedPRs);
      const issueStats = this.generateIssueStatistics(sortedIssues);
      const collaborationStats = this.generateCollaborationStatistics(allContributors);

      console.log(`✅ Analysis complete! Processed ${repoDetails.length} repositories`);
      console.log(`📊 Collected: ${sortedCommits.length} commits, ${sortedPRs.length} PRs, ${sortedIssues.length} issues, ${sortedMerges.length} merges`);

      return {
        profile: {
          id: profile.id,
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
          updatedAt: profile.updated_at,
          hireable: profile.hireable,
          twitterUsername: profile.twitter_username,
          gravatarId: profile.gravatar_id
        },
        analytics: {
          // Basic metrics
          totalCommits,
          totalPRs,
          totalIssues,
          totalMerges,
          emptyCommits,
          qualityCommits,
          
          // Repository metrics
          repoCount: repositories.length,
          totalStars,
          totalForks,
          totalWatchers,
          totalCodeSize,
          
          // Language and tech
          programmingLanguages,
          techStackBreadth: techStack.size,
          
          // Activity patterns
          streak,
          activityByMonth,
          commitTimePatterns,
          
          // Quality and collaboration
          codeQualityRatio: advancedMetrics.codeQualityRatio,
          collaborationScore: advancedMetrics.collaborationScore,
          communityImpact: advancedMetrics.communityImpact,
          
          // Advanced scores
          proficiencyScore,
          consistencyScore: advancedMetrics.consistencyScore,
          innovationScore: advancedMetrics.innovationScore,
          
          // Repository categorization
          repoCategories,
          
          // Developer insights
          developerInsights,
          
          // Analysis metadata
          lastAnalyzed: new Date(),
          analysisDepth: 'comprehensive',
          repositoriesAnalyzed: repoDetails.length,
          totalRepositories: repositories.length,

          // Detailed statistics
          commitStatistics: commitStats,
          pullRequestStatistics: prStats,
          issueStatistics: issueStats,
          collaborationStatistics: collaborationStats
        },
        repositories: repoDetails.sort((a, b) => (b.activityScore || 0) - (a.activityScore || 0)),
        
        // Detailed data collections
        detailedData: {
          commits: {
            total: sortedCommits.length,
            data: sortedCommits,
            summary: {
              qualityCommits: sortedCommits.filter(c => c.isQuality).length,
              emptyCommits: sortedCommits.filter(c => !c.isQuality).length,
              averageMessageLength: sortedCommits.reduce((sum, c) => sum + c.messageLength, 0) / sortedCommits.length || 0,
              totalLinesChanged: sortedCommits.reduce((sum, c) => sum + (c.linesChanged || 0), 0),
              repositoriesWithCommits: [...new Set(sortedCommits.map(c => c.repository))].length,
              commitsByRepository: this.groupByRepository(sortedCommits),
              commitsByMonth: this.groupByMonth(sortedCommits, 'author.date'),
              commitsByAuthor: this.groupByAuthor(sortedCommits)
            }
          },
          pullRequests: {
            total: sortedPRs.length,
            data: sortedPRs,
            summary: {
              merged: sortedPRs.filter(pr => pr.merged).length,
              open: sortedPRs.filter(pr => pr.state === 'open').length,
              closed: sortedPRs.filter(pr => pr.state === 'closed' && !pr.merged).length,
              draft: sortedPRs.filter(pr => pr.draft).length,
              totalAdditions: sortedPRs.reduce((sum, pr) => sum + (pr.additions || 0), 0),
              totalDeletions: sortedPRs.reduce((sum, pr) => sum + (pr.deletions || 0), 0),
              averageCommitsPerPR: sortedPRs.reduce((sum, pr) => sum + (pr.commits || 0), 0) / sortedPRs.length || 0,
              repositoriesWithPRs: [...new Set(sortedPRs.map(pr => pr.repository))].length,
              prsByRepository: this.groupByRepository(sortedPRs),
              prsByMonth: this.groupByMonth(sortedPRs, 'created_at')
            }
          },
          issues: {
            total: sortedIssues.length,
            data: sortedIssues,
            summary: {
              open: sortedIssues.filter(issue => issue.state === 'open').length,
              closed: sortedIssues.filter(issue => issue.state === 'closed').length,
              withAssignees: sortedIssues.filter(issue => issue.assignees.length > 0).length,
              withLabels: sortedIssues.filter(issue => issue.labels.length > 0).length,
              withMilestones: sortedIssues.filter(issue => issue.milestone).length,
              averageComments: sortedIssues.reduce((sum, issue) => sum + (issue.comments || 0), 0) / sortedIssues.length || 0,
              repositoriesWithIssues: [...new Set(sortedIssues.map(issue => issue.repository))].length,
              issuesByRepository: this.groupByRepository(sortedIssues),
              issuesByMonth: this.groupByMonth(sortedIssues, 'created_at'),
              commonLabels: this.getCommonLabels(sortedIssues)
            }
          },
          merges: {
            total: sortedMerges.length,
            data: sortedMerges,
            summary: {
              totalAdditions: sortedMerges.reduce((sum, merge) => sum + (merge.additions || 0), 0),
              totalDeletions: sortedMerges.reduce((sum, merge) => sum + (merge.deletions || 0), 0),
              averageFilesChanged: sortedMerges.reduce((sum, merge) => sum + (merge.changed_files || 0), 0) / sortedMerges.length || 0,
              repositoriesWithMerges: [...new Set(sortedMerges.map(merge => merge.repository))].length,
              mergesByRepository: this.groupByRepository(sortedMerges),
              mergesByMonth: this.groupByMonth(sortedMerges, 'merged_at')
            }
          },
          contributors: {
            total: allContributors.length,
            unique: [...new Set(allContributors.map(c => c.login))].length,
            data: allContributors,
            summary: {
              topContributors: this.getTopContributors(allContributors),
              contributorsByRepository: this.groupByRepository(allContributors),
              averageContributionsPerRepo: allContributors.reduce((sum, c) => sum + c.contributions, 0) / allContributors.length || 0
            }
          },
          languages: {
            total: Object.keys(allLanguages).length,
            data: allLanguages,
            summary: {
              totalBytes: totalLanguageBytes,
              topLanguages: Object.entries(allLanguages)
                .sort(([,a], [,b]) => b.totalBytes - a.totalBytes)
                .slice(0, 10)
                .map(([lang, data]) => ({
                  language: lang,
                  bytes: data.totalBytes,
                  percentage: data.percentage,
                  repositories: data.repositories.length
                }))
            }
          },
          repositoryStatistics: repositoryStats
        }
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

  // Use advanced analytics methods
  analyzeCommitQuality(commits) {
    return AdvancedAnalytics.analyzeCommitQuality(commits);
  }

  analyzeActivityPatterns(commits) {
    return AdvancedAnalytics.analyzeActivityPatterns(commits);
  }

  calculateRepoActivityScore(repo, commits, prs, issues) {
    return AdvancedAnalytics.calculateRepoActivityScore(repo, commits, prs, issues);
  }

  calculateAdvancedStreak(commits) {
    return AdvancedAnalytics.calculateAdvancedStreak(commits);
  }

  calculateConsistencyScore(activityByMonth) {
    return AdvancedAnalytics.calculateConsistencyScore(activityByMonth);
  }

  calculateInnovationScore(repositories, techStack) {
    return AdvancedAnalytics.calculateInnovationScore(repositories, techStack);
  }

  calculateAdvancedProficiencyScore(metrics) {
    return AdvancedAnalytics.calculateAdvancedProficiencyScore(metrics);
  }

  // Data processing helper methods
  isEmptyCommit(message) {
    return DataProcessingHelpers.isEmptyCommit(message);
  }

  calculateAvgCommitsPerMonth(commits, repoCreatedAt) {
    return DataProcessingHelpers.calculateAvgCommitsPerMonth(commits, repoCreatedAt);
  }

  generateCommitStatistics(commits) {
    return DataProcessingHelpers.generateCommitStatistics(commits);
  }

  generatePRStatistics(prs) {
    return DataProcessingHelpers.generatePRStatistics(prs);
  }

  generateIssueStatistics(issues) {
    return DataProcessingHelpers.generateIssueStatistics(issues);
  }

  generateCollaborationStatistics(contributors) {
    return DataProcessingHelpers.generateCollaborationStatistics(contributors);
  }

  groupByRepository(items) {
    return DataProcessingHelpers.groupByRepository(items);
  }

  groupByMonth(items, dateField) {
    return DataProcessingHelpers.groupByMonth(items, dateField);
  }

  groupByAuthor(commits) {
    return DataProcessingHelpers.groupByAuthor(commits);
  }

  getTopContributors(contributors) {
    return DataProcessingHelpers.getTopContributors(contributors);
  }

  getCommonLabels(issues) {
    return DataProcessingHelpers.getCommonLabels(issues);
  }

  // Legacy methods for backward compatibility
  calculateStreak(commits) {
    return this.calculateAdvancedStreak(commits);
  }

  calculateProficiencyScore(data) {
    return this.calculateAdvancedProficiencyScore(data);
  }
}

module.exports = GitHubService;