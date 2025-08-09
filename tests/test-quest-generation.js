const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testQuestGeneration() {
  console.log('🧪 Testing Quest Generation Fixes\n');

  try {
    // Test individual quest generation for different levels
    const levels = ['ROOKIE', 'EXPLORER', 'BUILDER', 'CRAFTSMAN', 'ARCHITECT'];
    
    for (const level of levels) {
      console.log(`Testing ${level} level quest generation...`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/quests/generate`, {
          developerLevel: level,
          challengeType: 'algorithm',
          techStack: ['JavaScript'],
          theme: 'adventure'
        });

        if (response.data.success) {
          console.log(`✅ ${level} quest generated successfully`);
          console.log(`   Title: "${response.data.data.title}"`);
          console.log(`   Difficulty: ${response.data.data.difficulty}`);
          console.log(`   Duration: ${response.data.data.duration}`);
          
          // Check if it has required fields
          const quest = response.data.data;
          const hasRequiredFields = quest.problemStatement && 
                                   quest.starterCode && 
                                   quest.rewards &&
                                   quest.evaluationCriteria;
          
          if (hasRequiredFields) {
            console.log(`   ✅ All required fields present`);
          } else {
            console.log(`   ⚠️  Some fields missing`);
          }
        } else {
          console.log(`❌ ${level} quest generation failed:`, response.data.message);
        }
      } catch (error) {
        console.log(`❌ ${level} quest generation error:`, error.message);
        if (error.response?.data) {
          console.log(`   Error details:`, error.response.data.message || error.response.data);
        }
      }
      
      console.log(''); // Empty line for readability
    }

    // Test weekly quest generation
    console.log('Testing weekly quest generation for all levels...');
    
    try {
      const weeklyResponse = await axios.post(`${BASE_URL}/api/quests/generate-weekly`);
      
      if (weeklyResponse.data.success) {
        console.log(`✅ Weekly quests generated successfully`);
        console.log(`   Generated ${weeklyResponse.data.data.length} quests`);
        
        weeklyResponse.data.data.forEach(quest => {
          console.log(`   - ${quest.developerLevel}: "${quest.title}"`);
        });
      } else {
        console.log(`❌ Weekly quest generation failed:`, weeklyResponse.data.message);
      }
    } catch (error) {
      console.log(`⚠️  Weekly quest generation had issues:`, error.message);
      if (error.response?.data) {
        console.log(`   Error details:`, error.response.data.message || error.response.data);
      }
    }

    console.log('\n🎉 Quest generation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testQuestGeneration();