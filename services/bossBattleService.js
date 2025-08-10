const axios = require('axios');
const BossBattle = require('../models/BossBattle');
const GitHubUser = require('../models/GitHubUser');
const { DeveloperLevels, getNextLevel } = require('../models/DeveloperLevel');
const moment = require('moment');

class BossBattleService {
  constructor() {
    this.pollinationsApiUrl = process.env.POLLINATIONS_API_URL;
    this.bossThemes = [
      'ancient-dragon', 'cyber-overlord', 'quantum-guardian', 'code-demon',
      'algorithm-titan', 'data-kraken', 'logic-sphinx', 'binary-phoenix'
    ];
  }

  /**
   * Create a personalized boss battle for a user
   */
  async createBossBattle(username, email) {
    try {
      // Get user data
      const user = await GitHubUser.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has an active boss battle
      const activeBattle = await BossBattle.findOne({
        username,
        status: { $in: ['initiated', 'facing'] }
      });

      if (activeBattle) {
        throw new Error('User already has an active boss battle');
      }

      // Determine target level (one level higher than current)
      const currentLevel = user.developerLevel.level;
      const nextLevelInfo = getNextLevel(currentLevel);

      if (!nextLevelInfo) {
        throw new Error('User is already at maximum level');
      }

      // Generate personalized boss battle
      const battleData = await this.generatePersonalizedBattle(user, nextLevelInfo);

      // Create battle ID
      const battleId = BossBattle.generateBattleId(username, nextLevelInfo.level);

      // Set expiration (72 hours from now)
      const expiresAt = moment().add(72, 'hours').toDate();

      const bossBattle = new BossBattle({
        battleId,
        username,
        email,
        ...battleData,
        currentDeveloperLevel: currentLevel,
        targetDeveloperLevel: nextLevelInfo.level,
        schedule: {
          createdAt: new Date(),
          expiresAt,
          timeLimit: 72
        },
        status: 'initiated'
      });

      await bossBattle.save();
      return bossBattle;

    } catch (error) {
      console.error('Boss Battle Creation Error:', error.message);
      throw error;
    }
  }

  /**
   * Generate personalized boss battle using AI
   */
  async generatePersonalizedBattle(user, targetLevel) {
    try {
      console.log(`🎯 Generating personalized boss battle for ${user.username} (${user.developerLevel.level} → ${targetLevel.level})`);

      const prompt = this.createBossPrompt(user, targetLevel);
      let battleData = await this.callAIForBossBattle(prompt);

      // Validate the generated boss battle
      const isValid = await this.validateBossBattle(battleData);
      if (!isValid) {
        console.log('⚠️ Generated boss battle failed validation, regenerating...');

        // Try once more with enhanced prompt
        const enhancedPrompt = this.createEnhancedBossPrompt(user, targetLevel);
        try {
          battleData = await this.callAIForBossBattle(enhancedPrompt);
          const secondValidation = await this.validateBossBattle(battleData);
          if (!secondValidation) {
            throw new Error('Second generation also failed validation');
          }
        } catch (retryError) {
          console.log('⚠️ Retry failed, using fallback boss battle');
          battleData = this.generateFallbackBossBattle(user, targetLevel);
        }
      }

      // Enhance the boss battle with additional data
      battleData = await this.enhanceBossBattle(battleData, user, targetLevel);

      console.log(`✅ Boss battle generated successfully: ${battleData.title}`);
      return battleData;

    } catch (error) {
      console.error('AI Boss Battle Generation Error:', error.message);
      return this.generateFallbackBossBattle(user, targetLevel);
    }
  }

