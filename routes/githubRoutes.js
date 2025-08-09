const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

// GitHub Profile Routes
router.get('/profile/:username', githubController.getProfile);
router.get('/profile/:username/events', githubController.getProfileEvents);
router.get('/profile/:username/followers', githubController.getFollowers);
router.get('/profile/:username/following', githubController.getFollowing);

// Repository Routes
router.get('/repos/:username', githubController.getUserRepositories);
router.get('/repos/:owner/:repo', githubController.getRepository);
router.get('/repos/:owner/:repo/commits', githubController.getRepositoryCommits);
router.get('/repos/:owner/:repo/contributors', githubController.getRepositoryContributors);
router.get('/repos/:owner/:repo/languages', githubController.getRepositoryLanguages);
router.get('/repos/:owner/:repo/stats', githubController.getRepositoryStats);

// Pull Requests Routes
router.get('/repos/:owner/:repo/pulls', githubController.getRepositoryPullRequests);
router.get('/repos/:owner/:repo/pulls/:pull_number', githubController.getPullRequest);
router.get('/repos/:owner/:repo/pulls/:pull_number/commits', githubController.getPullRequestCommits);
router.get('/repos/:owner/:repo/pulls/:pull_number/files', githubController.getPullRequestFiles);

// Issues Routes
router.get('/repos/:owner/:repo/issues', githubController.getRepositoryIssues);
router.get('/repos/:owner/:repo/issues/:issue_number', githubController.getIssue);
router.get('/repos/:owner/:repo/issues/:issue_number/comments', githubController.getIssueComments);

// Advanced Analytics Routes
router.get('/analytics/:username/complexity', githubController.getCodeComplexity);
router.get('/analytics/:username/activity', githubController.getActivityAnalytics);
router.get('/analytics/:username/collaboration', githubController.getCollaborationMetrics);
router.get('/analytics/:username/quality', githubController.getCodeQuality);
router.get('/analytics/:username/trends', githubController.getTrendAnalysis);

// Search Routes
router.get('/search/repositories', githubController.searchRepositories);
router.get('/search/users', githubController.searchUsers);
router.get('/search/code', githubController.searchCode);

// Organization Routes
router.get('/orgs/:org', githubController.getOrganization);
router.get('/orgs/:org/repos', githubController.getOrganizationRepos);
router.get('/orgs/:org/members', githubController.getOrganizationMembers);

// Gist Routes
router.get('/gists/:username', githubController.getUserGists);
router.get('/gists/:gist_id', githubController.getGist);

// Rate Limit Route
router.get('/rate-limit', githubController.getRateLimit);

module.exports = router;