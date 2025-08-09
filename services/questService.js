const axios = require('axios');
const Quest = require('../models/Quest');
const { DeveloperLevels } = require('../models/DeveloperLevel');
const moment = require('moment');
const sendEmail = require('./emailService');
const { questStakingTemplate, questChallengeTemplate, questResultsTemplate } = require('../templates/questEmailTemplates');

class QuestService {
  constructor() {
    this.pollinationsApiUrl = process.env.POLLINATIONS_API_URL;
    this.cryptoRewardRates = {
      ROOKIE: 0.001,
      EXPLORER: 0.002,
      BUILDER: 0.003,
      CRAFTSMAN: 0.005,
      ARCHITECT: 0.008,
      WIZARD: 0.012,
      LEGEND: 0.020,
      TITAN: 0.050
    };
  }

  /**
   * Generate AI-powered quest based on developer level
   */
  async generateQuest(developerLevel, challengeType = 'algorithm', techStack = ['JavaScript'], theme = 'adventure') {
    try {
      const levelInfo = DeveloperLevels[developerLevel];
      if (!levelInfo) {
        throw new Error(`Invalid developer level: ${developerLevel}`);
      }

      const prompt = this.createQuestPrompt(levelInfo, challengeType, techStack, theme);
      const questData = await this.callAIForQuest(prompt, developerLevel);
      
      // Add schedule and metadata
      const schedule = this.generateWeeklySchedule();
      const questId = this.generateQuestId(developerLevel, schedule.weekNumber, schedule.year);

      const quest = new Quest({
        questId,
        ...questData,
        developerLevel,
        challengeType,
        techStack,
        theme,
        schedule,
        status: 'created'
      });

      await quest.save();
      return quest;
    } catch (error) {
      console.error('Quest generation error:', error.message);
      throw error;
    }
  }

  /**
   * Get difficulty guidelines for each developer level
   */
  getDifficultyGuidelines(level) {
    const guidelines = {
      ROOKIE: {
        duration: '1-2 hours',
        requirements: '- Use basic programming concepts (variables, loops, conditionals)\n- Single function or simple class\n- Clear, step-by-step problem solving\n- Minimal edge cases\n- Focus on syntax and basic logic',
        complexity: '- Time Complexity: O(n) or O(n²) is acceptable\n- Space Complexity: O(1) or O(n)\n- 10-20 lines of code\n- Basic data structures (arrays, strings)',
        specific: 'Perfect for someone just starting their coding journey. Focus on fundamental concepts.'
      },
      EXPLORER: {
        duration: '2-3 hours',
        requirements: '- Combine multiple programming concepts\n- Use basic data structures (arrays, objects)\n- Simple algorithms (sorting, searching)\n- Handle 2-3 edge cases\n- Introduce problem-solving patterns',
        complexity: '- Time Complexity: O(n) to O(n log n)\n- Space Complexity: O(n)\n- 20-40 lines of code\n- Arrays, strings, basic hash maps',
        specific: 'For developers exploring different technologies and building foundations.'
      },
      BUILDER: {
        duration: '2-3 hours',
        requirements: '- Multiple functions or classes\n- Intermediate data structures (hash maps, sets)\n- Algorithm optimization\n- Handle multiple edge cases\n- Code organization and structure',
        complexity: '- Time Complexity: O(n log n) preferred\n- Space Complexity: O(n)\n- 40-60 lines of code\n- Hash maps, sets, basic trees',
        specific: 'For developers building solid projects and gaining momentum.'
      },
      CRAFTSMAN: {
        duration: '3-4 hours',
        requirements: '- Advanced data structures (trees, graphs)\n- Complex algorithms (dynamic programming, recursion)\n- Multiple solution approaches\n- Comprehensive edge case handling\n- Clean, maintainable code',
        complexity: '- Time Complexity: O(n log n) or better\n- Space Complexity: optimized\n- 60-100 lines of code\n- Trees, graphs, advanced algorithms',
        specific: 'For developers crafting quality code with growing expertise.'
      },
      ARCHITECT: {
        duration: '4-5 hours',
        requirements: '- System design elements\n- Multiple interacting components\n- Advanced algorithms and optimizations\n- Scalability considerations\n- Design patterns',
        complexity: '- Time Complexity: highly optimized\n- Space Complexity: trade-off analysis\n- 100-150 lines of code\n- Complex data structures, system design',
        specific: 'For developers designing complex systems and leading projects.'
      },
      WIZARD: {
        duration: '4-6 hours',
        requirements: '- Multi-faceted problem solving\n- Advanced algorithms (graph algorithms, advanced DP)\n- Performance optimization\n- Multiple solution strategies\n- Code elegance and efficiency',
        complexity: '- Time Complexity: optimal solutions required\n- Space Complexity: memory-efficient\n- 150-200 lines of code\n- Advanced algorithms, complex optimizations',
        specific: 'For developers mastering multiple domains with exceptional skills.'
      },
      LEGEND: {
        duration: '5-7 hours',
        requirements: '- Highly complex problem solving\n- Advanced mathematical concepts\n- Multiple optimization techniques\n- Innovative approaches\n- Production-ready code quality',
        complexity: '- Time Complexity: cutting-edge optimizations\n- Space Complexity: minimal memory usage\n- 200-300 lines of code\n- Advanced mathematics, complex algorithms',
        specific: 'For legendary contributors with massive impact.'
      },
      TITAN: {
        duration: '6-8 hours',
        requirements: '- Research-level problem complexity\n- Novel algorithmic approaches\n- System-level optimizations\n- Multiple interconnected solutions\n- Industry-leading code quality',
        complexity: '- Time Complexity: theoretical limits\n- Space Complexity: optimal usage\n- 300+ lines of code\n- Cutting-edge algorithms, research-level complexity',
        specific: 'For titans of code reshaping the development world.'
      }
    };

    return guidelines[level] || guidelines.ROOKIE;
  }