  /**
   * Create AI prompt for boss battle generation
   */
  createBossPrompt(user, targetLevel) {
    const userStrengths = user.aiInsights?.strengths?.join(', ') || 'General programming';
    const languages = this.getPreferredLanguages(user).join(', ') || 'JavaScript';
    const theme = this.bossThemes[Math.floor(Math.random() * this.bossThemes.length)];
    const complexityLevel = this.getDifficultyGuidelines(targetLevel.level);

    // Generate random elements for uniqueness
    const randomSeed = Math.floor(Math.random() * 10000);
    const randomProblemTypes = this.getRandomProblemTypes(targetLevel.level);
    const randomScenarios = this.getRandomScenarios(theme);
    const randomConstraints = this.getRandomConstraints(targetLevel.level);

    return `
🎯 BOSS BATTLE CHALLENGE GENERATOR 🎯
Random Seed: ${randomSeed} (Use this for unique generation)

MISSION: Create a COMPLETELY UNIQUE and CHALLENGING coding problem for ${user.username}

DEVELOPER INTELLIGENCE:
- Current Mastery: ${user.developerLevel.name} (${user.developerLevel.level})
- Advancement Target: ${targetLevel.name} (${targetLevel.level})
- Core Strengths: ${userStrengths}
- Language Preferences: ${languages}
- Coding Experience: ${user.analytics.totalCommits} commits across ${user.analytics.repoCount} repositories
- Skill Rating: ${user.analytics.proficiencyScore}/100

BOSS BATTLE PARAMETERS:
- Epic Theme: ${theme}
- Challenge Complexity: ${complexityLevel.difficulty}
- Expected Solve Time: ${complexityLevel.duration}
- Algorithm Complexity: ${complexityLevel.complexity}
- Code Length Target: ${complexityLevel.codeLength}
- Skill Focus Areas: ${complexityLevel.focusAreas.join(', ')}

RANDOMIZATION REQUIREMENTS:
- Problem Type Options: ${randomProblemTypes.join(', ')}
- Scenario Variations: ${randomScenarios.join(', ')}
- Constraint Modifiers: ${randomConstraints.join(', ')}
- Use Random Seed ${randomSeed} to ensure uniqueness
- Generate NEVER-BEFORE-SEEN problem combinations
- Create original examples with unique data patterns

CRITICAL GENERATION RULES:
1. UNIQUENESS: Every problem must be completely original and never repeated
2. CORRECTNESS: Provide mathematically sound examples with verified solutions
3. TESTABILITY: Include comprehensive test cases that validate the solution
4. SCALABILITY: Design problems that work with various input sizes
5. CLARITY: Write crystal-clear problem descriptions with no ambiguity

VALIDATION REQUIREMENTS:
- Provide 5+ diverse test cases with expected outputs
- Include edge cases (empty input, single element, maximum constraints)
- Verify all examples are mathematically correct
- Ensure solution is achievable within time/complexity limits
- Test cases must cover all possible scenarios

Create a JSON response with this EXACT structure:
{
  "title": "Epic boss battle title with ${theme} theme",
  "description": "Engaging description of the boss battle challenge",
  "theme": "${theme}",
  "duration": "${complexityLevel.duration}",
  "difficulty": "Boss",
  "challengeType": "boss-challenge",
  "techStack": ["${languages.split(',')[0].trim()}", "additional language if needed"],
  "problemStatement": {
    "description": "Clear, unambiguous problem description with specific requirements",
    "bossStory": "Epic narrative connecting the ${theme} theme to the coding challenge",
    "examples": [
      {
        "input": "concrete example input with actual data",
        "output": "mathematically correct expected output",
        "explanation": "step-by-step explanation of the solution process"
      },
      {
        "input": "different example with edge case consideration",
        "output": "verified correct output",
        "explanation": "detailed reasoning for this test case"
      },
      {
        "input": "complex example testing algorithm limits",
        "output": "precisely calculated expected result",
        "explanation": "comprehensive explanation of the approach"
      }
    ],
    "constraints": [${randomConstraints.map(c => `"${c}"`).join(', ')}],
    "edgeCases": ["empty input handling", "single element case", "maximum constraint boundary", "minimum constraint boundary"],
    "bossRequirements": ["specific algorithmic approach requirement", "performance optimization requirement", "code quality standard"],
    "testCases": [
      {
        "input": "comprehensive test case 1",
        "expectedOutput": "verified output 1",
        "description": "tests basic functionality"
      },
      {
        "input": "comprehensive test case 2", 
        "expectedOutput": "verified output 2",
        "description": "tests edge case handling"
      },
      {
        "input": "comprehensive test case 3",
        "expectedOutput": "verified output 3", 
        "description": "tests performance under constraints"
      },
      {
        "input": "comprehensive test case 4",
        "expectedOutput": "verified output 4",
        "description": "tests algorithm correctness"
      },
      {
        "input": "comprehensive test case 5",
        "expectedOutput": "verified output 5",
        "description": "tests boundary conditions"
      }
    ]
  },
  "starterCode": {
    "language": "${languages.split(',')[0].trim()}",
    "code": "// Starter code template with helpful comments\\nfunction solveBoss(input) {\\n  // Parse input\\n  // Implement your solution here\\n  // Return the result\\n}",
    "template": "function solveBoss(input) { /* Your epic solution here */ }"
  },
  "solution": {
    "code": "// Complete, working solution that passes all test cases",
    "explanation": "Detailed explanation of the algorithm and approach",
    "timeComplexity": "${complexityLevel.complexity}",
    "spaceComplexity": "Appropriate space complexity for the solution"
  },
  "evaluationCriteria": {
    "correctness": { "weight": 0.4, "maxScore": 40 },
    "efficiency": { "weight": 0.25, "maxScore": 25 },
    "codeQuality": { "weight": 0.2, "maxScore": 20 },
    "bossChallenge": { "weight": 0.15, "maxScore": 15 }
  },
  "learningObjectives": ["master ${complexityLevel.focusAreas[0]}", "improve ${complexityLevel.focusAreas[1]}", "develop ${targetLevel.level} level skills"],
  "bossPerks": {
    "experiencePoints": ${500 + (Math.floor(Math.random() * 300))},
    "skillBoosts": [
      { "skill": "${complexityLevel.focusAreas[0]}", "boost": ${10 + Math.floor(Math.random() * 10)} },
      { "skill": "Problem Solving", "boost": ${5 + Math.floor(Math.random() * 10)} }
    ],
    "badges": ["${theme.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())} Challenger", "Boss Battle Participant"],
    "titles": ["${targetLevel.name} Aspirant"],
    "specialAbilities": ["Enhanced ${complexityLevel.focusAreas[0]}", "Advanced Problem Analysis"]
  },
  "rewards": {
    "victory": {
      "experiencePoints": ${1000 + (Math.floor(Math.random() * 500))},
      "levelBoost": ${3 + Math.floor(Math.random() * 5)},
      "badges": ["${theme.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())} Conqueror", "Boss Defeated"],
      "titles": ["${targetLevel.name} Achiever"],
      "cryptoReward": ${0.005 + (Math.random() * 0.015)},
      "specialPerks": ["Exclusive ${theme} Badge", "Level Advancement Boost"]
    },
    "participation": {
      "experiencePoints": ${150 + Math.floor(Math.random() * 100)},
      "consolationReward": "Brave Challenger Badge"
    }
  },
  "bossCharacteristics": {
    "name": "Epic boss name incorporating ${theme} theme",
    "description": "Detailed boss description with personality and challenge level",
    "difficulty": "${complexityLevel.difficulty}",
    "specialPowers": ["${randomScenarios[0]} mastery", "${complexityLevel.focusAreas[0]} expertise"],
    "weaknesses": ["vulnerable to optimal algorithms", "defeated by clean, efficient code"],
    "lore": "Rich backstory connecting the boss to the ${theme} theme and coding challenge"
  }
}

CRITICAL: Ensure ALL examples and test cases are mathematically correct and the solution actually works!
Make this EPIC, UNIQUE (Seed: ${randomSeed}), and perfectly tailored for ${user.username}!
`;
  }

  /**
   * Create enhanced AI prompt for boss battle generation (retry attempt)
   */
  createEnhancedBossPrompt(user, targetLevel) {
    const userStrengths = user.aiInsights?.strengths?.join(', ') || 'General programming';
    const languages = this.getPreferredLanguages(user).join(', ') || 'JavaScript';
    const theme = this.bossThemes[Math.floor(Math.random() * this.bossThemes.length)];
    const complexityLevel = this.getDifficultyGuidelines(targetLevel.level);
    const randomSeed = Math.floor(Math.random() * 10000);

    return `
🔥 ENHANCED BOSS BATTLE GENERATOR (RETRY) 🔥

CRITICAL: Previous generation failed validation. Create a PERFECT, COMPLETE boss battle.

USER: ${user.username}
LEVEL TRANSITION: ${user.developerLevel.level} → ${targetLevel.level}
THEME: ${theme}
SEED: ${randomSeed}

MANDATORY REQUIREMENTS:
1. Complete problem statement with clear description
2. Minimum 5 test cases with verified correct outputs
3. Working solution code that passes all test cases
4. Proper constraints and edge cases
5. Boss requirements that make sense

VALIDATION CHECKLIST:
✓ Title exists and is engaging
✓ Description explains the challenge clearly
✓ Problem statement is unambiguous
✓ Examples have input, output, and explanation
✓ Test cases cover edge cases and normal cases
✓ Solution code is complete and functional
✓ Constraints are realistic and testable
✓ Boss requirements are achievable

Generate a MATHEMATICALLY CORRECT and COMPLETE boss battle:

{
  "title": "Epic ${theme} Boss Battle: [Creative Title]",
  "description": "Detailed battle description",
  "theme": "${theme}",
  "duration": "${complexityLevel.duration}",
  "difficulty": "Boss",
  "challengeType": "boss-challenge",
  "techStack": ["${languages.split(',')[0].trim()}"],
  "problemStatement": {
    "description": "Crystal clear problem description with specific requirements",
    "bossStory": "Engaging story connecting ${theme} to the coding challenge",
    "examples": [
      {
        "input": "simple_test_input",
        "output": "mathematically_correct_output",
        "explanation": "step-by-step solution explanation"
      },
      {
        "input": "edge_case_input",
        "output": "verified_edge_case_output", 
        "explanation": "edge case handling explanation"
      }
    ],
    "constraints": ["realistic constraint 1", "realistic constraint 2"],
    "edgeCases": ["empty input", "single element", "maximum size"],
    "bossRequirements": ["specific algorithmic requirement", "performance requirement"],
    "testCases": [
      {
        "input": "test_1_input",
        "expectedOutput": "verified_output_1",
        "description": "basic functionality test"
      },
      {
        "input": "test_2_input",
        "expectedOutput": "verified_output_2",
        "description": "edge case test"
      },
      {
        "input": "test_3_input",
        "expectedOutput": "verified_output_3",
        "description": "performance test"
      },
      {
        "input": "test_4_input",
        "expectedOutput": "verified_output_4",
        "description": "boundary test"
      },
      {
        "input": "test_5_input",
        "expectedOutput": "verified_output_5",
        "description": "complex scenario test"
      }
    ]
  },
  "starterCode": {
    "language": "${languages.split(',')[0].trim()}",
    "code": "function solveBoss(input) {\\n  // Your solution here\\n  return result;\\n}",
    "template": "function solveBoss(input) { /* Your solution */ }"
  },
  "solution": {
    "code": "// COMPLETE working solution that passes ALL test cases\\nfunction solveBoss(input) {\\n  // Actual implementation\\n  return correctResult;\\n}",
    "explanation": "Detailed algorithm explanation",
    "timeComplexity": "${complexityLevel.complexity}",
    "spaceComplexity": "Appropriate space complexity"
  },
  "evaluationCriteria": {
    "correctness": { "weight": 0.4, "maxScore": 40 },
    "efficiency": { "weight": 0.25, "maxScore": 25 },
    "codeQuality": { "weight": 0.2, "maxScore": 20 },
    "bossChallenge": { "weight": 0.15, "maxScore": 15 }
  },
  "bossCharacteristics": {
    "name": "${theme} Boss",
    "description": "Epic boss description",
    "difficulty": "${complexityLevel.difficulty}",
    "specialPowers": ["power 1", "power 2"],
    "weaknesses": ["optimal algorithms", "clean code"],
    "lore": "Boss backstory"
  }
}

CRITICAL: Verify ALL test cases are mathematically correct before responding!
`;
  }

