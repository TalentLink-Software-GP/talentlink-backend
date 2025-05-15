
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
async function sendJobNotification(tokens, title, company) {
  tokens = tokens.flat().filter((token) => typeof token === 'string' && token.length > 0);

  if (tokens.length === 0) {
    console.error("❌ Error: No valid tokens provided.");
    return;
  }

  for (const token of tokens) {
    const message = {
      notification: { title, body: `New job from ${company}` },
      data: { title, company },
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

module.exports = { sendNotification,sendJobNotification };
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0