  /**
   * Get random problem variations for diversity
   */
  getRandomProblemVariations(challengeType, level) {
    const variations = {
      algorithm: {
        ROOKIE: [
          'Find the largest number in an array',
          'Count occurrences of a character in a string',
          'Reverse a string without using built-in methods',
          'Check if a number is even or odd',
          'Sum all numbers in an array',
          'Find the first duplicate in an array',
          'Convert temperature between Celsius and Fahrenheit'
        ],
        EXPLORER: [
          'Find the second largest element in an array',
          'Check if two strings are anagrams',
          'Implement a simple calculator',
          'Find all pairs that sum to a target',
          'Remove duplicates from an array',
          'Implement basic string compression',
          'Find the missing number in a sequence'
        ],
        BUILDER: [
          'Implement a hash table with collision handling',
          'Find the longest palindromic substring',
          'Merge two sorted arrays efficiently',
          'Implement a basic LRU cache',
          'Find all permutations of a string',
          'Detect cycle in a linked list',
          'Implement binary search with variations'
        ],
        CRAFTSMAN: [
          'Design a rate limiter algorithm',
          'Implement efficient string matching',
          'Build a trie data structure',
          'Solve the knapsack problem variants',
          'Implement graph traversal algorithms',
          'Design a consistent hashing system',
          'Optimize matrix multiplication'
        ],
        ARCHITECT: [
          'Design a distributed cache system',
          'Implement advanced graph algorithms',
          'Build a load balancing algorithm',
          'Design a recommendation system',
          'Implement advanced tree structures',
          'Create a database indexing system',
          'Design a search engine ranking algorithm'
        ],
        WIZARD: [
          'Implement advanced machine learning algorithms',
          'Design a distributed consensus protocol',
          'Build a compiler optimization system',
          'Create advanced cryptographic algorithms',
          'Implement quantum computing simulations',
          'Design neural network architectures',
          'Build advanced data compression algorithms'
        ],
        LEGEND: [
          'Design a novel distributed system architecture',
          'Implement cutting-edge AI algorithms',
          'Create revolutionary data structures',
          'Build advanced blockchain consensus mechanisms',
          'Design next-generation database systems',
          'Implement breakthrough optimization algorithms',
          'Create novel security protocols'
        ],
        TITAN: [
          'Pioneer new computational paradigms',
          'Design revolutionary system architectures',
          'Create groundbreaking algorithmic innovations',
          'Build next-generation computing frameworks',
          'Design futuristic data processing systems',
          'Implement theoretical computer science breakthroughs',
          'Create paradigm-shifting software architectures'
        ]
      },
      'data-structure': {
        ROOKIE: [
          'Implement a simple stack using arrays',
          'Create a basic queue implementation',
          'Build a simple linked list',
          'Implement array-based operations',
          'Create a basic hash map',
          'Build a simple binary tree',
          'Implement basic sorting algorithms'
        ],
        EXPLORER: [
          'Implement a dynamic array with resizing',
          'Create a circular queue',
          'Build a doubly linked list',
          'Implement a priority queue',
          'Create a basic graph representation',
          'Build a simple heap structure',
          'Implement efficient searching algorithms'
        ],
        BUILDER: [
          'Design a self-balancing binary search tree',
          'Implement advanced hash table techniques',
          'Create efficient graph algorithms',
          'Build a segment tree structure',
          'Implement advanced sorting algorithms',
          'Design a disjoint set data structure',
          'Create efficient string data structures'
        ],
        CRAFTSMAN: [
          'Implement advanced tree structures (B-trees, Red-Black)',
          'Design efficient graph data structures',
          'Create advanced hashing techniques',
          'Build specialized data structures for specific problems',
          'Implement advanced heap variants',
          'Design efficient concurrent data structures',
          'Create memory-efficient data structures'
        ],
        ARCHITECT: [
          'Design distributed data structures',
          'Implement advanced concurrent data structures',
          'Create cache-efficient data structures',
          'Build specialized database structures',
          'Design fault-tolerant data structures',
          'Implement advanced indexing structures',
          'Create scalable data structure architectures'
        ],
        WIZARD: [
          'Design novel data structure paradigms',
          'Implement advanced persistent data structures',
          'Create lock-free concurrent structures',
          'Build quantum-inspired data structures',
          'Design advanced compression structures',
          'Implement cutting-edge indexing systems',
          'Create revolutionary storage architectures'
        ],
        LEGEND: [
          'Pioneer new data structure concepts',
          'Design breakthrough storage systems',
          'Create revolutionary indexing paradigms',
          'Build next-generation data architectures',
          'Design futuristic data organization systems',
          'Implement theoretical data structure advances',
          'Create paradigm-shifting data models'
        ],
        TITAN: [
          'Revolutionize data structure theory',
          'Design unprecedented storage paradigms',
          'Create groundbreaking data organization concepts',
          'Build revolutionary information architectures',
          'Design next-era data management systems',
          'Implement theoretical breakthroughs in data structures',
          'Create world-changing data paradigms'
        ]
      }
    };

    const typeVariations = variations[challengeType] || variations.algorithm;
    const levelVariations = typeVariations[level] || typeVariations.ROOKIE;
    
    return levelVariations[Math.floor(Math.random() * levelVariations.length)];
  }