  /**
   * Call AI service for boss battle generation
   */
  async callAIForBossBattle(prompt) {
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
        timeout: 60000,
      });

      let rawContent;
      if (response.data?.choices?.[0]?.message?.content) {
        rawContent = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        rawContent = response.data;
      } else {
        rawContent = JSON.stringify(response.data);
      }

      // Parse JSON response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid AI response format');

    } catch (error) {
      console.error('AI Boss Battle API Error:', error.message);
      throw error;
    }
  }

  /**
   * Start a boss battle (change status from initiated to facing)
   */
  async startBossBattle(battleId, username) {
    try {
      const battle = await BossBattle.findOne({ battleId, username });

      if (!battle) {
        throw new Error('Boss battle not found');
      }

      if (battle.status !== 'initiated') {
        throw new Error('Boss battle cannot be started');
      }

      if (battle.isExpired()) {
        battle.status = 'expired';
        await battle.save();
        throw new Error('Boss battle has expired');
      }

      battle.status = 'facing';
      battle.schedule.startedAt = new Date();
      await battle.save();

      return battle;

    } catch (error) {
      console.error('Start Boss Battle Error:', error.message);
      throw error;
    }
  }

  /**
   * Submit solution for boss battle
   */
  async submitBossSolution(battleId, username, solution) {
    try {
      const battle = await BossBattle.findOne({ battleId, username });

      if (!battle) {
        throw new Error('Boss battle not found');
      }

      if (battle.status !== 'facing') {
        throw new Error('Boss battle is not active');
      }

      if (battle.isExpired()) {
        battle.status = 'expired';
        await battle.save();
        throw new Error('Boss battle has expired');
      }

      if (battle.battleData.attempts >= battle.battleData.maxAttempts) {
        battle.status = 'lost';
        await battle.save();
        throw new Error('Maximum attempts exceeded');
      }

      // Increment attempts
      battle.battleData.attempts += 1;
      battle.battleData.solution = solution;
      battle.battleData.submittedAt = new Date();

      // Initialize submission history if not exists
      if (!battle.battleData.submissionHistory) {
        battle.battleData.submissionHistory = [];
      }

      // AI-powered solution evaluation
      console.log(`🎯 Evaluating solution for ${username} (Attempt ${battle.battleData.attempts})`);

      const evaluationResult = await this.getDetailedEvaluation(battle, solution);
      battle.battleData.score = evaluationResult.score;
      battle.battleData.feedback = evaluationResult.feedback;
      battle.battleData.evaluation = evaluationResult; // Store full evaluation

      // Determine if boss is defeated (score >= 70)
      const victoryThreshold = 70;
      if (evaluationResult.score >= victoryThreshold) {
        battle.status = 'won';
        battle.battleData.bossDefeated = true;
        battle.schedule.completedAt = new Date();

        console.log(`🎉 BOSS DEFEATED! ${username} scored ${evaluationResult.score}/100`);

        // Award perks to user
        await this.awardBossPerks(username, battle);
      } else if (battle.battleData.attempts >= battle.battleData.maxAttempts) {
        battle.status = 'lost';
        battle.schedule.completedAt = new Date();

        console.log(`💀 Boss battle lost. ${username} final score: ${evaluationResult.score}/100`);
      } else {
        console.log(`⚔️ Battle continues. ${username} scored ${evaluationResult.score}/100 (Attempt ${battle.battleData.attempts}/${battle.battleData.maxAttempts})`);
      }

      // Add to submission history
      battle.battleData.submissionHistory.push({
        attempt: battle.battleData.attempts,
        solution: solution,
        score: evaluationResult.score,
        feedback: evaluationResult.feedback,
        submittedAt: new Date()
      });

      await battle.save();
      return battle;

    } catch (error) {
      console.error('Submit Boss Solution Error:', error.message);
      throw error;
    }
  }

  /**
   * Award perks to user for boss battle completion
   */
  async awardBossPerks(username, battle) {
    try {
      const user = await GitHubUser.findOne({ username });
      if (!user) return;

      const isVictory = battle.status === 'won';
      const rewards = isVictory ? battle.rewards.victory : battle.rewards.participation;

      // Update perks
      user.perks.totalExperiencePoints += rewards.experiencePoints || 0;

      if (isVictory) {
        user.perks.bossBattlesWon += 1;
        user.perks.currentStreak += 1;
        user.perks.longestStreak = Math.max(user.perks.longestStreak, user.perks.currentStreak);
      } else {
        user.perks.bossBattlesLost += 1;
        user.perks.currentStreak = 0;
      }

      // Add badges
      if (rewards.badges) {
        rewards.badges.forEach(badgeName => {
          const existingBadge = user.perks.badges.find(b => b.name === badgeName);
          if (!existingBadge) {
            user.perks.badges.push({
              name: badgeName,
              description: `Earned from boss battle: ${battle.title}`,
              earnedAt: new Date(),
              rarity: isVictory ? 'epic' : 'common'
            });
          }
        });
      }

      // Add titles
      if (rewards.titles) {
        rewards.titles.forEach(titleName => {
          const existingTitle = user.perks.titles.find(t => t.name === titleName);
          if (!existingTitle) {
            user.perks.titles.push({
              name: titleName,
              description: `Earned from boss battle: ${battle.title}`,
              earnedAt: new Date(),
              isActive: false
            });
          }
        });
      }

      // Add skill boosts
      if (battle.bossPerks.skillBoosts) {
        battle.bossPerks.skillBoosts.forEach(boost => {
          user.perks.skillBoosts.push({
            skill: boost.skill,
            boost: boost.boost,
            earnedAt: new Date(),
            expiresAt: moment().add(30, 'days').toDate() // 30 days boost
          });
        });
      }

      // Update statistics
      user.perks.statistics.lastActivity = new Date();
      user.perks.statistics.questsCompleted += 1;

      await user.save();

    } catch (error) {
      console.error('Award Boss Perks Error:', error.message);
    }
  }

  /**
   * Get user's boss battles
   */
  async getUserBossBattles(username, status = null) {
    try {
      const query = { username };
      if (status) {
        query.status = status;
      }

      const battles = await BossBattle.find(query)
        .sort({ createdAt: -1 })
        .limit(20);

      return battles;

    } catch (error) {
      console.error('Get User Boss Battles Error:', error.message);
      throw error;
    }
  }

  /**
   * Get random problem types based on developer level
   */
  getRandomProblemTypes(level) {
    const problemTypes = {
      EXPLORER: ['array-manipulation', 'string-processing', 'basic-math', 'simple-sorting', 'counting-problems'],
      BUILDER: ['hash-maps', 'two-pointers', 'sliding-window', 'stack-queue', 'basic-recursion'],
      CRAFTSMAN: ['binary-search', 'tree-traversal', 'dynamic-programming', 'graph-basics', 'greedy-algorithms'],
      ARCHITECT: ['advanced-dp', 'graph-algorithms', 'system-design', 'optimization', 'complex-data-structures'],
      WIZARD: ['advanced-graphs', 'mathematical-algorithms', 'string-algorithms', 'computational-geometry', 'advanced-optimization'],
      LEGEND: ['research-algorithms', 'advanced-mathematics', 'complex-optimizations', 'novel-approaches', 'theoretical-problems'],
      TITAN: ['cutting-edge-algorithms', 'academic-research', 'breakthrough-solutions', 'theoretical-limits', 'innovation-challenges']
    };

    const types = problemTypes[level] || problemTypes.BUILDER;
    return this.shuffleArray([...types]).slice(0, 3);
  }

  /**
   * Get random scenarios based on theme
   */
  getRandomScenarios(theme) {
    const scenarios = {
      'ancient-dragon': ['treasure-hunting', 'dragon-lair-navigation', 'magical-spell-casting', 'ancient-rune-decoding', 'dragon-battle-strategy'],
      'cyber-overlord': ['network-infiltration', 'data-encryption', 'system-hacking', 'ai-algorithm-battle', 'digital-fortress-breach'],
      'quantum-guardian': ['quantum-computation', 'parallel-universe-navigation', 'quantum-entanglement', 'probability-manipulation', 'dimensional-travel'],
      'code-demon': ['syntax-corruption-fixing', 'algorithm-debugging', 'performance-optimization', 'code-refactoring', 'bug-elimination'],
      'algorithm-titan': ['computational-challenges', 'efficiency-optimization', 'complexity-reduction', 'algorithmic-innovation', 'performance-mastery'],
      'data-kraken': ['data-structure-manipulation', 'information-extraction', 'pattern-recognition', 'data-transformation', 'knowledge-synthesis'],
      'logic-sphinx': ['logical-puzzle-solving', 'reasoning-challenges', 'pattern-deduction', 'mathematical-proofs', 'logical-optimization'],
      'binary-phoenix': ['bit-manipulation', 'binary-operations', 'low-level-optimization', 'memory-management', 'system-programming']
    };

    const themeScenarios = scenarios[theme] || scenarios['algorithm-titan'];
    return this.shuffleArray([...themeScenarios]).slice(0, 2);
  }

  /**
   * Get random constraints based on developer level
   */
  getRandomConstraints(level) {
    const constraints = {
      EXPLORER: ['1 ≤ n ≤ 100', '1 ≤ value ≤ 1000', 'ASCII characters only', 'Positive integers only'],
      BUILDER: ['1 ≤ n ≤ 1000', '1 ≤ value ≤ 10^4', 'Mixed data types', 'Handle negative numbers'],
      CRAFTSMAN: ['1 ≤ n ≤ 10^4', '1 ≤ value ≤ 10^6', 'Unicode support', 'Handle edge cases'],
      ARCHITECT: ['1 ≤ n ≤ 10^5', '1 ≤ value ≤ 10^9', 'Memory constraints', 'Time complexity limits'],
      WIZARD: ['1 ≤ n ≤ 10^6', '1 ≤ value ≤ 10^12', 'Distributed systems', 'Concurrent processing'],
      LEGEND: ['1 ≤ n ≤ 10^7', '1 ≤ value ≤ 10^15', 'Real-time constraints', 'Fault tolerance'],
      TITAN: ['1 ≤ n ≤ 10^8', '1 ≤ value ≤ 10^18', 'Extreme optimization', 'Theoretical limits']
    };

    const levelConstraints = constraints[level] || constraints.BUILDER;
    return this.shuffleArray([...levelConstraints]).slice(0, 3);
  }

  /**
   * Shuffle array for randomization
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get difficulty guidelines based on developer level
   */
  getDifficultyGuidelines(level) {
    const guidelines = {
      EXPLORER: {
        difficulty: 'Medium',
        duration: '2-3 hours',
        complexity: 'O(n) to O(n log n)',
        codeLength: '30-50 lines',
        focusAreas: ['Basic algorithms', 'Data structures', 'Problem solving']
      },
      BUILDER: {
        difficulty: 'Medium-Hard',
        duration: '3-4 hours',
        complexity: 'O(n log n) preferred',
        codeLength: '50-80 lines',
        focusAreas: ['Hash maps', 'Sets', 'Optimization', 'Edge cases']
      },
      CRAFTSMAN: {
        difficulty: 'Hard',
        duration: '4-5 hours',
        complexity: 'O(n log n) or better',
        codeLength: '80-120 lines',
        focusAreas: ['Trees', 'Graphs', 'Dynamic programming', 'Advanced algorithms']
      },
      ARCHITECT: {
        difficulty: 'Hard-Expert',
        duration: '5-6 hours',
        complexity: 'Highly optimized',
        codeLength: '120-180 lines',
        focusAreas: ['System design', 'Complex algorithms', 'Performance optimization']
      },
      WIZARD: {
        difficulty: 'Expert',
        duration: '6-7 hours',
        complexity: 'Optimal solutions',
        codeLength: '180-250 lines',
        focusAreas: ['Advanced algorithms', 'Mathematical concepts', 'Innovation']
      },
      LEGEND: {
        difficulty: 'Expert-Legendary',
        duration: '7-8 hours',
        complexity: 'Cutting-edge',
        codeLength: '250-350 lines',
        focusAreas: ['Research-level algorithms', 'Novel approaches', 'Complex systems']
      },
      TITAN: {
        difficulty: 'Legendary',
        duration: '8+ hours',
        complexity: 'Theoretical limits',
        codeLength: '350+ lines',
        focusAreas: ['Groundbreaking solutions', 'Academic-level complexity', 'Innovation']
      }
    };

    return guidelines[level] || guidelines.BUILDER;
  }

  /**
   * Helper methods
   */
  getPreferredLanguages(user) {
    return user.analytics.programmingLanguages
      ?.sort((a, b) => b.percentage - a.percentage)
      ?.slice(0, 3)
      ?.map(lang => lang.language) || ['JavaScript'];
  }

  inferWeaknesses(user) {
    // Simple inference based on missing or low-usage languages
    const allLanguages = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'];
    const userLanguages = user.analytics.programmingLanguages?.map(l => l.language) || [];
    return allLanguages.filter(lang => !userLanguages.includes(lang)).slice(0, 3);
  }

  inferCodingStyle(user) {
    const commits = user.analytics.totalCommits || 0;
    const repos = user.analytics.repoCount || 0;

    if (commits > 1000 && repos > 20) return 'prolific';
    if (commits > 500 && repos > 10) return 'consistent';
    if (repos > commits / 10) return 'experimental';
    return 'developing';
  }

  inferChallengePreferences(user) {
    const languages = this.getPreferredLanguages(user);
    const preferences = ['algorithm'];

    if (languages.includes('JavaScript') || languages.includes('Python')) {
      preferences.push('full-stack');
    }
    if (languages.includes('Java') || languages.includes('C++')) {
      preferences.push('system-design');
    }

    return preferences;
  }

  /**
   * Get detailed AI evaluation with full feedback
   */
  async getDetailedEvaluation(battle, solution) {
    try {
      console.log('🎯 Starting AI-only evaluation process...');

      // Step 1: AI Validation - Check if solution passes all test cases
      const validation = await this.aiSolutionValidation(battle, solution);

      if (!validation.isValid) {
        console.log(`❌ Solution failed validation: ${validation.testsPassed}/${validation.totalTests} tests passed`);
        return {
          score: 0,
          feedback: `Solution INVALID: Failed ${validation.totalTests - validation.testsPassed} out of ${validation.totalTests} test cases. ${validation.feedback}`,
          strengths: [],
          improvements: ['Fix failing test cases', 'Ensure solution handles all edge cases', 'Verify algorithm correctness'],
          breakdown: {
            correctness: 0,
            efficiency: 0,
            codeQuality: 0,
            bossChallenge: 0
          },
          bossDefeated: false,
          testCaseResults: validation.executionResults,
          complexityAnalysis: {
            timeComplexity: 'Not analyzed - solution invalid',
            spaceComplexity: 'Not analyzed - solution invalid',
            isOptimal: false
          },
          validationResults: validation,
          evaluatedAt: new Date(),
          aiGenerated: true,
          isValid: false
        };
      }

      console.log(`✅ Solution passed validation: ${validation.testsPassed}/${validation.totalTests} tests passed`);

      // Step 2: AI Evaluation - Detailed scoring for valid solutions
      const evaluationPrompt = this.createEvaluationPrompt(battle, solution);
      const evaluation = await this.callAIForEvaluation(evaluationPrompt);

      return {
        score: this.parseEvaluationScore(evaluation),
        feedback: evaluation.feedback || 'Solution evaluated by AI',
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        breakdown: {
          correctness: evaluation.correctness || 0,
          efficiency: evaluation.efficiency || 0,
          codeQuality: evaluation.codeQuality || 0,
          bossChallenge: evaluation.bossChallenge || 0
        },
        bossDefeated: evaluation.bossDefeated || false,
        testCaseResults: validation.executionResults,
        complexityAnalysis: evaluation.complexityAnalysis || {
          timeComplexity: 'Not analyzed',
          spaceComplexity: 'Not analyzed',
          isOptimal: false
        },
        validationResults: validation,
        evaluatedAt: new Date(),
        aiGenerated: true,
        isValid: true
      };

    } catch (error) {
      console.error('AI Evaluation Error:', error.message);

      // Check if this is a service availability issue
      const isServiceError = error.response?.status >= 500 ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('502') ||
        error.message.includes('503') ||
        error.message.includes('504');

      if (isServiceError) {
        console.log('⚠️ AI service temporarily unavailable - using emergency validation');
        return await this.emergencyValidation(battle, solution);
      }

      // Return error state for other types of errors
      return {
        score: 0,
        feedback: `AI evaluation service error. Cannot validate solution. Error: ${error.message}`,
        strengths: [],
        improvements: ['Retry submission when AI service is available'],
        breakdown: {
          correctness: 0,
          efficiency: 0,
          codeQuality: 0,
          bossChallenge: 0
        },
        bossDefeated: false,
        testCaseResults: [],
        complexityAnalysis: {
          timeComplexity: 'Service unavailable',
          spaceComplexity: 'Service unavailable',
          isOptimal: false
        },
        evaluatedAt: new Date(),
        aiGenerated: false,
        isValid: false,
        serviceError: true
      };
    }
  }

  /**
   * Emergency validation when AI service is unavailable
   * Still maintains strict validation but uses basic syntax/logic checks
   */
  async emergencyValidation(battle, solution) {
    console.log('🚨 Running emergency validation (AI service unavailable)');

    try {
      // Basic syntax validation
      const syntaxCheck = this.validateSyntax(solution);
      if (!syntaxCheck.isValid) {
        return {
          score: 0,
          feedback: `EMERGENCY VALIDATION: Solution has syntax errors. ${syntaxCheck.errors.join(', ')}. Please retry when AI service is available for full validation.`,
          strengths: [],
          improvements: ['Fix syntax errors', 'Retry when AI service is available'],
          breakdown: { correctness: 0, efficiency: 0, codeQuality: 0, bossChallenge: 0 },
          bossDefeated: false,
          testCaseResults: [],
          complexityAnalysis: { timeComplexity: 'Not analyzed', spaceComplexity: 'Not analyzed', isOptimal: false },
          evaluatedAt: new Date(),
          aiGenerated: false,
          isValid: false,
          emergencyMode: true
        };
      }

      // If syntax is valid, give a minimal score but mark as needing AI validation
      return {
        score: 25, // Minimal score for syntactically correct code
        feedback: 'EMERGENCY VALIDATION: Solution appears syntactically correct but could not be fully validated due to AI service unavailability. Please resubmit when service is restored for complete evaluation.',
        strengths: ['Syntactically correct code'],
        improvements: ['Resubmit for full AI validation when service is available'],
        breakdown: { correctness: 10, efficiency: 5, codeQuality: 5, bossChallenge: 5 },
        bossDefeated: false, // Never defeat boss without full AI validation
        testCaseResults: [],
        complexityAnalysis: { timeComplexity: 'Not analyzed', spaceComplexity: 'Not analyzed', isOptimal: false },
        evaluatedAt: new Date(),
        aiGenerated: false,
        isValid: false, // Not fully valid without AI validation
        emergencyMode: true
      };

    } catch (error) {
      console.error('Emergency validation error:', error.message);
      return {
        score: 0,
        feedback: 'Emergency validation failed. AI service unavailable and basic validation encountered errors. Please retry later.',
        strengths: [],
        improvements: ['Retry when AI service is available'],
        breakdown: { correctness: 0, efficiency: 0, codeQuality: 0, bossChallenge: 0 },
        bossDefeated: false,
        testCaseResults: [],
        complexityAnalysis: { timeComplexity: 'Not analyzed', spaceComplexity: 'Not analyzed', isOptimal: false },
        evaluatedAt: new Date(),
        aiGenerated: false,
        isValid: false,
        emergencyMode: true,
        emergencyError: true
      };
    }
  }

  /**
   * Basic syntax validation for emergency mode
   */
  validateSyntax(solution) {
    const errors = [];

    // Check for basic syntax issues
    if (!solution.includes('function') && !solution.includes('=>')) {
      errors.push('No function definition found');
    }

    if (!solution.includes('return')) {
      errors.push('No return statement found');
    }

    // Check for common syntax errors
    const openBraces = (solution.match(/\{/g) || []).length;
    const closeBraces = (solution.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Mismatched braces');
    }

    const openParens = (solution.match(/\(/g) || []).length;
    const closeParens = (solution.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Mismatched parentheses');
    }

    // Check for incomplete statements
    if (solution.includes('JSON.parse(input') && !solution.includes('JSON.parse(input)')) {
      errors.push('Incomplete JSON.parse statement');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create AI prompt for solution evaluation
   */
  createEvaluationPrompt(battle, solution) {
    const testCases = battle.problemStatement.testCases || battle.problemStatement.examples || [];
    const constraints = battle.problemStatement.constraints || [];
    const bossRequirements = battle.problemStatement.bossRequirements || [];

    return `
🤖 ADVANCED CODE EVALUATION SYSTEM 🤖

You are an expert software engineer and algorithm specialist. Evaluate this boss battle solution with mathematical precision and professional standards.

CHALLENGE CONTEXT:
- Battle: ${battle.title}
- Developer Level: ${battle.currentDeveloperLevel} → ${battle.targetDeveloperLevel}
- Theme: ${battle.theme}
- Difficulty: ${battle.difficulty}
- Expected Complexity: ${battle.solution?.timeComplexity || 'Optimal for level'}

PROBLEM SPECIFICATION:
${battle.problemStatement.description}

BOSS REQUIREMENTS (CRITICAL):
${bossRequirements.map(req => `• ${req}`).join('\n')}

CONSTRAINTS TO VERIFY:
${constraints.map(constraint => `• ${constraint}`).join('\n')}

TEST CASES FOR VALIDATION:
${testCases.map((test, index) =>
      `Test ${index + 1}:
  Input: ${test.input}
  Expected Output: ${test.expectedOutput || test.output}
  Purpose: ${test.description || test.explanation || 'Verify correctness'}`
    ).join('\n\n')}

SUBMITTED SOLUTION:
\`\`\`javascript
${solution}
\`\`\`

EVALUATION METHODOLOGY:

1. CORRECTNESS ANALYSIS (40 points):
   - Does the solution produce correct outputs for all test cases?
   - Are edge cases handled properly?
   - Is the algorithm logic sound?
   - Are there any syntax or runtime errors?

2. EFFICIENCY EVALUATION (25 points):
   - What is the time complexity? Is it optimal for the problem?
   - What is the space complexity? Is memory usage reasonable?
   - Are there unnecessary operations or redundant computations?
   - Does it meet the performance requirements for ${battle.targetDeveloperLevel} level?

3. CODE QUALITY ASSESSMENT (20 points):
   - Is the code readable and well-structured?
   - Are variable names meaningful?
   - Is the code properly organized and modular?
   - Are there appropriate comments where needed?
   - Does it follow good programming practices?

4. BOSS CHALLENGE COMPLIANCE (15 points):
   - Does the solution meet all special boss requirements?
   - Are the specific algorithmic approaches used as required?
   - Does it demonstrate mastery appropriate for ${battle.targetDeveloperLevel} level?

SCORING STANDARDS:
- 95-100: Exceptional solution - optimal algorithm, perfect implementation, exemplary code quality
- 85-94: Excellent solution - correct, efficient, well-written with minor room for improvement
- 75-84: Good solution - correct with decent efficiency and code quality
- 65-74: Acceptable solution - works but has optimization or quality issues
- 50-64: Poor solution - partially correct or significant issues
- 25-49: Very poor solution - major flaws but shows some understanding
- 0-24: Failing solution - incorrect, non-functional, or doesn't address the problem

CRITICAL EVALUATION RULES:
1. Test the solution logic against ALL provided test cases
2. Verify mathematical correctness of the algorithm
3. Consider the developer level expectations (${battle.targetDeveloperLevel})
4. Be precise in scoring - each point must be justified
5. Provide constructive, actionable feedback

Respond with this EXACT JSON format:
{
  "score": 87,
  "correctness": 36,
  "efficiency": 23,
  "codeQuality": 18,
  "bossChallenge": 10,
  "feedback": "Comprehensive evaluation explanation with specific details about what works well and what could be improved",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "bossDefeated": true,
  "testCaseResults": [
    {"test": 1, "passed": true, "expected": "expected_output", "actual": "actual_output"},
    {"test": 2, "passed": false, "expected": "expected_output", "actual": "actual_output", "error": "explanation"}
  ],
  "complexityAnalysis": {
    "timeComplexity": "O(n log n)",
    "spaceComplexity": "O(n)",
    "isOptimal": true
  }
}

EVALUATE NOW with mathematical precision and professional expertise:
`;
  }

  /**
   * Call AI service for solution evaluation with retry logic
   */
  async callAIForEvaluation(prompt, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      console.log(`🔄 Calling AI evaluation service (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const response = await axios.post(this.pollinationsApiUrl, {
        messages: [{ role: 'user', content: prompt }],
        model: 'openai-fast',
        private: true,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 45000,
      });

      let rawContent;
      if (response.data?.choices?.[0]?.message?.content) {
        rawContent = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        rawContent = response.data;
      } else {
        rawContent = JSON.stringify(response.data);
      }

      // Parse JSON response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ AI evaluation service responded successfully');
        return result;
      }

      throw new Error('Invalid AI evaluation response format');

    } catch (error) {
      console.error(`❌ AI Evaluation API Error (attempt ${retryCount + 1}):`, error.message);

      // Check if it's a network/service error that might be temporary
      const isRetryableError = error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status >= 500 ||
        error.response?.status === 429;

      if (isRetryableError && retryCount < maxRetries) {
        console.log(`🔄 Retrying AI evaluation in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.callAIForEvaluation(prompt, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Parse evaluation score from AI response
   */
  parseEvaluationScore(evaluation) {
    if (evaluation && typeof evaluation.score === 'number') {
      // Ensure score is within valid range
      return Math.max(0, Math.min(100, evaluation.score));
    }

    // Fallback parsing
    if (evaluation && evaluation.correctness && evaluation.efficiency) {
      const totalScore = (evaluation.correctness || 0) +
        (evaluation.efficiency || 0) +
        (evaluation.codeQuality || 0) +
        (evaluation.bossChallenge || 0);
      return Math.max(0, Math.min(100, totalScore));
    }

    throw new Error('Unable to parse evaluation score');
  }

  /**
   * Basic fallback solution evaluation
   */
  /**
   * AI-only solution validation and execution
   */
  async aiSolutionValidation(battle, solution) {
    try {
      console.log('🤖 Running AI-only solution validation...');

      const validationPrompt = this.createValidationPrompt(battle, solution);
      const validation = await this.callAIForValidation(validationPrompt);

      return {
        isValid: validation.isValid || false,
        executionResults: validation.executionResults || [],
        errors: validation.errors || [],
        score: validation.score || 0,
        feedback: validation.feedback || 'AI validation completed',
        testsPassed: validation.testsPassed || 0,
        totalTests: validation.totalTests || 0
      };

    } catch (error) {
      console.error('AI Solution Validation Error:', error.message);
      return {
        isValid: false,
        executionResults: [],
        errors: ['AI validation service unavailable'],
        score: 0,
        feedback: 'Unable to validate solution - AI service error',
        testsPassed: 0,
        totalTests: 0
      };
    }
  }

  /**
   * Create AI prompt for solution validation and execution
   */
  createValidationPrompt(battle, solution) {
    const testCases = battle.problemStatement.testCases || battle.problemStatement.examples || [];

    return `
🔬 AI CODE EXECUTION & VALIDATION SYSTEM 🔬

You are an advanced code execution engine. Your job is to:
1. Execute the submitted solution against all test cases
2. Validate correctness by comparing outputs
3. Identify any errors or issues
4. Provide a comprehensive validation report

PROBLEM CONTEXT:
${battle.problemStatement.description}

TEST CASES TO EXECUTE:
${testCases.map((test, index) =>
      `Test Case ${index + 1}:
  Input: ${test.input}
  Expected Output: ${test.expectedOutput || test.output}
  Description: ${test.description || 'Verify correctness'}`
    ).join('\n\n')}

SUBMITTED SOLUTION:
\`\`\`javascript
${solution}
\`\`\`

EXECUTION INSTRUCTIONS:
1. Mentally execute the solution for each test case
2. Compare actual output with expected output
3. Identify any runtime errors, logic errors, or exceptions
4. Determine if the solution handles edge cases properly
5. Calculate overall correctness percentage

VALIDATION CRITERIA:
- Solution must pass ALL test cases to be considered valid
- Any test case failure makes the solution invalid
- Runtime errors or exceptions make the solution invalid
- Incorrect outputs make the solution invalid

Respond with this EXACT JSON format:
{
  "isValid": true,
  "executionResults": [
    {
      "testCase": 1,
      "input": "test_input",
      "expectedOutput": "expected_result",
      "actualOutput": "actual_result",
      "passed": true,
      "executionTime": "estimated_ms",
      "error": null
    }
  ],
  "testsPassed": 5,
  "totalTests": 5,
  "errors": [],
  "score": 85,
  "feedback": "Detailed validation feedback",
  "overallResult": "VALID - All test cases passed"
}

CRITICAL RULES:
- If ANY test case fails, set isValid: false
- Execute the code mentally and verify outputs
- Be precise in your execution simulation
- Report exact differences between expected and actual outputs

EXECUTE AND VALIDATE NOW:
`;
  }

  /**
   * Call AI service for solution validation with retry logic
   */
  async callAIForValidation(prompt, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      console.log(`🔄 Calling AI validation service (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const response = await axios.post(this.pollinationsApiUrl, {
        messages: [{ role: 'user', content: prompt }],
        model: 'openai-fast',
        private: true,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 45000, // Reduced timeout
      });

      let rawContent;
      if (response.data?.choices?.[0]?.message?.content) {
        rawContent = response.data.choices[0].message.content;
      } else if (typeof response.data === 'string') {
        rawContent = response.data;
      } else {
        rawContent = JSON.stringify(response.data);
      }

      // Parse JSON response
      const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ AI validation service responded successfully');
        return result;
      }

      throw new Error('Invalid AI validation response format');

    } catch (error) {
      console.error(`❌ AI Validation API Error (attempt ${retryCount + 1}):`, error.message);

      // Check if it's a network/service error that might be temporary
      const isRetryableError = error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.response?.status >= 500 ||
        error.response?.status === 429;

      if (isRetryableError && retryCount < maxRetries) {
        console.log(`🔄 Retrying AI validation in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.callAIForValidation(prompt, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Validate generated boss battle for correctness
   */
  async validateBossBattle(battleData) {
    try {
      console.log('🔍 Validating generated boss battle...');

      // Check required fields
      const requiredFields = ['title', 'description', 'problemStatement', 'solution'];
      for (const field of requiredFields) {
        if (!battleData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate problem statement structure
      const ps = battleData.problemStatement;
      if (!ps.description || !ps.examples || !ps.testCases) {
        throw new Error('Incomplete problem statement structure');
      }

      // Validate test cases
      if (!Array.isArray(ps.testCases) || ps.testCases.length < 3) {
        throw new Error('Insufficient test cases (minimum 3 required)');
      }

      // Check if examples have proper structure
      for (const example of ps.examples) {
        if (!example.input || !example.output || !example.explanation) {
          throw new Error('Invalid example structure');
        }
      }

      // Validate solution exists and is not empty
      if (!battleData.solution.code || battleData.solution.code.trim().length < 50) {
        throw new Error('Solution code is missing or too short');
      }

      console.log('✅ Boss battle validation passed');
      return true;

    } catch (error) {
      console.error('❌ Boss battle validation failed:', error.message);
      return false;
    }
  }

  /**
   * Enhance generated boss battle with additional validation
   */
  async enhanceBossBattle(battleData, user, targetLevel) {
    try {
      // Add missing fields if needed
      if (!battleData.personalizedElements) {
        battleData.personalizedElements = {
          basedOnStrengths: user.aiInsights?.strengths || [],
          basedOnWeaknesses: this.inferWeaknesses(user),
          preferredLanguages: this.getPreferredLanguages(user),
          codingStyle: this.inferCodingStyle(user),
          challengePreferences: this.inferChallengePreferences(user)
        };
      }

      // Ensure test cases are properly formatted
      if (battleData.problemStatement.testCases) {
        battleData.problemStatement.testCases = battleData.problemStatement.testCases.map((test, index) => ({
          input: test.input,
          expectedOutput: test.expectedOutput || test.output,
          description: test.description || `Test case ${index + 1}`,
          testId: `test_${index + 1}`
        }));
      }

      // Add difficulty-appropriate constraints if missing
      if (!battleData.problemStatement.constraints || battleData.problemStatement.constraints.length === 0) {
        const guidelines = this.getDifficultyGuidelines(targetLevel.level);
        battleData.problemStatement.constraints = this.getRandomConstraints(targetLevel.level);
      }

      return battleData;

    } catch (error) {
      console.error('Boss battle enhancement error:', error.message);
      return battleData; // Return original if enhancement fails
    }
  }

  /**
   * Generate fallback boss battle when AI fails
   */
  generateFallbackBossBattle(user, targetLevel) {
    const languages = this.getPreferredLanguages(user);
    const complexityLevel = this.getDifficultyGuidelines(targetLevel.level);

    return {
      title: `Epic Boss Challenge: Rise to ${targetLevel.name}`,
      description: `Face the ultimate coding challenge to prove you're ready for ${targetLevel.name} level!`,
      theme: 'algorithm-titan',
      duration: complexityLevel.duration,
      difficulty: 'Boss',
      challengeType: 'boss-challenge',
      techStack: languages.slice(0, 2),
      problemStatement: {
        description: 'Given an array of integers, find the maximum sum of any contiguous subarray. This classic problem tests your dynamic programming skills and algorithmic thinking.',
        bossStory: 'The Algorithm Titan guards the path to your next developer level. This ancient being challenges all who seek advancement with the legendary Maximum Subarray Problem. Only those who can demonstrate true algorithmic mastery may pass!',
        examples: [
          {
            input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
            output: '6',
            explanation: 'The contiguous subarray [4, -1, 2, 1] has the largest sum = 6'
          },
          {
            input: '[1]',
            output: '1',
            explanation: 'Single element array returns the element itself'
          },
          {
            input: '[5, 4, -1, 7, 8]',
            output: '23',
            explanation: 'The entire array has the maximum sum = 23'
          }
        ],
        constraints: [
          '1 <= array.length <= 10^5',
          '-10^4 <= array[i] <= 10^4',
          'Array contains at least one element'
        ],
        edgeCases: ['Single element', 'All negative numbers', 'All positive numbers', 'Mixed positive and negative'],
        bossRequirements: [
          'Implement optimal O(n) solution using Kadane\'s algorithm',
          'Handle edge cases properly',
          'Write clean, readable code with meaningful variable names'
        ],
        testCases: [
          {
            input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
            expectedOutput: '6',
            description: 'Classic example with mixed positive and negative numbers'
          },
          {
            input: '[1]',
            expectedOutput: '1',
            description: 'Single element edge case'
          },
          {
            input: '[-1, -2, -3, -4]',
            expectedOutput: '-1',
            description: 'All negative numbers - return least negative'
          },
          {
            input: '[1, 2, 3, 4, 5]',
            expectedOutput: '15',
            description: 'All positive numbers - return sum of all'
          },
          {
            input: '[0, -1, 2, -1, 3]',
            expectedOutput: '4',
            description: 'Array with zeros and mixed signs'
          }
        ]
      },
      starterCode: {
        language: languages[0] || 'JavaScript',
        code: `function solveBoss(input) {\n  // Parse the input array\n  const arr = JSON.parse(input);\n  \n  // Implement Kadane's algorithm here\n  // Your solution should handle all edge cases\n  \n  return maxSum;\n}`,
        template: 'function solveBoss(input) { /* Your epic solution here */ }'
      },
      solution: {
        code: `function solveBoss(input) {\n  const arr = JSON.parse(input);\n  \n  if (arr.length === 0) return 0;\n  if (arr.length === 1) return arr[0];\n  \n  let maxSoFar = arr[0];\n  let maxEndingHere = arr[0];\n  \n  for (let i = 1; i < arr.length; i++) {\n    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);\n    maxSoFar = Math.max(maxSoFar, maxEndingHere);\n  }\n  \n  return maxSoFar;\n}`,
        explanation: 'Uses Kadane\'s algorithm to find maximum subarray sum in O(n) time. Maintains running maximum and updates global maximum.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      },
      evaluationCriteria: {
        correctness: { weight: 0.4, maxScore: 40 },
        efficiency: { weight: 0.25, maxScore: 25 },
        codeQuality: { weight: 0.2, maxScore: 20 },
        bossChallenge: { weight: 0.15, maxScore: 15 }
      },
      learningObjectives: [
        'Master dynamic programming concepts',
        'Implement Kadane\'s algorithm',
        'Handle edge cases in array problems'
      ],
      bossPerks: {
        experiencePoints: 400,
        skillBoosts: [
          { skill: 'Dynamic Programming', boost: 12 },
          { skill: 'Algorithm Design', boost: 8 }
        ],
        badges: ['Algorithm Titan Challenger', 'Fallback Warrior'],
        titles: [`${targetLevel.name} Candidate`],
        specialAbilities: ['Enhanced Problem Solving', 'Edge Case Detection']
      },
      rewards: {
        victory: {
          experiencePoints: 800,
          levelBoost: 4,
          badges: ['Algorithm Titan Defeated', 'Dynamic Programming Master'],
          titles: [`${targetLevel.name} Achiever`],
          cryptoReward: 0.008,
          specialPerks: ['Fallback Victory Badge', 'Resilience Bonus']
        },
        participation: {
          experiencePoints: 150,
          consolationReward: 'Determined Challenger Badge'
        }
      },
      bossCharacteristics: {
        name: 'Algorithm Titan',
        description: 'Ancient guardian of algorithmic knowledge, master of dynamic programming and optimization',
        difficulty: 'Legendary',
        specialPowers: ['Dynamic Programming Mastery', 'Optimization Expertise'],
        weaknesses: ['Kadane\'s Algorithm', 'Optimal O(n) solutions'],
        lore: 'The Algorithm Titan has guarded the secrets of efficient algorithms for millennia. Only those who demonstrate true understanding of dynamic programming may advance to the next level.'
      }
    };
  }

  /**
   * Clean up expired boss battles
   */
  async cleanupExpiredBattles() {
    try {
      const expiredBattles = await BossBattle.find({
        status: { $in: ['initiated', 'facing'] },
        'schedule.expiresAt': { $lt: new Date() }
      });

      for (const battle of expiredBattles) {
        battle.status = 'expired';
        await battle.save();
      }

      console.log(`Cleaned up ${expiredBattles.length} expired boss battles`);

    } catch (error) {
      console.error('Cleanup Expired Battles Error:', error.message);
    }
  }
}

module.exports = new BossBattleService();