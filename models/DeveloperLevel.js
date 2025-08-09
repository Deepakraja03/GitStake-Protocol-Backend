// Developer level enum with catchy names and scoring criteria
const DeveloperLevels = {
  ROOKIE: {
    name: 'Code Rookie',
    emoji: '🌱',
    minScore: 0,
    maxScore: 20,
    description: 'Just starting the coding journey',
    criteria: {
      commits: { min: 0, max: 50 },
      repos: { min: 0, max: 3 },
      languages: { min: 0, max: 2 },
      prs: { min: 0, max: 5 }
    }
  },
  EXPLORER: {
    name: 'Code Explorer',
    emoji: '🔍',
    minScore: 21,
    maxScore: 35,
    description: 'Exploring different technologies and building foundations',
    criteria: {
      commits: { min: 51, max: 150 },
      repos: { min: 4, max: 8 },
      languages: { min: 2, max: 4 },
      prs: { min: 6, max: 15 }
    }
  },
  BUILDER: {
    name: 'Code Builder',
    emoji: '🔨',
    minScore: 36,
    maxScore: 50,
    description: 'Building solid projects and gaining momentum',
    criteria: {
      commits: { min: 151, max: 400 },
      repos: { min: 9, max: 15 },
      languages: { min: 3, max: 6 },
      prs: { min: 16, max: 35 }
    }
  },
  CRAFTSMAN: {
    name: 'Code Craftsman',
    emoji: '⚡',
    minScore: 51,
    maxScore: 65,
    description: 'Crafting quality code with growing expertise',
    criteria: {
      commits: { min: 401, max: 800 },
      repos: { min: 16, max: 25 },
      languages: { min: 4, max: 8 },
      prs: { min: 36, max: 70 }
    }
  },
  ARCHITECT: {
    name: 'Code Architect',
    emoji: '🏗️',
    minScore: 66,
    maxScore: 80,
    description: 'Designing complex systems and leading projects',
    criteria: {
      commits: { min: 801, max: 1500 },
      repos: { min: 26, max: 40 },
      languages: { min: 6, max: 10 },
      prs: { min: 71, max: 120 }
    }
  },
  WIZARD: {
    name: 'Code Wizard',
    emoji: '🧙‍♂️',
    minScore: 81,
    maxScore: 90,
    description: 'Mastering multiple domains with exceptional skills',
    criteria: {
      commits: { min: 1501, max: 3000 },
      repos: { min: 41, max: 60 },
      languages: { min: 8, max: 12 },
      prs: { min: 121, max: 200 }
    }
  },
  LEGEND: {
    name: 'Code Legend',
    emoji: '👑',
    minScore: 91,
    maxScore: 95,
    description: 'Legendary contributor with massive impact',
    criteria: {
      commits: { min: 3001, max: 5000 },
      repos: { min: 61, max: 100 },
      languages: { min: 10, max: 15 },
      prs: { min: 201, max: 350 }
    }
  },
  TITAN: {
    name: 'Code Titan',
    emoji: '🚀',
    minScore: 96,
    maxScore: 100,
    description: 'Titan of code - reshaping the development world',
    criteria: {
      commits: { min: 5001, max: Infinity },
      repos: { min: 101, max: Infinity },
      languages: { min: 12, max: Infinity },
      prs: { min: 351, max: Infinity }
    }
  }
};

// Function to determine developer level based on analytics
const getDeveloperLevel = (analytics) => {
  const { totalCommits, repoCount, programmingLanguages, totalPRs, proficiencyScore } = analytics;
  
  // Calculate composite score based on multiple factors
  let score = proficiencyScore || 0;
  
  // Bonus points for exceptional metrics
  if (totalCommits > 1000) score += 5;
  if (repoCount > 20) score += 5;
  if (programmingLanguages.length > 5) score += 5;
  if (totalPRs > 50) score += 5;
  
  // Find matching level
  for (const [key, level] of Object.entries(DeveloperLevels)) {
    if (score >= level.minScore && score <= level.maxScore) {
      return {
        level: key,
        ...level,
        currentScore: score
      };
    }
  }
  
  // Default to ROOKIE if no match
  return {
    level: 'ROOKIE',
    ...DeveloperLevels.ROOKIE,
    currentScore: score
  };
};

// Function to get next level information
const getNextLevel = (currentLevel) => {
  const levels = Object.keys(DeveloperLevels);
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex < levels.length - 1) {
    const nextLevelKey = levels[currentIndex + 1];
    return {
      level: nextLevelKey,
      ...DeveloperLevels[nextLevelKey]
    };
  }
  
  return null; // Already at max level
};

module.exports = {
  DeveloperLevels,
  getDeveloperLevel,
  getNextLevel
};