  /**
   * Create AI prompt for quest generation
   */
  createQuestPrompt(levelInfo, challengeType, techStack, theme) {
    const randomProblemHint = this.getRandomProblemVariations(challengeType, levelInfo.level || 'ROOKIE');
    const randomSeed = Math.floor(Math.random() * 10000);
    
    const developerLevelsEnum = `
const DeveloperLevels = {
  ROOKIE: { name: 'Code Rookie', emoji: '🌱', minScore: 0, maxScore: 20, description: 'Just starting the coding journey' },
  EXPLORER: { name: 'Code Explorer', emoji: '🔍', minScore: 21, maxScore: 35, description: 'Exploring technologies and building foundations' },
  BUILDER: { name: 'Code Builder', emoji: '🔨', minScore: 36, maxScore: 50, description: 'Building solid projects and gaining momentum' },
  CRAFTSMAN: { name: 'Code Craftsman', emoji: '⚡', minScore: 51, maxScore: 65, description: 'Crafting quality code with growing expertise' },
  ARCHITECT: { name: 'Code Architect', emoji: '🏗️', minScore: 66, maxScore: 80, description: 'Designing complex systems and leading projects' },
  WIZARD: { name: 'Code Wizard', emoji: '🧙‍♂️', minScore: 81, maxScore: 90, description: 'Mastering multiple domains with exceptional skills' },
  LEGEND: { name: 'Code Legend', emoji: '👑', minScore: 91, maxScore: 95, description: 'Legendary contributor with massive impact' },
  TITAN: { name: 'Code Titan', emoji: '🚀', minScore: 96, maxScore: 100, description: 'Titan of code - reshaping the development world' }
};`;

    const jsonTemplate = `{
  "title": "string - catchy title with level emoji",
  "description": "string - engaging story with learning objectives",
  "difficulty": "string - Easy|Medium|Hard|Expert|Legendary",
  "duration": "string - time estimate",
  "problemStatement": {
    "description": "string - detailed problem description",
    "examples": [
      {
        "input": "string - example input",
        "output": "string - expected output",
        "explanation": "string - why this output"
      }
    ],
    "constraints": ["string - problem constraints"],
    "edgeCases": ["string - edge cases to consider"]
  },
  "starterCode": {
    "language": "string - programming language",
    "code": "string - starter code template",
    "template": "string - function signature"
  },
  "solution": {
    "code": "string - complete solution",
    "explanation": "string - solution explanation",
    "timeComplexity": "string - Big O time",
    "spaceComplexity": "string - Big O space"
  },
  "evaluationCriteria": {
    "correctness": { "weight": 40, "maxScore": ${levelInfo.maxScore} },
    "efficiency": { "weight": 30, "maxScore": ${levelInfo.maxScore} },
    "codeQuality": { "weight": 20, "maxScore": ${levelInfo.maxScore} },
    "creativity": { "weight": 10, "maxScore": ${levelInfo.maxScore} }
  },
  "learningObjectives": ["string - what developers will learn"],
  "achievements": [
    {
      "name": "string - achievement name",
      "description": "string - achievement description",
      "condition": "string - how to unlock",
      "points": "number - bonus points"
    }
  ],
  "rewards": {
    "winner": {
      "points": ${levelInfo.maxScore * 10},
      "badge": "string - winner badge name",
      "title": "string - special title",
      "cryptoAmount": ${this.cryptoRewardRates[levelInfo.level || 'ROOKIE'] * 3}
    },
    "participation": {
      "points": ${levelInfo.maxScore * 2},
      "badge": "string - participation badge",
      "cryptoAmount": ${this.cryptoRewardRates[levelInfo.level || 'ROOKIE']}
    }
  }
}`;

    const difficultyGuidelines = this.getDifficultyGuidelines(levelInfo.level || 'ROOKIE');
    
    return `You are an expert coding challenge designer for GitStake platform. Generate a UNIQUE and DIVERSE coding quest using the following JSON template structure exactly. Do not add or remove fields. Ensure the quest is engaging, educational, and scaled to the specified developer level.

RANDOMIZATION SEED: ${randomSeed}
PROBLEM INSPIRATION: "${randomProblemHint}" (Use this as inspiration but create a unique variation)

Developer Levels Enum:
${developerLevelsEnum}

JSON Template:
${jsonTemplate}

Generate one UNIQUE quest based on these parameters:
- Developer Level: ${levelInfo.name} (${levelInfo.emoji}) - ${levelInfo.description}
- Score Range: ${levelInfo.minScore}-${levelInfo.maxScore}
- Challenge Type: ${challengeType}
- Tech Stack: ${techStack.join(', ')}
- Theme: ${theme}
- Duration: ${difficultyGuidelines.duration}
- Random Seed: ${randomSeed} (use this to ensure uniqueness)

CRITICAL UNIQUENESS REQUIREMENTS:
- Create a COMPLETELY UNIQUE problem statement that has never been seen before
- Use the problem inspiration "${randomProblemHint}" as a starting point but make it original
- Incorporate the ${theme} theme creatively into the problem narrative
- Ensure the problem is different from common coding interview questions
- Add unique twists or constraints that make this problem special
- Create original examples that are not typical textbook cases

DIFFICULTY SCALING REQUIREMENTS:
${difficultyGuidelines.requirements}

PROBLEM COMPLEXITY GUIDELINES:
${difficultyGuidelines.complexity}

STORY AND THEME INTEGRATION:
- Weave the "${theme}" theme throughout the problem description
- Create an engaging narrative that makes the problem memorable
- Use creative variable names and scenarios that fit the theme
- Make the problem feel like an adventure, not just a coding exercise

Requirements:
1. Make the title catchy and tied to the level's name/emoji (e.g., '${levelInfo.name}'s ${theme} Challenge ${levelInfo.emoji}')
2. The description should include a fun ${theme}-themed story, learning objectives, and tie into the level's description
3. Provide realistic starter code in ${techStack[0]} language with ${theme}-appropriate variable names
4. Create detailed problem statement with UNIQUE examples and edge cases
5. Include complete solution with explanation and complexity analysis
6. Ensure evaluation criteria align with the level's score range
7. Make it solvable within the specified duration
8. Add gamification elements like achievements that fit the ${theme} theme
9. Scale complexity appropriately for ${levelInfo.name} level

For ${levelInfo.name} level specifically:
- Complexity should match someone who is "${levelInfo.description}"
- Problem difficulty should be appropriate for score range ${levelInfo.minScore}-${levelInfo.maxScore}
- Learning objectives should help progress toward the next level
- ${difficultyGuidelines.specific}

UNIQUENESS VERIFICATION:
- Ensure this problem has never been created before
- Make the problem statement completely original
- Use creative constraints and requirements
- Incorporate unexpected elements that make it memorable

Output only the filled JSON object, nothing else. Ensure valid JSON format.`;
  }

