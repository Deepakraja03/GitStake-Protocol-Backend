const cron = require('node-cron');
const QuestService = require('./questService');

class CronService {
  constructor() {
    this.questService = new QuestService();
    this.jobs = [];
  }

  /**
   * Initialize all cron jobs
   */
  initializeCronJobs() {
    console.log('Initializing cron jobs for GitStake quest system...');

    // Sunday at 00:00 - Auto-generate weekly quests and start staking
    const weeklyQuestJob = cron.schedule('0 0 * * 0', async () => {
      console.log('Running weekly quest generation...');
      try {
        await this.questService.autoGenerateWeeklyQuests();
        console.log('Weekly quests generated successfully');
      } catch (error) {
        console.error('Failed to generate weekly quests:', error.message);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    // Every hour - Update quest statuses based on schedule
    const statusUpdateJob = cron.schedule('0 * * * *', async () => {
      console.log('Updating quest statuses...');
      try {
        await this.questService.updateQuestStatuses();
        console.log('Quest statuses updated successfully');
      } catch (error) {
        console.error('Failed to update quest statuses:', error.message);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    // Daily at 09:00 - Send scheduled notifications
    const notificationJob = cron.schedule('0 9 * * *', async () => {
      console.log('Sending scheduled notifications...');
      try {
        await this.questService.sendScheduledNotifications();
        console.log('Scheduled notifications sent successfully');
      } catch (error) {
        console.error('Failed to send scheduled notifications:', error.message);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    // Friday at 01:00 - Process closed quest results
    const resultsProcessingJob = cron.schedule('0 1 * * 5', async () => {
      console.log('Processing closed quest results...');
      try {
        const closedQuests = await require('../models/Quest').find({ status: 'closed' });
        for (const quest of closedQuests) {
          try {
            await this.questService.processQuestResults(quest.questId);
          } catch (error) {
            console.error(`Failed to process quest ${quest.questId}:`, error.message);
          }
        }
        console.log('Closed quest results processed successfully');
      } catch (error) {
        console.error('Failed to process closed quest results:', error.message);
      }
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs = [
      { name: 'weeklyQuestGeneration', job: weeklyQuestJob, description: 'Generate weekly quests every Sunday' },
      { name: 'statusUpdate', job: statusUpdateJob, description: 'Update quest statuses every hour' },
      { name: 'notifications', job: notificationJob, description: 'Send scheduled notifications daily at 9 AM' },
      { name: 'resultsProcessing', job: resultsProcessingJob, description: 'Process quest results every Friday' }
    ];

    console.log(`Initialized ${this.jobs.length} cron jobs`);
  }

  /**
   * Start all cron jobs
   */
  startAllJobs() {
    console.log('Starting all cron jobs...');
    this.jobs.forEach(({ name, job, description }) => {
      job.start();
      console.log(`✓ Started: ${name} - ${description}`);
    });
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    console.log('Stopping all cron jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`✓ Stopped: ${name}`);
    });
  }

  /**
   * Start specific job
   */
  startJob(jobName) {
    const jobInfo = this.jobs.find(j => j.name === jobName);
    if (jobInfo) {
      jobInfo.job.start();
      console.log(`✓ Started job: ${jobName}`);
      return true;
    }
    console.error(`Job not found: ${jobName}`);
    return false;
  }

  /**
   * Stop specific job
   */
  stopJob(jobName) {
    const jobInfo = this.jobs.find(j => j.name === jobName);
    if (jobInfo) {
      jobInfo.job.stop();
      console.log(`✓ Stopped job: ${jobName}`);
      return true;
    }
    console.error(`Job not found: ${jobName}`);
    return false;
  }

  /**
   * Get job status
   */
  getJobsStatus() {
    return this.jobs.map(({ name, job, description }) => ({
      name,
      description,
      running: job.running || false
    }));
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobName) {
    console.log(`Manually triggering job: ${jobName}`);
    
    try {
      switch (jobName) {
        case 'weeklyQuestGeneration':
          await this.questService.autoGenerateWeeklyQuests();
          break;
        case 'statusUpdate':
          await this.questService.updateQuestStatuses();
          break;
        case 'notifications':
          await this.questService.sendScheduledNotifications();
          break;
        case 'resultsProcessing':
          const closedQuests = await require('../models/Quest').find({ status: 'closed' });
          for (const quest of closedQuests) {
            await this.questService.processQuestResults(quest.questId);
          }
          break;
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }
      console.log(`✓ Job ${jobName} completed successfully`);
      return true;
    } catch (error) {
      console.error(`✗ Job ${jobName} failed:`, error.message);
      throw error;
    }
  }
}

module.exports = CronService;