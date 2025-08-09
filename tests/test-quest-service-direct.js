const QuestService = require('../services/questService');

async function testQuestServiceDirect() {
  console.log('🧪 Testing Quest Service Directly\n');

  const questService = new QuestService();

  try {
    // Test fallback quest generation for different levels
    const levels = ['ROOKIE', 'EXPLORER', 'BUILDER', 'CRAFTSMAN', 'ARCHITECT', 'WIZARD', 'LEGEND', 'TITAN'];
    
    for (const level of levels) {
      console.log(`Testing ${level} level fallback quest generation...`);
      
      try {
        const quest = questService.generateFallbackQuest(level);
        
        console.log(`✅ ${level} fallback quest generated successfully`);
        console.log(`   Title: "${quest.title}"`);
        console.log(`   Difficulty: ${quest.difficulty}`);
        console.log(`   Duration: ${quest.duration}`);
        
        // Check if it has required fields
        const hasRequiredFields = quest.problemStatement && 
                                 quest.starterCode && 
                                 quest.rewards &&
                                 quest.evaluationCriteria;
        
        if (hasRequiredFields) {
          console.log(`   ✅ All required fields present`);
        } else {
          console.log(`   ⚠️  Some fields missing`);
          console.log(`   Missing fields:`, {
            problemStatement: !quest.problemStatement,
            starterCode: !quest.starterCode,
            rewards: !quest.rewards,
            evaluationCriteria: !quest.evaluationCriteria
          });
        }
      } catch (error) {
        console.log(`❌ ${level} fallback quest generation error:`, error.message);
      }
      
      console.log(''); // Empty line for readability
    }

    // Test crypto reward rates
    console.log('Testing crypto reward rates...');
    const rates = questService.getCryptoRewardRates();
    console.log('✅ Crypto reward rates:', rates);

    console.log('\n🎉 Quest service direct test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testQuestServiceDirect();