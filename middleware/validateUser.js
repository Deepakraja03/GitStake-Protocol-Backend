// GitHub user validation middleware
const validateGitHubUser = (req, res, next) => {
  const { username } = req.body;
  
  // Check required fields
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'GitHub username is required'
    });
  }

  // GitHub username validation
  const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid GitHub username'
    });
  }

  // Username length validation
  if (username.length < 1 || username.length > 39) {
    return res.status(400).json({
      success: false,
      message: 'GitHub username must be between 1 and 39 characters'
    });
  }

  next();
};

module.exports = validateGitHubUser;