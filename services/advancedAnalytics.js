// Advanced analytics helper methods for comprehensive GitHub analysis

const moment = require('moment');

class AdvancedAnalytics {
  
  // Analyze commit quality and patterns
  static analyzeCommitQuality(commits) {
    let qualityCommits = 0;
    let emptyCommits = 0;
    let totalMessageLength = 0;
    const messagePatterns = {};
    
    commits.forEach(commit => {
      const message = commit.commit.message.trim();
      totalMessageLength += message.length;
      
      // Empty/low quality commit detection
      if (message.length < 10 || 
          /^(fix|update|change|modify|wip|test|tmp)$/i.test(message) ||
          /^(.|..|...)$/.test(message)) {
        emptyCommits++;
      } else {
        qualityCommits++;
      }
      
      // Pattern analysis
      const firstWord = message.split(' ')[0].toLowerCase();
      messagePatterns[firstWord] = (messagePatterns[firstWord] || 0) + 1;
    });
    
    return {
      qualityCommits,
      emptyCommits,
      averageMessageLength: commits.length > 0 ? totalMessageLength / commits.length : 0,
      messagePatterns: Object.entries(messagePatterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([pattern, count]) => ({ pattern, count }))
    };
  }
  
  // Analyze activity patterns by time and date
  static analyzeActivityPatterns(commits) {
    const monthlyActivity = {};
    const timePatterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const dayOfWeekActivity = {};
    
    commits.forEach(commit => {
      const date = moment(commit.commit.author.date);
      const month = date.format('YYYY-MM');
      const hour = date.hour();
      const dayOfWeek = date.format('dddd');
      
      // Monthly activity
      monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
      
      // Time patterns
      if (hour >= 6 && hour < 12) timePatterns.morning++;
      else if (hour >= 12 && hour < 18) timePatterns.afternoon++;
      else if (hour >= 18 && hour < 24) timePatterns.evening++;
      else timePatterns.night++;
      
      // Day of week
      dayOfWeekActivity[dayOfWeek] = (dayOfWeekActivity[dayOfWeek] || 0) + 1;
    });
    
    return {
      monthlyActivity,
      timePatterns,
      dayOfWeekActivity
    };
  }
  
  // Calculate repository activity score
  static calculateRepoActivityScore(repo, commits, prs, issues) {
    const ageInDays = moment().diff(moment(repo.created_at), 'days');
    const recentActivity = moment().diff(moment(repo.pushed_at), 'days');
    
    let score = 0;
    
    // Commit activity (40% of score)
    score += Math.min(commits.length / 10, 10) * 4;
    
    // Community engagement (30% of score)
    score += Math.min((repo.stargazers_count * 2 + repo.forks_count * 3), 10) * 3;
    
    // Collaboration (20% of score)
    score += Math.min((prs.length * 2 + issues.length), 10) * 2;
    
    // Recency (10% of score)
    score += Math.max(0, 10 - (recentActivity / 30)) * 1;
    
    return Math.round(score);
  }
  
  // Advanced streak calculation with gaps consideration
  static calculateAdvancedStreak(commits) {
    if (!commits.length) return { current: 0, longest: 0, gaps: 0 };
    
    const commitDates = commits
      .map(commit => moment(commit.date).format('YYYY-MM-DD'))
      .filter(date => date !== 'Invalid date')
      .sort();
    
    const uniqueDates = [...new Set(commitDates)];
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let gaps = 0;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = moment(uniqueDates[i - 1]);
      const currentDate = moment(uniqueDates[i]);
      const daysDiff = currentDate.diff(prevDate, 'days');
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        if (daysDiff > 7) gaps++; // Count significant gaps
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calculate current streak from today backwards
    const today = moment().format('YYYY-MM-DD');
    const lastCommitDate = uniqueDates[uniqueDates.length - 1];
    const daysSinceLastCommit = moment(today).diff(moment(lastCommitDate), 'days');
    
    if (daysSinceLastCommit <= 1) {
      currentStreak = tempStreak;
    }
    
    return { 
      current: currentStreak, 
      longest: longestStreak, 
      gaps,
      totalActiveDays: uniqueDates.length,
      averageCommitsPerDay: commits.length / uniqueDates.length
    };
  }
  
