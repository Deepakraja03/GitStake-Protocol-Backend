const express = require('express');
const router = express.Router();
const { cronController } = require('../controllers/cronController');

// Cron job management routes
router.get('/status', cronController.getJobsStatus);
router.post('/start-all', cronController.startAllJobs);
router.post('/stop-all', cronController.stopAllJobs);
router.post('/start/:jobName', cronController.startJob);
router.post('/stop/:jobName', cronController.stopJob);
router.post('/trigger/:jobName', cronController.triggerJob);

module.exports = router;