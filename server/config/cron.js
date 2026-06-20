const cron = require('node-cron');
const { syncMatches } = require('../routes/matches');

function startCronJobs() {
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running scheduled match sync...');
    try {
      const result = await syncMatches();
      console.log(`Sync complete: ${result.matchesCount} matches, ${result.scoredCount} newly scored`);
    } catch (error) {
      console.error('Scheduled sync failed:', error.message);
    }
  });

  console.log('Cron job scheduled: match sync every 15 minutes');
}

module.exports = startCronJobs;
