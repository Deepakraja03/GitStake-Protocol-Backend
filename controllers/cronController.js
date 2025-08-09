let cronService = null;

// Lazy initialization to avoid circular dependencies
function getCronService() {
  if (!cronService) {
    const CronService = require('../services/cronService');
    cronService = new CronService();
    cronService.initializeCronJobs();
  }
  return cronService;
}

const cronController = {
  // Get status of all cron jobs
  getJobsStatus: async (req, res, next) => {
    try {
      const jobsStatus = getCronService().getJobsStatus();

      res.status(200).json({
        success: true,
        data: jobsStatus,
        message: 'Cron jobs status retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Start all cron jobs
  startAllJobs: async (req, res, next) => {
    try {
      getCronService().startAllJobs();

      res.status(200).json({
        success: true,
        message: 'All cron jobs started successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Stop all cron jobs
  stopAllJobs: async (req, res, next) => {
    try {
      getCronService().stopAllJobs();

      res.status(200).json({
        success: true,
        message: 'All cron jobs stopped successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Start specific job
  startJob: async (req, res, next) => {
    try {
      const { jobName } = req.params;
      const success = getCronService().startJob(jobName);

      if (success) {
        res.status(200).json({
          success: true,
          message: `Job ${jobName} started successfully`
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Job ${jobName} not found`
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // Stop specific job
  stopJob: async (req, res, next) => {
    try {
      const { jobName } = req.params;
      const success = getCronService().stopJob(jobName);

      if (success) {
        res.status(200).json({
          success: true,
          message: `Job ${jobName} stopped successfully`
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Job ${jobName} not found`
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // Manually trigger a job
  triggerJob: async (req, res, next) => {
    try {
      const { jobName } = req.params;
      await getCronService().triggerJob(jobName);

      res.status(200).json({
        success: true,
        message: `Job ${jobName} triggered successfully`
      });
    } catch (error) {
      next(error);
    }
  }
};

// Auto-start cron jobs when the controller is loaded
if (process.env.NODE_ENV === 'production' || process.env.AUTO_START_CRON === 'true') {
  setTimeout(() => {
    getCronService().startAllJobs();
    console.log('Cron jobs auto-started');
  }, 1000);
}

module.exports = { cronController, getCronService };