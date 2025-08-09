function registrationEmailTemplate(name) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to GitStake</title>
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
        .logo {
          max-width: 120px;
          margin-bottom: 30px;
          filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.3));
        }
        h2 {
          color: #00ff88;
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        p {
          font-size: 16px;
          color: #e0e0e0;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .highlight {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: bold;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #0a0a0a;
          font-size: 16px;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 25px 0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.2);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
        }
        .features {
          background: #1f1f1f;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border-left: 4px solid #00ff88;
        }
        .features ul {
          text-align: left;
          padding-left: 20px;
          margin: 0;
        }
        .features li {
          margin: 10px 0;
          color: #cccccc;
        }
        hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00ff88, transparent);
          margin: 30px 0;
        }
        .footer {
          font-size: 14px;
          color: #888888;
        }
        .footer a {
          color: #00ff88;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="logo">🚀 GitStake</div>
        <h2>Welcome to <span class="highlight">GitStake!</span></h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Welcome to <span class="highlight">GitStake</span> — where your GitHub contributions unlock rewards and recognition!</p>
        
        <div class="features">
          <h3 style="color: #00ff88; margin-top: 0;">What awaits you:</h3>
          <ul>
            <li>🔍 <strong>AI-Powered Analysis</strong> - Deep GitHub profile insights</li>
            <li>📊 <strong>Developer Levels</strong> - Progress from Code Rookie to Code Titan</li>
            <li>🏆 <strong>Leaderboards</strong> - Compete with developers worldwide</li>
            <li>💎 <strong>Quality Scoring</strong> - Get rewarded for code excellence</li>
            <li>🤝 <strong>Collaboration Metrics</strong> - Track your open-source impact</li>
          </ul>
        </div>
        
        <p>Ready to discover your developer level and start earning recognition?</p>
        <a href="https://gitstake.com/dashboard" class="cta-button">Analyze My GitHub Profile</a>
        
        <p>Questions? Our community is here to help you succeed!</p>
        <p>Happy coding,</p>
        <p><strong>The GitStake Team</strong> 💻</p>
        
        <hr />
        <p class="footer">
          If you didn't sign up, please ignore this email.<br>
          Need help? Contact us at <a href="mailto:support@gitstake.com">support@gitstake.com</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

function levelUpEmailTemplate(name, oldLevel, newLevel) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Level Up Achievement - GitStake</title>
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
          border: 1px solid #ffd700;
        }
        .achievement-badge {
          font-size: 64px;
          margin: 20px 0;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        h2 {
          color: #ffd700;
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .level-progression {
          background: #1f1f1f;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border: 2px solid #ffd700;
        }
        .level-item {
          display: inline-block;
          margin: 10px;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
        }
        .old-level {
          background: #333;
          color: #999;
        }
        .new-level {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #0a0a0a;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #0a0a0a;
          font-size: 16px;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 25px 0;
          transition: all 0.3s ease;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="achievement-badge">🎉</div>
        <h2>Congratulations, ${name}!</h2>
        <p>You've leveled up on GitStake!</p>
        
        <div class="level-progression">
          <h3 style="color: #ffd700; margin-top: 0;">Level Progression</h3>
          <div class="level-item old-level">${oldLevel.name} ${oldLevel.emoji}</div>
          <span style="color: #ffd700; font-size: 24px;">→</span>
          <div class="level-item new-level">${newLevel.name} ${newLevel.emoji}</div>
          <p style="margin-top: 20px; color: #cccccc;">${newLevel.description}</p>
        </div>
        
        <p>Your dedication to quality code and open-source contributions has paid off!</p>
        <a href="https://gitstake.com/profile" class="cta-button">View Your Profile</a>
        
        <p>Keep coding and reach for the next level!</p>
        <p><strong>The GitStake Team</strong> 🚀</p>
      </div>
    </body>
    </html>
  `;
}

function onboardingEmailTemplate(name, githubUsername) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile Analysis Complete - GitStake</title>
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
        h2 {
          color: #00ff88;
          font-size: 28px;
          margin-bottom: 15px;
        }
        .profile-info {
          background: #1f1f1f;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border-left: 4px solid #00ff88;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
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
        <h2>Profile Analysis Complete! 🎯</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your GitHub profile has been successfully analyzed and added to GitStake!</p>
        
        <div class="profile-info">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>GitHub Username:</strong> @${githubUsername}</p>
          <p><strong>Status:</strong> ✅ Analysis Complete</p>
        </div>
        
        <p>Discover your developer level, code quality insights, and see how you rank against other developers!</p>
        <a href="https://gitstake.com/profile/${githubUsername}" class="cta-button">View Your Analysis</a>
        
        <p><strong>The GitStake Team</strong> 💻</p>
      </div>
    </body>
    </html>
  `;
}

function leaderboardEmailTemplate(name, rank, metric) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Leaderboard Achievement - GitStake</title>
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
        .rank-badge {
          font-size: 48px;
          margin: 20px 0;
          color: #ffa500;
        }
        h2 {
          color: #ffa500;
          font-size: 28px;
          margin-bottom: 15px;
        }
        .achievement-box {
          background: #1f1f1f;
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          border: 2px solid #ffa500;
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
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="rank-badge">🏆</div>
        <h2>Leaderboard Achievement!</h2>
        <p>Congratulations <strong>${name}</strong>!</p>
        
        <div class="achievement-box">
          <h3 style="color: #ffa500; margin-top: 0;">You're Ranked #${rank}</h3>
          <p>in <strong>${metric}</strong> on the GitStake leaderboard!</p>
          <p style="color: #cccccc;">Your exceptional contributions have earned you a spot among the top developers.</p>
        </div>
        
        <p>Keep up the amazing work and maintain your position!</p>
        <a href="https://gitstake.com/leaderboard" class="cta-button">View Leaderboard</a>
        
        <p><strong>The GitStake Team</strong> 🚀</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  registrationEmailTemplate,
  levelUpEmailTemplate,
  onboardingEmailTemplate,
  leaderboardEmailTemplate,
};