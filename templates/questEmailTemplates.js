function questStakingTemplate(username, quest) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Quest Available - GitStake</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0a0a0a;
          margin: 0;
          padding: 0;
          color: #ffffff;
        }
        .email-container {
          max-width: 600px;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          margin: 30px auto;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(255, 165, 0, 0.1);
          text-align: center;
          border: 1px solid #ffa500;
        }
        .quest-badge {
          font-size: 48px;
          margin: 20px 0;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        h2 {
          color: #ffa500;
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .quest-details {
          background: #1f1f1f;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border: 2px solid #ffa500;
          text-align: left;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #333;
        }
        .detail-label {
          font-weight: 600;
          color: #ffa500;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #ffa500, #ff8c00);
          color: #0a0a0a;
          font-size: 16px;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 25px 0;
          transition: all 0.3s ease;
        }
        .schedule {
          background: #252525;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .schedule-item {
          margin: 8px 0;
          color: #cccccc;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="quest-badge">🎯</div>
        <h2>New Quest Available!</h2>
        <p>Hey <strong>${username}</strong>!</p>
        <p>A new coding quest is ready for your developer level. Time to show your skills!</p>
        
        <div class="quest-details">
          <h3 style="color: #ffa500; margin-top: 0;">${quest.title}</h3>
          <div class="detail-row">
            <span class="detail-label">Level:</span>
            <span>${quest.developerLevel}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span>${quest.challengeType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tech Stack:</span>
            <span>${quest.techStack.join(', ')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span>${quest.duration}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Difficulty:</span>
            <span>${quest.difficulty}</span>
          </div>
        </div>

        <div class="schedule">
          <h4 style="color: #ffa500; margin-top: 0;">Quest Schedule</h4>
          <div class="schedule-item">📅 <strong>Staking:</strong> ${new Date(quest.schedule.stakingStart).toLocaleDateString()} - ${new Date(quest.schedule.stakingEnd).toLocaleDateString()}</div>
          <div class="schedule-item">⚡ <strong>Challenge:</strong> ${new Date(quest.schedule.challengeStart).toLocaleDateString()} - ${new Date(quest.schedule.challengeEnd).toLocaleDateString()}</div>
          <div class="schedule-item">🏆 <strong>Results:</strong> ${new Date(quest.schedule.resultsAnnouncement).toLocaleDateString()}</div>
        </div>
        
        <p><strong>Stake now to participate!</strong> Staking period ends on ${new Date(quest.schedule.stakingEnd).toLocaleDateString()}.</p>
        <a href="https://gitstake.com/quests/${quest.questId}" class="cta-button">Stake for Quest</a>
        
        <p>Good luck, and may the code be with you!</p>
        <p><strong>The GitStake Team</strong> 🚀</p>
      </div>
    </body>
    </html>
  `;
}

function questChallengeTemplate(username, quest) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quest Challenge Started - GitStake</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0a0a0a;
          margin: 0;
          padding: 0;
          color: #ffffff;
        }
        .email-container {
          max-width: 600px;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          margin: 30px auto;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 255, 136, 0.1);
          text-align: center;
          border: 1px solid #00ff88;
        }
        .challenge-badge {
          font-size: 48px;
          margin: 20px 0;
          animation: bounce 1s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        h2 {
          color: #00ff88;
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .countdown {
          background: #1f1f1f;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
          border: 2px solid #00ff88;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #0a0a0a;
          font-size: 18px;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          margin: 25px 0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="challenge-badge">⚡</div>
        <h2>Challenge Started!</h2>
        <p>Hey <strong>${username}</strong>!</p>
        <p>The quest challenge is now <strong>LIVE</strong>! Time to put your coding skills to the test.</p>
        
        <div class="countdown">
          <h3 style="color: #00ff88; margin-top: 0;">${quest.title}</h3>
          <p style="font-size: 18px; margin: 15px 0;">⏰ <strong>Challenge ends:</strong> ${new Date(quest.schedule.challengeEnd).toLocaleString()}</p>
          <p style="color: #cccccc;">You have until Thursday night to submit your solution!</p>
        </div>
        
        <p><strong>What you need to do:</strong></p>
        <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
          <li>Read the problem statement carefully</li>
          <li>Write your solution in ${quest.techStack[0]}</li>
          <li>Test your code thoroughly</li>
          <li>Submit before the deadline</li>
        </ul>
        
        <a href="https://gitstake.com/quests/${quest.questId}/solve" class="cta-button">Start Coding Now!</a>
        
        <p>Remember: Quality over speed. Good luck!</p>
        <p><strong>The GitStake Team</strong> 💻</p>
      </div>
    </body>
    </html>
  `;
}

function questResultsTemplate(username, quest, winner = null) {
  const isWinner = !!winner;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quest Results - GitStake</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0a0a0a;
          margin: 0;
          padding: 0;
          color: #ffffff;
        }
        .email-container {
          max-width: 600px;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          margin: 30px auto;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.1);
          text-align: center;
          border: 1px solid ${isWinner ? '#ffd700' : '#666'};
        }
        .results-badge {
          font-size: 48px;
          margin: 20px 0;
        }
        h2 {
          color: ${isWinner ? '#ffd700' : '#cccccc'};
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .results-box {
          background: #1f1f1f;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border: 2px solid ${isWinner ? '#ffd700' : '#666'};
        }
        .score-display {
          font-size: 36px;
          font-weight: bold;
          color: ${isWinner ? '#ffd700' : '#00ff88'};
          margin: 15px 0;
        }
        .rank-display {
          font-size: 24px;
          color: ${isWinner ? '#ffd700' : '#cccccc'};
          margin: 10px 0;
        }
        .rewards {
          background: #252525;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${isWinner ? '#ffd700, #ffed4e' : '#00ff88, #00cc6a'});
          color: #0a0a0a;
          font-size: 16px;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 25px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="results-badge">${isWinner ? '🏆' : '📊'}</div>
        <h2>${isWinner ? 'Congratulations!' : 'Quest Results'}</h2>
        <p>Hey <strong>${username}</strong>!</p>
        
        ${isWinner ? 
          `<p>🎉 <strong>You WON the quest!</strong> Amazing work on solving the challenge.</p>` :
          `<p>The quest results are in! Thanks for participating in the challenge.</p>`
        }
        
        <div class="results-box">
          <h3 style="color: ${isWinner ? '#ffd700' : '#cccccc'}; margin-top: 0;">${quest.title}</h3>
          
          ${winner ? `
            <div class="rank-display">🥇 Rank: #${winner.rank}</div>
            <div class="score-display">${winner.score} points</div>
            
            <div class="rewards">
              <h4 style="color: #ffd700; margin-top: 0;">Your Rewards</h4>
              <p>🏆 <strong>Points:</strong> ${winner.rewards.points}</p>
              <p>🎖️ <strong>Badge:</strong> ${winner.rewards.badge}</p>
              <p>👑 <strong>Title:</strong> ${winner.rewards.title}</p>
            </div>
          ` : `
            <p>Thanks for participating! Every challenge makes you a better developer.</p>
            <div class="rewards">
              <h4 style="color: #00ff88; margin-top: 0;">Participation Rewards</h4>
              <p>🎖️ <strong>Points:</strong> ${quest.rewards.participation.points}</p>
              <p>🏅 <strong>Badge:</strong> ${quest.rewards.participation.badge}</p>
            </div>
          `}
        </div>

        <div style="background: #252525; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="color: #cccccc; margin-top: 0;">Quest Statistics</h4>
          <p>👥 <strong>Total Participants:</strong> ${quest.statistics.totalStaked}</p>
          <p>📝 <strong>Submissions:</strong> ${quest.statistics.totalSubmissions}</p>
          <p>📊 <strong>Completion Rate:</strong> ${Math.round(quest.statistics.completionRate)}%</p>
        </div>
        
        <a href="https://gitstake.com/quests/${quest.questId}/results" class="cta-button">View Full Results</a>
        
        <p>${isWinner ? 'Keep up the excellent work!' : 'Keep coding and improving!'}</p>
        <p><strong>The GitStake Team</strong> 🚀</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  questStakingTemplate,
  questChallengeTemplate,
  questResultsTemplate,
};