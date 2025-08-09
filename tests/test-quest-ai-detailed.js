const axios = require('axios');

async function testQuestAIDetailed() {
  console.log('🔍 Detailed AI Quest Generation Test\n');

  const apiUrl = 'https://text.pollinations.ai/';
  
  // Create a simple quest prompt
  const simplePrompt = `Generate a coding quest in JSON format with these fields:
{
  "title": "Quest Title",
  "description": "Quest description",
  "difficulty": "Medium",
  "duration": "2-3 hours",
  "problemStatement": {
    "description": "Problem description",
    "examples": [{"input": "example", "output": "result", "explanation": "why"}],
    "constraints": ["constraint 1"],
    "edgeCases": ["edge case 1"]
  },
  "starterCode": {
    "language": "JavaScript",
    "code": "function solve() { // code here }",
    "template": "function solve()"
  },
  "solution": {
    "code": "function solve() { return 'solution'; }",
    "explanation": "Solution explanation",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)"
  },
  "evaluationCriteria": {
    "correctness": {"weight": 40, "maxScore": 50},
    "efficiency": {"weight": 30, "maxScore": 50},
    "codeQuality": {"weight": 20, "maxScore": 50},
    "creativity": {"weight": 10, "maxScore": 50}
  },
  "learningObjectives": ["Learn algorithms"],
  "achievements": [{"name": "Achievement", "description": "Description", "condition": "Complete", "points": 10}],
  "rewards": {
    "winner": {"points": 500, "badge": "Winner", "title": "Champion", "cryptoAmount": 0.009},
    "participation": {"points": 100, "badge": "Participant", "cryptoAmount": 0.003}
  }
}

Please return only the JSON object, no additional text.`;

  try {
    console.log('Testing with simplified quest prompt...');
    console.log('API URL:', apiUrl);
    console.log('Prompt length:', simplePrompt.length);
    
    const response = await axios.post(apiUrl, {
      messages: [
        {
          role: 'user',
          content: simplePrompt
        }
      ],
      model: 'openai'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    
    console.log('✅ API call successful');
    console.log('Response status:', response.status);
    console.log('Response type:', typeof response.data);
    
    let rawContent;
    if (typeof response.data === 'string') {
      rawContent = response.data;
    } else if (response.data?.message) {
      rawContent = response.data.message;
    } else {
      rawContent = JSON.stringify(response.data);
    }
    
    console.log('Raw content preview:', rawContent.substring(0, 300) + '...');
    
    // Try to parse as JSON
    const cleanContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON response');
        console.log('Quest title:', parsedData.title);
        console.log('Quest difficulty:', parsedData.difficulty);
        
        // Check required fields
        const hasRequiredFields = parsedData.title && 
                                 parsedData.problemStatement && 
                                 parsedData.starterCode && 
                                 parsedData.rewards;
        
        console.log('Has required fields:', hasRequiredFields);
        
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
        console.log('Content to parse:', jsonMatch[0].substring(0, 200) + '...');
      }
    } else {
      console.log('❌ No JSON object found in response');
    }
    
  } catch (error) {
    console.error('❌ API call failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testQuestAIDetailed();