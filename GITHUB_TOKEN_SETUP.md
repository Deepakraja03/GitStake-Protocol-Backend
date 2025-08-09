# GitHub Personal Access Token Setup

## 🔑 How to Create a GitHub Personal Access Token

### Step 1: Go to GitHub Settings
1. Log in to your GitHub account
2. Click on your profile picture (top right)
3. Select **Settings**

### Step 2: Navigate to Developer Settings
1. Scroll down in the left sidebar
2. Click on **Developer settings** (at the bottom)

### Step 3: Create Personal Access Token
1. Click on **Personal access tokens**
2. Select **Tokens (classic)**
3. Click **Generate new token**
4. Select **Generate new token (classic)**

### Step 4: Configure Token Settings
1. **Note**: Enter a descriptive name like "GitStake API Access"
2. **Expiration**: Choose your preferred expiration (30 days, 60 days, 90 days, or No expiration)
3. **Select scopes**: Check the following permissions:

#### Required Scopes for GitStake:
- ✅ **public_repo** - Access public repositories
- ✅ **read:user** - Read user profile information
- ✅ **user:email** - Access user email addresses
- ✅ **read:org** - Read organization membership and teams
- ✅ **repo:status** - Access commit status
- ✅ **repo_deployment** - Access deployment statuses

#### Optional (for enhanced features):
- ✅ **read:discussion** - Read discussions
- ✅ **read:packages** - Read packages
- ✅ **read:project** - Read projects

### Step 5: Generate and Copy Token
1. Click **Generate token**
2. **IMPORTANT**: Copy the token immediately (you won't see it again!)
3. The token will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 6: Update Your .env File
Replace the placeholder in your `.env` file:

```env
GITHUB_TOKEN=ghp_your_actual_token_here
```

## 🚨 Security Important Notes

1. **Never commit your token to git** - It's already in `.gitignore`
2. **Keep your token secure** - Don't share it publicly
3. **Regenerate if compromised** - You can always create a new one
4. **Use minimal permissions** - Only select the scopes you need

## 🧪 Test Your Token

After setting up your token, test it with:

```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

Or use the GitStake API:

```bash
curl -X POST http://localhost:3000/api/users/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "octocat"}'
```

## 📊 Rate Limits

With a personal access token, you get:
- **5,000 requests per hour** (vs 60 for unauthenticated)
- **Better access to user data**
- **Access to private repositories** (if scoped)

## 🔄 Token Management

### To check your current rate limit:
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit
```

### To regenerate a token:
1. Go back to GitHub Settings → Developer settings → Personal access tokens
2. Find your token and click **Regenerate token**
3. Update your `.env` file with the new token

## ✅ Verification

Once you've set up your token correctly, your GitStake server should:
1. ✅ Start without "Bad credentials" errors
2. ✅ Successfully analyze GitHub users
3. ✅ Access repository data and statistics
4. ✅ Generate developer level assessments

## 🆘 Troubleshooting

### "Bad credentials" error:
- Double-check your token is copied correctly
- Ensure no extra spaces in the `.env` file
- Verify the token hasn't expired
- Make sure you selected the right scopes

### "Not Found" errors:
- Check if the GitHub username exists
- Verify the repository is public (or you have access)
- Ensure your token has the right permissions

### Rate limit exceeded:
- Wait for the rate limit to reset (shown in API response)
- Consider implementing request delays in your application
- Use the `/api/github/rate-limit` endpoint to monitor usage

---

**Need help?** Check the [GitHub Personal Access Token Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)