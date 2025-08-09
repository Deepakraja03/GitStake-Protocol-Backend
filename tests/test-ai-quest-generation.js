require('dotenv').config();
const QuestService = require('../services/questService');
const { DeveloperLevels } = require('../models/DeveloperLevel');

async function testAIQuestGeneration() {
  console.log('🤖 Testing AI Quest Generation\n');

  const questService = new QuestService();

  try {
    // Test AI quest generation for one level
    const level = 'BUILDER';
    const levelInfo = DeveloperLevels[level];
    
    console.log(`Testing AI quest generation for ${level} level...`);
    console.log(`Level info:`, levelInfo);
    
    try {
      // Create a prompt
      const prompt = questService.createQuestPrompt(
        levelInfo, 
        'algorithm', 
        ['JavaScript'], 
        'adventure'
      );
      
      console.log('✅ Prompt created successfully');
      console.log('Prompt length:', prompt.length);
      
      // Try to call AI service
      console.log('Attempting to call AI service...');
      const questData = await questService.callAIForQuest(prompt, level);
      
      if (questData) {
        console.log(`✅ AI quest generated successfully`);
        console.log(`   Title: "${questData.title}"`);
        console.log(`   Difficulty: ${questData.difficulty}`);
        console.log(`   Duration: ${questData.duration}`);
        
        // Check if it has required fields
        const hasRequiredFields = questData.problemStatement && 
                                 questData.starterCode && 
                                 questData.rewards &&
                                 questData.evaluationCriteria;
        
        if (hasRequiredFields) {
          console.log(`   ✅ All required fields present`);
        } else {
          console.log(`   ⚠️  Some fields missing`);
        }
      } else {
        console.log(`❌ AI quest generation returned null/undefined`);
      }
      
    } catch (error) {
      console.log(`❌ AI quest generation error:`, error.message);
      console.log('This is expected if AI service is unavailable - fallback should work');
    }

    // Test the full generateQuest method which includes fallback
    console.log('\nTesting full generateQuest method with fallback...');
    try {
      const quest = await questService.generateQuest(level, 'algorithm', ['JavaScript'], 'adventure');
      
      console.log(`✅ Full quest generation successful`);
      console.log(`   Title: "${quest.title}"`);
      console.log(`   Quest ID: ${quest.questId}`);
      console.log(`   Status: ${quest.status}`);
      console.log(`   Developer Level: ${quest.developerLevel}`);
      
    } catch (error) {
      console.log(`❌ Full quest generation error:`, error.message);
    }

    console.log('\n🎉 AI quest generation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testAIQuestGeneration();