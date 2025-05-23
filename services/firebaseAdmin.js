
const admin = require('firebase-admin');
const serviceAccount = require('./talentlink-187ca-firebase-adminsdk-fbsvc-a056735928.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendNotification(tokens, title, body, data) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    console.error("❌ Error: Tokens must be a non-empty array.");
    return;
  }

  for (const token of tokens) {
    const message = {
      notification: { title, body },
      data: data,
      token: token,
    };

    try {
      console.log(`Sending notification to ${token}:`, message);
      const response = await admin.messaging().send(message);
      console.log(`✅ Notification sent to ${token}:`, response);
    } catch (error) {
      console.error(`❌ Error sending notification to ${token}:`, error.message);
    }
  }
}
async function sendJobNotification(tokens, title, company,jobId) {
  tokens = tokens.flat().filter((token) => typeof token === 'string' && token.length > 0);

  if (tokens.length === 0) {
    console.error("❌ Error: No valid tokens provided.");
    return;
  }

  for (const token of tokens) {
    const message = {
      notification: { title, body: `New job from ${company}` },
     data: { 
        type: 'job', 
        title: String(title), 
        company: String(company), 
        jobId: String(jobId)  // Convert jobId to a string
      },
      token: token,  
    };

    try {
      console.log(`Sending job notification to token: ${token}`);
      const response = await admin.messaging().send(message);
      console.log(`✅ Job notification sent successfully to ${token}:`, response);
    } catch (error) {
      console.error(`❌ Error sending job notification to ${token}:`, error.message);
    }
  }
}



async function sendMeetingNotification(token, meetingData) {
  if (typeof token !== 'string' || !token.trim()) {
    console.error('❌ Invalid FCM token provided');
    return;
  }

  const {senderName, title, scheduledDateTime, meetingId, meetingLink, organizationId } = meetingData;

  const message = {
    token, // ✅ must be a string
    notification: {
      title: 'Meeting Scheduled',
      body: `Your meeting with ${senderName} is scheduled for ${scheduledDateTime}`,
    },
    data: {
      type: 'meeting',
      meetingId: String(meetingId),
      meetingLink: String(meetingLink),
      scheduledDateTime: String(scheduledDateTime),
      organizationId: String(organizationId),
      title: String(title),
    },
  };

  try {
    console.log('Sending meeting notification to:', token);
    const response = await admin.messaging().send(message);
    console.log('✅ Meeting notification sent:', response);
  } catch (error) {
    console.error('❌ Error sending meeting notification:', error.message);
  }
}

async function sendApplicantNotification(tokens, applicantData) {
  tokens = tokens.flat().filter(token => typeof token === 'string' && token.length > 0);

  if (tokens.length === 0) {
    console.error('❌ No valid FCM tokens provided for applicant notification.');
    return;
  }

  const { jobId, jobTitle, applicantName, applicantUsername, organizationId } = applicantData;

  for (const token of tokens) {
    const message = {
      token,
      notification: {
        title: `New Applicant for ${jobTitle}`,
        body: `${applicantName} has applied for your job.`,
      },
      data: {
        type: 'application',
        jobId: jobId,
        jobTitle: jobTitle,
        applicantName: applicantName,
        applicantUsername: applicantUsername,
        organizationId: organizationId
      }
    };

    try {
      console.log('Sending applicant notification to:', token);
      const response = await admin.messaging().send(message);
      console.log('✅ Applicant notification sent:', response);
    } catch (error) {
      console.error('❌ Error sending applicant notification:', error.message);
    }
  }
}

module.exports = { sendNotification,sendJobNotification,sendMeetingNotification,sendApplicantNotification };
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0