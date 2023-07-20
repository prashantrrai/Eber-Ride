const cron = require('node-cron');



function myTask() {
    // Your task code here...
    console.log('Task executed at: ', new Date().toLocaleString());
  }


// Schedule the task to run every minute
const cronJob = cron.schedule('* * * * * *', myTask);



module.exports = cronJob;