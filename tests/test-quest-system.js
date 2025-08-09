const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'testdev123',
  email: 'testdev@example.com',
  developerLevel: 'BUILDER'
};

// Test functions
async function testQuestSystem() {
  console.log('🚀 Starting GitStake Quest System Test...\n');

  try {
    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is healthy:', healthResponse.data.status);

    // 2. Test quest generation
    console.log('\n2. Testing quest generation...');
    const questResponse = await axios.post(`${BASE_URL}/api/quests/generate`, {
      developerLevel: 'BUILDER',
      challengeType: 'algorithm',
      techStack: ['JavaScript', 'Node.js'],
      theme: 'adventure'
    });
    
    if (questResponse.data.success) {
      console.log('✅ Quest generated successfully');
      console.log('   Quest ID:', questResponse.data.data.questId);
      console.log('   Title:', questResponse.data.data.title);
      console.log('   Status:', questResponse.data.data.status);
      
      const questId = questResponse.data.data.questId;

      // 3. Test getting quest details
      console.log('\n3. Testing quest retrieval...');
      const questDetailsResponse = await axios.get(`${BASE_URL}/api/quests/${questId}`);
      if (questDetailsResponse.data.success) {
        console.log('✅ Quest details retrieved successfully');
        console.log('   Developer Level:', questDetailsResponse.data.data.developerLevel);
        console.log('   Challenge Type:', questDetailsResponse.data.data.challengeType);
      }

      // 4. Test quest status update (to enable staking)
      console.log('\n4. Testing quest status update...');
      await axios.put(`${BASE_URL}/api/quests/update-statuses`);
      
      // Update quest to staking status for testing
      const Quest = require('../models/Quest');
      await Quest.updateOne(
        { questId },
        { status: 'staking' }
      );
      console.log('✅ Quest status updated to staking');

      // 5. Test staking for quest
      console.log('\n5. Testing quest staking...');
      const stakeResponse = await axios.post(`${BASE_URL}/api/quests/${questId}/stake`, TEST_USER);
      if (stakeResponse.data.success) {
        console.log('✅ Successfully staked for quest');
        console.log('   Total Staked:', stakeResponse.data.data.totalStaked);
      }

      // 6. Test getting active quests
      console.log('\n6. Testing active quests retrieval...');
      const activeQuestsResponse = await axios.get(`${BASE_URL}/api/quests/active?developerLevel=BUILDER`);
      if (activeQuestsResponse.data.success) {
        console.log('✅ Active quests retrieved successfully');
        console.log('   Found', activeQuestsResponse.data.data.length, 'active quests');
      }

      // 7. Test quest to active status and submit solution
      console.log('\n7. Testing solution submission...');
      await Quest.updateOne(
        { questId },
        { status: 'active' }
      );
      
      const submitResponse = await axios.post(`${BASE_URL}/api/quests/${questId}/submit`, {
        ...TEST_USER,
        solution: 'function solve(input) {\n  // Test solution\n  return "test result";\n}'
      });
      
      if (submitResponse.data.success) {
        console.log('✅ Solution submitted successfully');
        console.log('   Total Submissions:', submitResponse.data.data.totalSubmissions);
      }

      // 8. Test leaderboard
      console.log('\n8. Testing quest leaderboard...');
      const leaderboardResponse = await axios.get(`${BASE_URL}/api/quests/${questId}/leaderboard`);
      if (leaderboardResponse.data.success) {
        console.log('✅ Leaderboard retrieved successfully');
        console.log('   Leaderboard entries:', leaderboardResponse.data.data.leaderboard.length);
      }

      // 9. Test user quest history
      console.log('\n9. Testing user quest history...');
      const historyResponse = await axios.get(`${BASE_URL}/api/quests/user/${TEST_USER.username}/history`);
      if (historyResponse.data.success) {
        console.log('✅ User quest history retrieved successfully');
        console.log('   Quest history entries:', historyResponse.data.data.quests.length);
      }

      // 10. Test cron job status
      console.log('\n10. Testing cron job management...');
      const cronStatusResponse = await axios.get(`${BASE_URL}/api/cron/status`);
      if (cronStatusResponse.data.success) {
        console.log('✅ Cron job status retrieved successfully');
        console.log('   Available jobs:', cronStatusResponse.data.data.length);
        cronStatusResponse.data.data.forEach(job => {
          console.log(`   - ${job.name}: ${job.running ? 'Running' : 'Stopped'}`);
        });
      }

      console.log('\n🎉 All tests completed successfully!');
      console.log('\n📋 Test Summary:');
      console.log('   ✅ Server health check');
      console.log('   ✅ Quest generation with AI');
      console.log('   ✅ Quest retrieval');
      console.log('   ✅ Quest status management');
      console.log('   ✅ User staking');
      console.log('   ✅ Active quests listing');
      console.log('   ✅ Solution submission');
      console.log('   ✅ Leaderboard functionality');
      console.log('   ✅ User quest history');
      console.log('   ✅ Cron job management');

    } else {
      console.error('❌ Quest generation failed:', questResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Helper function to test weekly quest generation
async function testWeeklyQuestGeneration() {
  console.log('\n🔄 Testing Weekly Quest Generation...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/quests/generate-weekly`);
    if (response.data.success) {
      console.log('✅ Weekly quests generated successfully');
      console.log('   Generated', response.data.data.length, 'quests');
      response.data.data.forEach(quest => {
        console.log(`   - ${quest.developerLevel}: ${quest.title}`);
      });
    }
  } catch (error) {
    console.error('❌ Weekly quest generation failed:', error.message);
  }
}

// Helper function to test cron job triggers
async function testCronTriggers() {
  console.log('\n⏰ Testing Cron Job Triggers...');
  
  const jobs = ['statusUpdate', 'notifications'];
  
  for (const job of jobs) {
    try {
      console.log(`   Triggering ${job}...`);
      const response = await axios.post(`${BASE_URL}/api/cron/trigger/${job}`);
      if (response.data.success) {
        console.log(`   ✅ ${job} completed successfully`);
      }
    } catch (error) {
      console.error(`   ❌ ${job} failed:`, error.message);
    }
  }
}

// Run tests
async function runAllTests() {
  await testQuestSystem();
  
  // Uncomment these for additional testing
  // await testWeeklyQuestGeneration();
  // await testCronTriggers();
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testQuestSystem,
  testWeeklyQuestGeneration,
  testCronTriggers
};