  /**
   * Call AI service to generate quest
   */
  async callAIForQuest(prompt, developerLevel = 'BUILDER') {
    try {
      // Try different API formats for Pollinations.ai
      let response;
      
      // Use the correct Pollinations API format
      response = await axios.post(this.pollinationsApiUrl, {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      let rawContent;
      // Handle Pollinations API response format
      if (typeof response.data === 'string') {
        rawContent = response.data;
      } else if (response.data?.choices?.[0]?.message?.content) {
        rawContent = response.data.choices[0].message.content;
      } else if (response.data?.content) {
        rawContent = response.data.content;
      } else if (response.data?.message) {
        rawContent = response.data.message;
      } else {
        rawContent = JSON.stringify(response.data);
      }

      // Clean up the response and extract JSON
      const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to find JSON object in the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed AI response');
          return parsedData;
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message);
          console.log('Raw content:', cleanContent.substring(0, 500) + '...');
        }
      }

      throw new Error('No valid JSON found in AI response');
    } catch (error) {
      console.error('AI quest generation failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data).substring(0, 200));
      }
      console.log(`Falling back to generated quest for level: ${developerLevel}`);
      return this.generateFallbackQuest(developerLevel);
    }
  }

  /**
   * Generate fallback quest if AI fails
   */
  generateFallbackQuest(level = 'BUILDER') {
    const fallbackQuests = {
      ROOKIE: {
        title: "Code Rookie's Number Hunt 🌱",
        description: "Welcome to your first coding adventure! Help the village librarian organize magical scrolls by finding special numbers.",
        difficulty: "Easy",
        duration: "1-2 hours",
        problemStatement: {
          description: "The village librarian has a collection of magical scrolls with numbers. Find the largest number to unlock the ancient wisdom.",
          examples: [
            {
              input: "[3, 7, 2, 9, 1]",
              output: "9",
              explanation: "9 is the largest number in the array"
            }
          ],
          constraints: ["Array has at least 1 element", "Numbers can be positive or negative"],
          edgeCases: ["Single element array", "All negative numbers", "Duplicate maximum values"]
        },
        starterCode: {
          language: "JavaScript",
          code: "function findLargestScroll(scrollNumbers) {\n  // Your magical code here\n}",
          template: "function findLargestScroll(scrollNumbers)"
        }
      },
      EXPLORER: {
        title: "Code Explorer's Treasure Map 🔍",
        description: "As an intrepid explorer, you've discovered an ancient treasure map. Use your growing skills to decode the hidden patterns.",
        difficulty: "Easy",
        duration: "2-3 hours",
        problemStatement: {
          description: "The treasure map contains clues in the form of character patterns. Find all anagram pairs to unlock the treasure location.",
          examples: [
            {
              input: "['listen', 'silent', 'hello', 'world']",
              output: "[['listen', 'silent']]",
              explanation: "'listen' and 'silent' are anagrams"
            }
          ],
          constraints: ["Words contain only lowercase letters", "At least 2 words in input"],
          edgeCases: ["No anagrams found", "Multiple anagram groups", "Single character words"]
        },
        starterCode: {
          language: "JavaScript",
          code: "function findTreasureClues(mapWords) {\n  // Explore and discover patterns\n}",
          template: "function findTreasureClues(mapWords)"
        }
      },
      BUILDER: {
        title: "Code Builder's Construction Challenge 🔨",
        description: "As a master builder, you need to organize construction materials efficiently. Use your growing skills to solve this building puzzle.",
        difficulty: "Medium",
        duration: "2-3 hours",
        problemStatement: {
          description: "Given an array of building material weights, find two materials that together equal the target weight for a perfect foundation.",
          examples: [
            {
              input: "[2, 7, 11, 15], target = 9",
              output: "[0, 1]",
              explanation: "materials[0] + materials[1] = 2 + 7 = 9"
            }
          ],
          constraints: ["Array length >= 2", "Only one valid answer exists"],
          edgeCases: ["Negative weights", "Duplicate weights", "No solution exists"]
        },
        starterCode: {
          language: "JavaScript",
          code: "function findMaterialPair(materials, targetWeight) {\n  // Build your solution here\n}",
          template: "function findMaterialPair(materials, targetWeight)"
        }
      },
      CRAFTSMAN: {
        title: "Code Craftsman's Artisan Workshop ⚡",
        description: "Master craftsman, your workshop needs a sophisticated inventory system. Create an elegant solution worthy of your expertise.",
        difficulty: "Hard",
        duration: "3-4 hours",
        problemStatement: {
          description: "Design an efficient system to track artisan tools. Implement a data structure that can quickly find, add, and remove tools while maintaining order.",
          examples: [
            {
              input: "operations: ['add hammer', 'add saw', 'find hammer', 'remove saw']",
              output: "['added', 'added', 'found at position 0', 'removed']",
              explanation: "Each operation is processed and tracked efficiently"
            }
          ],
          constraints: ["Support dynamic operations", "Maintain insertion order", "O(1) average lookup time"],
          edgeCases: ["Empty workshop", "Duplicate tools", "Remove non-existent tool"]
        },
        starterCode: {
          language: "JavaScript",
          code: "class ArtisanWorkshop {\n  constructor() {\n    // Craft your data structure here\n  }\n  \n  addTool(tool) {\n    // Implementation here\n  }\n}",
          template: "class ArtisanWorkshop"
        }
      },
      ARCHITECT: {
        title: "Code Architect's System Design 🏗️",
        description: "As a system architect, design a scalable solution for managing distributed resources across multiple servers.",
        difficulty: "Expert",
        duration: "4-5 hours",
        problemStatement: {
          description: "Design a load balancer that distributes requests across multiple servers while maintaining session affinity.",
          examples: [
            {
              input: "servers: ['server1', 'server2'], requests: ['user1', 'user2', 'user1']",
              output: "{'user1': 'server1', 'user2': 'server2', 'user1': 'server1'}",
              explanation: "Users are consistently routed to the same server"
            }
          ],
          constraints: ["Maintain session affinity", "Balance load evenly", "Handle server failures"],
          edgeCases: ["Server goes down", "New servers added", "High traffic spikes"]
        },
        starterCode: {
          language: "JavaScript",
          code: "class LoadBalancer {\n  constructor(servers) {\n    // Design your architecture here\n  }\n  \n  routeRequest(userId) {\n    // Implementation here\n  }\n}",
          template: "class LoadBalancer"
        }
      },
      WIZARD: {
        title: "Code Wizard's Magical Algorithm 🧙‍♂️",
        description: "Master wizard, create an advanced algorithm that demonstrates your mastery over multiple domains of computer science.",
        difficulty: "Expert",
        duration: "4-6 hours",
        problemStatement: {
          description: "Implement an advanced graph algorithm that finds the shortest path while considering dynamic edge weights that change over time.",
          examples: [
            {
              input: "graph: {A: {B: 5, C: 3}, B: {D: 2}, C: {D: 4}}, timeWeights: {...}",
              output: "path: ['A', 'C', 'D'], cost: 7",
              explanation: "Optimal path considering time-varying weights"
            }
          ],
          constraints: ["Handle dynamic weights", "Optimize for time complexity", "Support real-time updates"],
          edgeCases: ["Negative weight cycles", "Disconnected graphs", "Weight updates during traversal"]
        },
        starterCode: {
          language: "JavaScript",
          code: "class DynamicPathfinder {\n  constructor(graph) {\n    // Weave your magical algorithm here\n  }\n  \n  findOptimalPath(start, end, timestamp) {\n    // Implementation here\n  }\n}",
          template: "class DynamicPathfinder"
        }
      },
      LEGEND: {
        title: "Code Legend's Legendary Challenge 👑",
        description: "Legendary coder, tackle this groundbreaking problem that pushes the boundaries of algorithmic innovation.",
        difficulty: "Legendary",
        duration: "5-7 hours",
        problemStatement: {
          description: "Design a revolutionary data structure that combines the benefits of multiple advanced structures while maintaining optimal performance.",
          examples: [
            {
              input: "operations: ['insert', 'search', 'range_query', 'update']",
              output: "Optimal performance for all operations",
              explanation: "Hybrid structure optimizes for multiple operation types"
            }
          ],
          constraints: ["Sub-linear complexity for all operations", "Memory efficient", "Thread-safe"],
          edgeCases: ["Concurrent access", "Memory pressure", "Large datasets"]
        },
        starterCode: {
          language: "JavaScript",
          code: "class HybridDataStructure {\n  constructor() {\n    // Create your legendary innovation here\n  }\n  \n  insert(key, value) {\n    // Implementation here\n  }\n}",
          template: "class HybridDataStructure"
        }
      },
      TITAN: {
        title: "Code Titan's World-Changing Innovation 🚀",
        description: "Code Titan, pioneer a revolutionary computational paradigm that will reshape how we think about algorithms and data processing.",
        difficulty: "Legendary",
        duration: "6-8 hours",
        problemStatement: {
          description: "Create a novel computational framework that can adapt its algorithmic approach based on data patterns and system constraints in real-time.",
          examples: [
            {
              input: "data_stream: continuous, constraints: {memory: 'limited', cpu: 'variable'}",
              output: "Adaptive algorithm selection and optimization",
              explanation: "System automatically optimizes based on current conditions"
            }
          ],
          constraints: ["Real-time adaptation", "Resource awareness", "Pattern recognition"],
          edgeCases: ["Resource exhaustion", "Pattern shifts", "System failures"]
        },
        starterCode: {
          language: "JavaScript",
          code: "class AdaptiveComputationFramework {\n  constructor() {\n    // Pioneer the future of computing here\n  }\n  \n  processData(stream, constraints) {\n    // Revolutionary implementation here\n  }\n}",
          template: "class AdaptiveComputationFramework"
        }
      }
    };

    const quest = fallbackQuests[level] || fallbackQuests.BUILDER;
    const { DeveloperLevels } = require('../models/DeveloperLevel');
    const levelInfo = DeveloperLevels[level] || DeveloperLevels.BUILDER;
    
    return {
      ...quest,
      solution: {
        code: "// Fallback solution implementation would go here",
        explanation: "This is a fallback quest generated when AI service is unavailable.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)"
      },
      evaluationCriteria: {
        correctness: { weight: 40, maxScore: levelInfo.maxScore },
        efficiency: { weight: 30, maxScore: levelInfo.maxScore },
        codeQuality: { weight: 20, maxScore: levelInfo.maxScore },
        creativity: { weight: 10, maxScore: levelInfo.maxScore }
      },
      learningObjectives: ["Problem solving", "Algorithm design", "Code organization"],
      achievements: [
        {
          name: "Fallback Hero",
          description: "Completed quest when AI was unavailable",
          condition: "Submit correct solution",
          points: 25
        }
      ],
      rewards: {
        winner: {
          points: levelInfo.maxScore * 10,
          badge: "Fallback Champion",
          title: "Resilient Coder",
          cryptoAmount: this.cryptoRewardRates[level] * 3
        },
        participation: {
          points: levelInfo.maxScore * 2,
          badge: "Fallback Participant",
          cryptoAmount: this.cryptoRewardRates[level]
        }
      }
    };
  }

  /**
   * Generate weekly schedule for quest
   */
  generateWeeklySchedule() {
    const now = moment();
    const nextSunday = now.clone().day(7); // Next Sunday
    
    return {
      stakingStart: nextSunday.clone().toDate(),
      stakingEnd: nextSunday.clone().add(2, 'days').toDate(), // Tuesday
      challengeStart: nextSunday.clone().add(3, 'days').toDate(), // Wednesday
      challengeEnd: nextSunday.clone().add(4, 'days').toDate(), // Thursday
      resultsAnnouncement: nextSunday.clone().add(6, 'days').toDate(), // Saturday
      weekNumber: nextSunday.week(),
      year: nextSunday.year()
    };
  }

  /**
   * Generate unique quest ID
   */
  generateQuestId(level, weekNumber, year) {
    return `QUEST_${level}_W${weekNumber}_${year}`;
  }

  /**
   * Stake user for quest
   */
  async stakeUserForQuest(questId, username, email, developerLevel, walletAddress = null) {
    try {
      const quest = await Quest.findOne({ questId, status: 'staking' });
      if (!quest) {
        throw new Error('Quest not found or not in staking phase');
      }

      // Check if user already staked
      const alreadyStaked = quest.participants.staked.find(p => p.username === username);
      if (alreadyStaked) {
        throw new Error('User already staked for this quest');
      }

      // Get user's wallet address from profile if not provided
      if (!walletAddress) {
        const GitHubUser = require('../models/GitHubUser');
        const user = await GitHubUser.findOne({ username });
        walletAddress = user?.walletAddress || null;
      }

      // Add user to staked participants
      quest.participants.staked.push({
        username,
        email,
        stakedAt: new Date(),
        developerLevel,
        walletAddress
      });

      quest.statistics.totalStaked = quest.participants.staked.length;
      await quest.save();

      return quest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submit solution for quest
   */
  async submitSolution(questId, username, email, solution) {
    try {
      const quest = await Quest.findOne({ questId, status: 'active' });
      if (!quest) {
        throw new Error('Quest not found or not active');
      }

      // Check if user is staked
      const stakedUser = quest.participants.staked.find(p => p.username === username);
      if (!stakedUser) {
        throw new Error('User must be staked to submit solution');
      }

      // Get user's wallet address from profile
      const GitHubUser = require('../models/GitHubUser');
      const user = await GitHubUser.findOne({ username });
      const walletAddress = user?.walletAddress || null;

      // Check if user already submitted
      const existingSubmission = quest.participants.submitted.find(p => p.username === username);
      if (existingSubmission) {
        // Update existing submission
        existingSubmission.solution = solution;
        existingSubmission.submittedAt = new Date();
        existingSubmission.walletAddress = walletAddress;
      } else {
        // Add new submission
        quest.participants.submitted.push({
          username,
          email,
          submittedAt: new Date(),
          solution,
          score: 0, // Will be calculated later
          feedback: '',
          walletAddress
        });
      }

      quest.statistics.totalSubmissions = quest.participants.submitted.length;
      await quest.save();

      return quest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active quests for a developer level
   */
  async getActiveQuests(developerLevel = null) {
    try {
      const query = { status: { $in: ['staking', 'active'] } };
      if (developerLevel) {
        query.developerLevel = developerLevel;
      }

      const quests = await Quest.find(query)
        .select('-solution')
        .sort({ 'schedule.stakingStart': 1 });

      return quests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get quest by ID
   */
  async getQuestById(questId, includePrivate = false) {
    try {
      const selectFields = includePrivate ? '' : '-solution';
      const quest = await Quest.findOne({ questId }).select(selectFields);
      
      if (!quest) {
        throw new Error('Quest not found');
      }

      return quest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update quest status based on schedule
   */
  async updateQuestStatuses() {
    try {
      const now = new Date();
      
      // Update to staking phase
      await Quest.updateMany(
        { 
          status: 'created',
          'schedule.stakingStart': { $lte: now },
          'schedule.stakingEnd': { $gt: now }
        },
        { status: 'staking' }
      );

      // Update to active phase
      await Quest.updateMany(
        { 
          status: 'staking',
          'schedule.challengeStart': { $lte: now },
          'schedule.challengeEnd': { $gt: now }
        },
        { status: 'active' }
      );

      // Update to closed phase
      await Quest.updateMany(
        { 
          status: 'active',
          'schedule.challengeEnd': { $lte: now }
        },
        { status: 'closed' }
      );

      console.log('Quest statuses updated successfully');
    } catch (error) {
      console.error('Failed to update quest statuses:', error.message);
    }
  }

  /**
   * Generate quests for all developer levels
   */
  async generateWeeklyQuests() {
    try {
      const levels = Object.keys(DeveloperLevels);
      const challengeTypes = ['algorithm', 'data-structure', 'debugging', 'optimization'];
      const techStacks = [
        ['JavaScript', 'Node.js'],
        ['Python'],
        ['Java'],
        ['TypeScript', 'React'],
        ['Go'],
        ['Rust'],
        ['C++']
      ];
      const themes = ['adventure', 'mystery', 'space', 'fantasy', 'cyberpunk', 'nature'];

      const quests = [];

      for (const level of levels) {
        const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
        const techStack = techStacks[Math.floor(Math.random() * techStacks.length)];
        const theme = themes[Math.floor(Math.random() * themes.length)];

        try {
          const quest = await this.generateQuest(level, challengeType, techStack, theme);
          quests.push(quest);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to generate quest for ${level}:`, error.message);
        }
      }

      return quests;
    } catch (error) {
      console.error('Failed to generate weekly quests:', error.message);
      throw error;
    }
  }

  /**
   * Auto-generate weekly quests (to be called by cron job every Sunday)
   */
  async autoGenerateWeeklyQuests() {
    try {
      console.log('Starting automatic weekly quest generation...');
      
      // Check if quests for this week already exist
      const currentWeek = moment().week();
      const currentYear = moment().year();
      
      const existingQuests = await Quest.find({
        'schedule.weekNumber': currentWeek,
        'schedule.year': currentYear
      });

      if (existingQuests.length > 0) {
        console.log(`Quests for week ${currentWeek} of ${currentYear} already exist. Skipping generation.`);
        return existingQuests;
      }

      const quests = await this.generateWeeklyQuests();
      
      // Update all generated quests to staking status
      await Quest.updateMany(
        {
          'schedule.weekNumber': currentWeek,
          'schedule.year': currentYear
        },
        { status: 'staking' }
      );

      console.log(`Successfully generated ${quests.length} quests for week ${currentWeek} of ${currentYear}`);
      return quests;
    } catch (error) {
      console.error('Auto-generation of weekly quests failed:', error.message);
      throw error;
    }
  }

  /**
   * Send quest notifications based on schedule
   */
  async sendScheduledNotifications() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // Send staking notifications (Sunday - when quests become available)
      const stakingQuests = await Quest.find({
        status: 'staking',
        'schedule.stakingStart': {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('participants.staked');

      // Send challenge start notifications (Wednesday)
      const challengeQuests = await Quest.find({
        status: 'active',
        'schedule.challengeStart': {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('participants.staked');

      // Send results notifications (Saturday)
      const resultQuests = await Quest.find({
        status: 'completed',
        'schedule.resultsAnnouncement': {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('participants.staked participants.submitted winners');

      let totalEmailsSent = 0;

      // Process staking notifications
      for (const quest of stakingQuests) {
        // For staking, we can send to all users or a general announcement
        console.log(`Staking period started for quest: ${quest.title}`);
      }

      // Process challenge notifications
      for (const quest of challengeQuests) {
        for (const participant of quest.participants.staked) {
          try {
            await sendEmail(
              participant.email,
              `⚡ Quest Challenge Started: ${quest.title}`,
              questChallengeTemplate(participant.username, quest)
            );
            totalEmailsSent++;
          } catch (emailError) {
            console.error(`Failed to send challenge email to ${participant.email}:`, emailError.message);
          }
        }
      }

      // Process results notifications
      for (const quest of resultQuests) {
        const allParticipants = [
          ...quest.participants.staked,
          ...quest.participants.submitted
        ];

        // Remove duplicates based on username
        const uniqueParticipants = allParticipants.filter((participant, index, self) =>
          index === self.findIndex(p => p.username === participant.username)
        );

        for (const participant of uniqueParticipants) {
          try {
            const winner = quest.winners.find(w => w.username === participant.username);
            const subject = winner ? 
              `🏆 Congratulations! You won ${quest.title}` :
              `📊 Quest Results: ${quest.title}`;
            
            await sendEmail(
              participant.email,
              subject,
              questResultsTemplate(participant.username, quest, winner)
            );
            totalEmailsSent++;
          } catch (emailError) {
            console.error(`Failed to send results email to ${participant.email}:`, emailError.message);
          }
        }
      }

      console.log(`Sent ${totalEmailsSent} scheduled notifications`);
      return {
        stakingQuests: stakingQuests.length,
        challengeQuests: challengeQuests.length,
        resultQuests: resultQuests.length,
        totalEmailsSent
      };
    } catch (error) {
      console.error('Failed to send scheduled notifications:', error.message);
      throw error;
    }
  }

  /**
   * Update user wallet address
   */
  async updateUserWallet(username, walletAddress) {
    try {
      const GitHubUser = require('../models/GitHubUser');
      const user = await GitHubUser.findOneAndUpdate(
        { username },
        { walletAddress },
        { new: true }
      );
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      console.error(`Failed to update wallet for ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Get crypto reward rates for all levels
   */
  getCryptoRewardRates() {
    const rates = {};
    Object.keys(this.cryptoRewardRates).forEach(level => {
      rates[level] = {
        participation: this.cryptoRewardRates[level],
        winner: this.cryptoRewardRates[level] * 3
      };
    });
    return rates;
  }

  /**
   * Process quest results and determine winners
   */
  async processQuestResults(questId) {
    try {
      const quest = await Quest.findOne({ questId, status: 'closed' });
      if (!quest) {
        throw new Error('Quest not found or not in closed status');
      }

      // Simple scoring algorithm (can be enhanced with AI evaluation)
      const submissions = quest.participants.submitted.map(submission => {
        // Basic scoring based on solution length, complexity, etc.
        // In a real implementation, this would use AI to evaluate code quality
        const baseScore = Math.floor(Math.random() * 50) + 50; // Random score for demo
        const timeBonus = Math.max(0, 10 - Math.floor((new Date() - submission.submittedAt) / (1000 * 60 * 60))); // Time bonus
        
        return {
          ...submission,
          score: Math.min(100, baseScore + timeBonus),
          feedback: 'Great solution! Well structured and efficient.'
        };
      });

      // Sort by score and assign ranks
      submissions.sort((a, b) => b.score - a.score);
      
      const winners = submissions.slice(0, 3).map((submission, index) => {
        const isWinner = index === 0;
        const cryptoMultiplier = isWinner ? 3 : (index === 1 ? 2 : 1);
        const cryptoAmount = this.cryptoRewardRates[quest.developerLevel] * cryptoMultiplier;

        return {
          rank: index + 1,
          username: submission.username,
          email: submission.email,
          score: submission.score,
          solution: submission.solution,
          feedback: submission.feedback,
          walletAddress: submission.walletAddress,
          rewards: {
            points: quest.rewards.winner.points * (index === 0 ? 1 : index === 1 ? 0.7 : 0.5),
            badge: index === 0 ? quest.rewards.winner.badge : `${quest.rewards.winner.badge} - ${index === 1 ? '2nd Place' : '3rd Place'}`,
            title: index === 0 ? quest.rewards.winner.title : `${quest.rewards.winner.title} - Runner Up`,
            cryptoAmount: submission.walletAddress ? cryptoAmount : 0
          }
        };
      });

      // Update quest with results
      quest.winners = winners;
      quest.participants.submitted = submissions;
      quest.status = 'completed';
      quest.statistics.averageScore = submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length;
      quest.statistics.completionRate = (submissions.length / quest.statistics.totalStaked) * 100;

      await quest.save();

      console.log(`Processed results for quest ${questId}. Winners: ${winners.length}`);
      return quest;
    } catch (error) {
      console.error(`Failed to process quest results for ${questId}:`, error.message);
      throw error;
    }
  }
}

module.exports = QuestService;