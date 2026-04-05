const cron = require('node-cron');
const config = require('../config');
const emailMarketingService = require('../services/email-marketing.service');

let isScheduled = false;

const startFarmerDailyEmailJob = () => {
  if (isScheduled) {
    return;
  }

  cron.schedule(config.dailyFarmerEmailCron, async () => {
    try {
      await emailMarketingService.sendDailyFarmerRecommendations();
    } catch (error) {
      console.error('Daily farmer email job failed:', error.message);
    }
  }, {
    timezone: config.cronTimezone
  });

  isScheduled = true;
  console.log(`Daily farmer email job scheduled for "${config.dailyFarmerEmailCron}" in ${config.cronTimezone}`);
};

module.exports = {
  startFarmerDailyEmailJob
};
