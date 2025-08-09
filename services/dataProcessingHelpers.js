// Helper methods for processing and organizing GitHub data

class DataProcessingHelpers {
  
  // Check if a commit message is considered empty/low quality
  static isEmptyCommit(message) {
    if (!message || message.trim().length < 10) return true;
    
    const lowQualityPatterns = [
      /^(fix|update|change|modify|wip|test|tmp)$/i,
      /^(.|..|...)$/,
      /^(initial commit|first commit|init)$/i,
      /^(merge|Merge).*$/,
      /^(revert|Revert).*$/
    ];
    
    return lowQualityPatterns.some(pattern => pattern.test(message.trim()));
  }

  // Calculate average commits per month for a repository
  static calculateAvgCommitsPerMonth(commits, repoCreatedAt) {
    if (!commits.length) return 0;
    
    const monthsOld = Math.max(1, Math.ceil(
      (new Date() - new Date(repoCreatedAt)) / (1000 * 60 * 60 * 24 * 30)
    ));
    
    return Math.round((commits.length / monthsOld) * 100) / 100;
  }

  // Generate comprehensive commit statistics
  static generateCommitStatistics(commits) {
    if (!commits.length) return {};
    
    const messageWords = commits.flatMap(c => c.message.toLowerCase().split(/\s+/));
    const wordFrequency = {};
    messageWords.forEach(word => {
      if (word.length > 3) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    const commitsByHour = {};
    commits.forEach(commit => {
      const hour = new Date(commit.author.date).getHours();
      commitsByHour[hour] = (commitsByHour[hour] || 0) + 1;
    });
    
    return {
      averageMessageLength: commits.reduce((sum, c) => sum + c.messageLength, 0) / commits.length,
      longestMessage: Math.max(...commits.map(c => c.messageLength)),
      shortestMessage: Math.min(...commits.map(c => c.messageLength)),
      topMessageWords: topWords,
      commitsByHour,
      mostActiveHour: Object.entries(commitsByHour)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
      commitsByDayOfWeek: this.groupByDayOfWeek(commits, 'author.date'),
      averageLinesChanged: commits.reduce((sum, c) => sum + (c.linesChanged || 0), 0) / commits.length
    };
  }

  // Generate pull request statistics
  static generatePRStatistics(prs) {
    if (!prs.length) return {};
    
    const mergeTimeAnalysis = prs
      .filter(pr => pr.merged_at && pr.created_at)
      .map(pr => {
        const created = new Date(pr.created_at);
        const merged = new Date(pr.merged_at);
        return (merged - created) / (1000 * 60 * 60 * 24); // days
      });
    
    const averageMergeTime = mergeTimeAnalysis.length > 0 ? 
      mergeTimeAnalysis.reduce((sum, days) => sum + days, 0) / mergeTimeAnalysis.length : 0;
    
    return {
      mergeRate: prs.filter(pr => pr.merged).length / prs.length,
      averageMergeTimeInDays: Math.round(averageMergeTime * 100) / 100,
      averageAdditions: prs.reduce((sum, pr) => sum + (pr.additions || 0), 0) / prs.length,
      averageDeletions: prs.reduce((sum, pr) => sum + (pr.deletions || 0), 0) / prs.length,
      averageFilesChanged: prs.reduce((sum, pr) => sum + (pr.changed_files || 0), 0) / prs.length,
      draftRate: prs.filter(pr => pr.draft).length / prs.length,
      prSizeDistribution: {
        small: prs.filter(pr => (pr.additions || 0) + (pr.deletions || 0) < 100).length,
        medium: prs.filter(pr => {
          const changes = (pr.additions || 0) + (pr.deletions || 0);
          return changes >= 100 && changes < 500;
        }).length,
        large: prs.filter(pr => (pr.additions || 0) + (pr.deletions || 0) >= 500).length
      }
    };
  }

  // Generate issue statistics
  static generateIssueStatistics(issues) {
    if (!issues.length) return {};
    
    const closedIssues = issues.filter(issue => issue.state === 'closed' && issue.closed_at);
    const resolutionTimes = closedIssues.map(issue => {
      const created = new Date(issue.created_at);
      const closed = new Date(issue.closed_at);
      return (closed - created) / (1000 * 60 * 60 * 24); // days
    });
    
    const averageResolutionTime = resolutionTimes.length > 0 ?
      resolutionTimes.reduce((sum, days) => sum + days, 0) / resolutionTimes.length : 0;
    
    return {
      closeRate: closedIssues.length / issues.length,
      averageResolutionTimeInDays: Math.round(averageResolutionTime * 100) / 100,
      averageComments: issues.reduce((sum, issue) => sum + (issue.comments || 0), 0) / issues.length,
      issuesWithAssignees: issues.filter(issue => issue.assignees.length > 0).length / issues.length,
      issuesWithLabels: issues.filter(issue => issue.labels.length > 0).length / issues.length,
      issuesWithMilestones: issues.filter(issue => issue.milestone).length / issues.length
    };
  }

  // Generate collaboration statistics
  static generateCollaborationStatistics(contributors) {
    if (!contributors.length) return {};
    
    const contributorsByLogin = {};
    contributors.forEach(contributor => {
      if (!contributorsByLogin[contributor.login]) {
        contributorsByLogin[contributor.login] = {
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          totalContributions: 0,
          repositories: []
        };
      }
      contributorsByLogin[contributor.login].totalContributions += contributor.contributions;
      contributorsByLogin[contributor.login].repositories.push({
        name: contributor.repository,
        contributions: contributor.contributions
      });
    });
    
    const topCollaborators = Object.values(contributorsByLogin)
      .sort((a, b) => b.totalContributions - a.totalContributions)
      .slice(0, 10);
    
    return {
      uniqueContributors: Object.keys(contributorsByLogin).length,
      topCollaborators,
      averageContributionsPerPerson: contributors.reduce((sum, c) => sum + c.contributions, 0) / Object.keys(contributorsByLogin).length,
      collaborationScore: Object.keys(contributorsByLogin).length * 2 + 
                         topCollaborators.reduce((sum, c) => sum + c.repositories.length, 0)
    };
  }

  // Group data by repository
  static groupByRepository(items) {
    const grouped = {};
    items.forEach(item => {
      const repo = item.repository;
      if (!grouped[repo]) grouped[repo] = [];
      grouped[repo].push(item);
    });
    return grouped;
  }

  // Group data by month
  static groupByMonth(items, dateField) {
    const grouped = {};
    items.forEach(item => {
      const date = this.getNestedValue(item, dateField);
      if (date) {
        const month = new Date(date).toISOString().substring(0, 7); // YYYY-MM
        grouped[month] = (grouped[month] || 0) + 1;
      }
    });
    return grouped;
  }

  // Group data by day of week
  static groupByDayOfWeek(items, dateField) {
    const grouped = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    items.forEach(item => {
      const date = this.getNestedValue(item, dateField);
      if (date) {
        const dayOfWeek = days[new Date(date).getDay()];
        grouped[dayOfWeek] = (grouped[dayOfWeek] || 0) + 1;
      }
    });
    return grouped;
  }

  // Group commits by author
  static groupByAuthor(commits) {
    const grouped = {};
    commits.forEach(commit => {
      const author = commit.author.login;
      if (!grouped[author]) {
        grouped[author] = {
          login: author,
          name: commit.author.name,
          email: commit.author.email,
          commits: 0,
          totalLines: 0
        };
      }
      grouped[author].commits++;
      grouped[author].totalLines += commit.linesChanged || 0;
    });
    return Object.values(grouped).sort((a, b) => b.commits - a.commits);
  }

  // Get top contributors
  static getTopContributors(contributors) {
    const contributorMap = {};
    contributors.forEach(contributor => {
      if (!contributorMap[contributor.login]) {
        contributorMap[contributor.login] = {
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          totalContributions: 0,
          repositories: 0
        };
      }
      contributorMap[contributor.login].totalContributions += contributor.contributions;
      contributorMap[contributor.login].repositories++;
    });
    
    return Object.values(contributorMap)
      .sort((a, b) => b.totalContributions - a.totalContributions)
      .slice(0, 10);
  }

  // Get common labels from issues
  static getCommonLabels(issues) {
    const labelCount = {};
    issues.forEach(issue => {
      issue.labels.forEach(label => {
        labelCount[label.name] = (labelCount[label.name] || 0) + 1;
      });
    });
    
    return Object.entries(labelCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  // Helper to get nested object values
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

module.exports = DataProcessingHelpers;