  // Calculate consistency score based on activity distribution
  static calculateConsistencyScore(activityByMonth) {
    const values = Object.values(activityByMonth);
    if (values.length < 2) return 50; // Default for insufficient data
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower coefficient of variation = higher consistency
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;
    const consistencyScore = Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 50)));
    
    return Math.round(consistencyScore);
  }
  
  // Calculate innovation score based on technology diversity and project uniqueness
  static calculateInnovationScore(repositories, techStack) {
    let score = 0;
    
    // Technology diversity (40% of score)
    score += Math.min(techStack.size / 2, 20) * 2;
    
    // Project variety (30% of score)
    const projectTypes = new Set();
    repositories.forEach(repo => {
      if (repo.topics) repo.topics.forEach(topic => projectTypes.add(topic));
      if (repo.description) {
        const desc = repo.description.toLowerCase();
        if (desc.includes('api')) projectTypes.add('api');
        if (desc.includes('web')) projectTypes.add('web');
        if (desc.includes('mobile')) projectTypes.add('mobile');
        if (desc.includes('game')) projectTypes.add('game');
        if (desc.includes('ai') || desc.includes('ml')) projectTypes.add('ai');
        if (desc.includes('blockchain')) projectTypes.add('blockchain');
      }
    });
    score += Math.min(projectTypes.size * 3, 30);
    
    // Recent technology adoption (20% of score)
    const recentRepos = repositories.filter(repo => 
      moment().diff(moment(repo.created_at), 'months') < 12
    );
    const recentTechDiversity = new Set(recentRepos.map(repo => repo.language)).size;
    score += Math.min(recentTechDiversity * 4, 20);
    
    // Experimental projects (10% of score)
    const experimentalKeywords = ['experiment', 'prototype', 'poc', 'demo', 'test', 'playground'];
    const experimentalRepos = repositories.filter(repo => 
      experimentalKeywords.some(keyword => 
        repo.name.toLowerCase().includes(keyword) || 
        (repo.description && repo.description.toLowerCase().includes(keyword))
      )
    );
    score += Math.min(experimentalRepos.length * 2, 10);
    
    return Math.round(Math.min(score, 100));
  }
  
  // Advanced proficiency scoring with multiple factors
  static calculateAdvancedProficiencyScore(metrics) {
    const {
      totalCommits,
      totalPRs,
      repositories,
      languages,
      emptyCommits,
      totalMerges,
      codeQualityRatio,
      collaborationScore,
      communityImpact,
      consistencyScore,
      innovationScore
    } = metrics;
    
    let score = 0;
    
    // Code quality and quantity (25% of total score)
    const commitQuality = totalCommits > 0 ? Math.max(0, (totalCommits - emptyCommits) / totalCommits) : 0;
    const commitQuantityScore = Math.min(totalCommits / 50, 10); // Max 10 points for 500+ commits
    score += (commitQuality * 15 + commitQuantityScore) * 0.25;
    
    // Repository diversity and management (20% of total score)
    const repoDiversity = Math.min(repositories / 5, 10); // Max 10 points for 50+ repos
    const repoQuality = communityImpact > 0 ? Math.min(Math.log10(communityImpact + 1) * 3, 10) : 0;
    score += (repoDiversity + repoQuality) * 0.20;
    
    // Language proficiency and innovation (20% of total score)
    const langProficiency = Math.min(languages / 3, 10); // Max 10 points for 30+ languages
    const innovationPoints = innovationScore / 10; // Convert to 0-10 scale
    score += (langProficiency + innovationPoints) * 0.20;
    
    // Collaboration and community engagement (20% of total score)
    const collaborationPoints = Math.min(collaborationScore, 10);
    const prEngagement = Math.min((totalPRs + totalMerges) / 10, 10);
    score += (collaborationPoints + prEngagement) * 0.20;
    
    // Consistency and reliability (15% of total score)
    const consistencyPoints = consistencyScore / 10; // Convert to 0-10 scale
    const reliabilityBonus = codeQualityRatio > 0.8 ? 2 : codeQualityRatio > 0.6 ? 1 : 0;
    score += (consistencyPoints + reliabilityBonus) * 0.15;
    
    return Math.round(Math.min(score, 100));
  }
}

module.exports = AdvancedAnalytics;