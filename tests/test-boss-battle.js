const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com'
};

class BossBattleTest {
  constructor() {
    this.battleId = null;
  }

  async runTests() {
    console.log('🚀 Starting Boss Battle System Tests...\n');

    try {
      await this.testCreateBossBattle();
      await this.testGetBossBattle();
      await this.testStartBossBattle();
      await this.testSubmitSolution();
      await this.testGetUserHistory();
      await this.testGetUserPerks();
      await this.testGetLeaderboard();

      console.log('✅ All Boss Battle tests completed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  async testCreateBossBattle() {
    console.log('1. Testing Boss Battle Creation...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/quests/boss-battle/create`, {
        username: TEST_USER.username,
        email: TEST_USER.email
      });

      if (response.data.success) {
        this.battleId = response.data.data.battleId;
        console.log('   ✅ Boss battle created successfully');
        console.log(`   📝 Battle ID: ${this.battleId}`);
        console.log(`   🎯 Target Level: ${response.data.data.targetLevel}`);
        console.log(`   🎨 Theme: ${response.data.data.theme}`);
      } else {
        throw new Error('Failed to create boss battle');
      }

    } catch (error) {
      if (error.response?.status === 409) {
        console.log('   ⚠️  User already has active boss battle - this is expected');
        // Try to get existing battle
        const historyResponse = await axios.get(`${BASE_URL}/api/quests/boss-battle/user/${TEST_USER.username}/history?status=initiated`);
        if (historyResponse.data.success && historyResponse.data.data.battles.length > 0) {
          this.battleId = historyResponse.data.data.battles[0].battleId;
          console.log(`   📝 Using existing Battle ID: ${this.battleId}`);
        }
      } else {
        throw error;
      }
    }
  }

  async testGetBossBattle() {
    if (!this.battleId) {
      console.log('2. Skipping Get Boss Battle - no battle ID');
      return;
    }

    console.log('2. Testing Get Boss Battle Details...');
    
    const response = await axios.get(`${BASE_URL}/api/quests/boss-battle/${this.battleId}?username=${TEST_USER.username}`);

    if (response.data.success) {
      console.log('   ✅ Boss battle details retrieved');
      console.log(`   📊 Status: ${response.data.data.status}`);
      console.log(`   ⏰ Remaining Time: ${response.data.data.battleData.remainingTime} hours`);
      console.log(`   🎮 Attempts: ${response.data.data.battleData.attempts}/${response.data.data.battleData.maxAttempts}`);
    } else {
      throw new Error('Failed to get boss battle details');
    }
  }

  async testStartBossBattle() {
    if (!this.battleId) {
      console.log('3. Skipping Start Boss Battle - no battle ID');
      return;
    }

    console.log('3. Testing Start Boss Battle...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/quests/boss-battle/${this.battleId}/start`, {
        username: TEST_USER.username
      });

      if (response.data.success) {
        console.log('   ✅ Boss battle started successfully');
        console.log(`   🚀 Status: ${response.data.data.status}`);
        console.log(`   ⏰ Started At: ${response.data.data.startedAt}`);
      } else {
        throw new Error('Failed to start boss battle');
      }

    } catch (error) {
      if (error.response?.data?.message?.includes('cannot be started')) {
        console.log('   ⚠️  Boss battle already started - this is expected');
      } else {
        throw error;
      }
    }
  }

  async testSubmitSolution() {
    if (!this.battleId) {
      console.log('4. Skipping Submit Solution - no battle ID');
      return;
    }

    console.log('4. Testing Submit Boss Battle Solution...');
    
    const testSolution = `
function solveBoss(input) {
  // Epic boss battle solution
  const data = JSON.parse(input);
  return data.reduce((sum, num) => sum + num, 0);
}
    `;

    try {
      const response = await axios.post(`${BASE_URL}/api/quests/boss-battle/${this.battleId}/submit`, {
        username: TEST_USER.username,
        solution: testSolution
      });

      if (response.data.success) {
        console.log('   ✅ Solution submitted successfully');
        console.log(`   📊 Score: ${response.data.data.score}`);
        console.log(`   🎯 Status: ${response.data.data.status}`);
        console.log(`   👹 Boss Defeated: ${response.data.data.bossDefeated}`);
      } else {
        throw new Error('Failed to submit solution');
      }

    } catch (error) {
      if (error.response?.status === 410) {
        console.log('   ⚠️  Boss battle expired - this is expected for old battles');
      } else {
        throw error;
      }
    }
  }

  async testGetUserHistory() {
    console.log('5. Testing Get User Boss Battle History...');
    
    const response = await axios.get(`${BASE_URL}/api/quests/boss-battle/user/${TEST_USER.username}/history`);

    if (response.data.success) {
      console.log('   ✅ User history retrieved');
      console.log(`   📈 Total Battles: ${response.data.data.summary.total}`);
      console.log(`   🏆 Won: ${response.data.data.summary.won}`);
      console.log(`   💀 Lost: ${response.data.data.summary.lost}`);
      console.log(`   ⚡ Active: ${response.data.data.summary.active}`);
    } else {
      throw new Error('Failed to get user history');
    }
  }

  async testGetUserPerks() {
    console.log('6. Testing Get User Perks...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/quests/boss-battle/user/${TEST_USER.username}/perks`);

      if (response.data.success) {
        console.log('   ✅ User perks retrieved');
        console.log(`   ⭐ Experience Points: ${response.data.data.perks.totalExperiencePoints || 0}`);
        console.log(`   🏆 Boss Battles Won: ${response.data.data.perks.bossBattlesWon || 0}`);
        console.log(`   🎖️  Badges: ${response.data.data.perks.badges?.length || 0}`);
        console.log(`   👑 Titles: ${response.data.data.perks.titles?.length || 0}`);
      } else {
        throw new Error('Failed to get user perks');
      }

    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ⚠️  User not found - create user first in the system');
      } else {
        throw error;
      }
    }
  }

  async testGetLeaderboard() {
    console.log('7. Testing Get Boss Battle Leaderboard...');
    
    const response = await axios.get(`${BASE_URL}/api/quests/boss-battle/leaderboard?limit=5`);

    if (response.data.success) {
      console.log('   ✅ Leaderboard retrieved');
      console.log(`   📊 Top Players: ${response.data.data.leaderboard.length}`);
      
      response.data.data.leaderboard.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.username} - ${player.battlesWon} wins (Avg: ${player.averageScore})`);
      });
    } else {
      throw new Error('Failed to get leaderboard');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new BossBattleTest();
  tester.runTests().catch(console.error);
}

module.exports = BossBattleTest;