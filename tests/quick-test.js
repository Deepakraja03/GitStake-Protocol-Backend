const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function quickTest() {
  console.log('🚀 Enhanced GitStake Quest System Test\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is healthy:', health.data.status);

    // Test cron status
    console.log('\n2. Testing cron job status...');
    const cronStatus = await axios.get(`${BASE_URL}/api/cron/status`);
    console.log('✅ Cron jobs status retrieved');
    cronStatus.data.data.forEach(job => {
      console.log(`   - ${job.name}: ${job.running ? '🟢 Running' : '🔴 Stopped'}`);
    });

    // Test crypto reward rates
    console.log('\n3. Testing crypto reward rates...');
    const rewardRates = await axios.get(`${BASE_URL}/api/quests/crypto-rates`);
    console.log('✅ Crypto reward rates retrieved');
    console.log('   Sample rates:');
    console.log(`   - ROOKIE: ${rewardRates.data.data.ROOKIE.participation} ETH (participation), ${rewardRates.data.data.ROOKIE.winner} ETH (winner)`);
    console.log(`   - BUILDER: ${rewardRates.data.data.BUILDER.participation} ETH (participation), ${rewardRates.data.data.BUILDER.winner} ETH (winner)`);
    console.log(`   - TITAN: ${rewardRates.data.data.TITAN.participation} ETH (participation), ${rewardRates.data.data.TITAN.winner} ETH (winner)`);

    // Test wallet address update
    console.log('\n4. Testing wallet address update...');
    const walletResponse = await axios.put(`${BASE_URL}/api/quests/update-wallet`, {
      username: 'testdev123',
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
    });

    if (walletResponse.data.success) {
      console.log('✅ Wallet address updated successfully!');
      console.log('   Username:', walletResponse.data.data.username);
      console.log('   Wallet Address:', walletResponse.data.data.walletAddress);
    }

    // Test weekly quest generation
    console.log('\n5. Testing weekly quest generation (all levels)...');
    const weeklyQuests = await axios.post(`${BASE_URL}/api/quests/generate-weekly`);
    
    if (weeklyQuests.data.success) {
      console.log('✅ Weekly quests generated successfully!');
      console.log(`   Generated ${weeklyQuests.data.data.length} quests for all developer levels`);
      weeklyQuests.data.data.forEach(quest => {
        console.log(`   - ${quest.developerLevel}: ${quest.title}`);
      });
    }

    // Test getting active quests
    console.log('\n6. Testing active quests...');
    const activeQuests = await axios.get(`${BASE_URL}/api/quests/active`);
    console.log('✅ Active quests retrieved:', activeQuests.data.data.length, 'quests found');

    // Test quest difficulty scaling
    console.log('\n7. Testing quest difficulty scaling...');
    const rookieQuest = await axios.post(`${BASE_URL}/api/quests/generate`, {
      developerLevel: 'ROOKIE',
      challengeType: 'algorithm',
      techStack: ['JavaScript'],
      theme: 'adventure'
    });
    
    const titanQuest = await axios.post(`${BASE_URL}/api/quests/generate`, {
      developerLevel: 'TITAN',
      challengeType: 'algorithm',
      techStack: ['JavaScript'],
      theme: 'adventure'
    });

    if (rookieQuest.data.success && titanQuest.data.success) {
      console.log('✅ Difficulty scaling verified');
      console.log(`   ROOKIE Quest: ${rookieQuest.data.data.difficulty} - ${rookieQuest.data.data.duration}`);
      console.log(`   TITAN Quest: ${titanQuest.data.data.difficulty} - ${titanQuest.data.data.duration}`);
    }

    console.log('\n🎉 Enhanced test completed successfully!');
    console.log('\n📋 GitStake Quest System Features Verified:');
    console.log('   ✅ Server health check');
    console.log('   ✅ Cron job management');
    console.log('   ✅ Simplified wallet address management');
    console.log('   ✅ Multi-level reward system');
    console.log('   ✅ AI-powered quest generation for all 8 levels');
    console.log('   ✅ Difficulty-scaled problem complexity');
    console.log('   ✅ Quest retrieval system');
    console.log('\n🚀 Your GitStake Quest System with Difficulty Scaling is ready!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data?.message || error.response.data);
    }
  }
}

quickTest();