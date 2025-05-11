// const admin = require('firebase-admin');
// const serviceAccount = require('./talentlink-187ca-firebase-adminsdk-fbsvc-a056735928.json');

// // Initialize with proper configuration
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://talentlink-187ca.firebaseio.com' // Add your Firebase project URL
// });

// const sendNotification = async (tokens, title, body, data = {}) => {
//   if (!tokens || tokens.length === 0) {
//     console.log('No tokens provided for notification');
//     return { success: false, error: 'No tokens provided' };
//   }

//   // Filter out invalid tokens and deduplicate
//   const validTokens = [...new Set(
//   tokens.filter(token =>
//     token && 
//     typeof token === 'string' && 
//     token.length > 100 && // FCM tokens are typically long
//     (token.startsWith('c') || token.startsWith('d') || token.startsWith('APA')) // More inclusive check
//   )
// )];

//   if (validTokens.length === 0) {
//     console.log('No valid FCM tokens available');
//     return { success: false, error: 'No valid tokens' };
//   }

//   // Prepare notification payload
//   const message = {
//     notification: { 
//       title: title || 'New Notification',
//       body: body || 'You have a new notification',
//     },
//     data: {
//       ...data,
//       // Ensure these are included for Flutter
//       click_action: 'FLUTTER_NOTIFICATION_CLICK',
//       notification_foreground: 'true',
//       // Add sound for both platforms
//       sound: 'default',
//       // Add badge count for iOS
//       badge: '1'
//     },
//     tokens: validTokens,
//     android: {
//       priority: 'high',
//       notification: {
//         sound: 'default',
//         channel_id: 'chat_messages', // Create this channel in your Flutter app
//         icon: 'ic_notification', // Your notification icon
//         color: '#0C9E91', // Your app's primary color
//       }
//     },
//     apns: {
//       payload: {
//         aps: {
//           sound: 'default',
//           badge: 1,
//           mutableContent: 1, // For rich notifications
//           category: 'CHAT_CATEGORY' // For interactive notifications
//         }
//       },
//       fcmOptions: {
//         imageUrl: data.senderImage // For rich notifications with sender image
//       }
//     },
//     webpush: {
//       headers: {
//         Urgency: 'high'
//       }
//     }
//   };

//   try {
//     // Split into chunks of 500 tokens (FCM limit)
//     const chunkSize = 500;
//     const tokenChunks = [];
//     for (let i = 0; i < validTokens.length; i += chunkSize) {
//       tokenChunks.push(validTokens.slice(i, i + chunkSize));
//     }

//     const results = [];
//     for (const chunk of tokenChunks) {
//       const chunkMessage = { ...message, tokens: chunk };
//       const response = await admin.messaging().sendMulticast(chunkMessage);
//       results.push(response);
      
//       // Process failures to remove invalid tokens
//       response.responses.forEach((resp, idx) => {
//         if (!resp.success) {
//           console.error('Failed to send to token:', chunk[idx], 'Error:', resp.error);
//           // Handle token removal for specific errors
//           if (resp.error.code === 'messaging/invalid-registration-token' || 
//               resp.error.code === 'messaging/registration-token-not-registered') {
//             // Call a function to remove this token from user's record
//             removeInvalidToken(chunk[idx], data.receiverId);
//           }
//         }
//       });
//     }

//     return { 
//       success: true, 
//       results,
//       message: 'Notifications sent successfully' 
//     };
//   } catch (error) {
//     console.error('Error sending notifications:', error);
//     return { 
//       success: false, 
//       error: error.message,
//       code: error.code || 'UNKNOWN_ERROR'
//     };
//   }
// };

// // Helper function to remove invalid tokens
// async function removeInvalidToken(token, userId) {
//   try {
//     await User.updateOne(
//       { _id: userId },
//       { $pull: { fcmTokens: token } }
//     );
//     console.log(`Removed invalid token for user ${userId}`);
//   } catch (err) {
//     console.error('Error removing invalid token:', err);
//   }
// }

// module.exports = { sendNotification };
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
module.exports = { sendNotification };
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0
//cagQR6NbT62uD8weXhgiYe:APA91bGcC2fCMV-AsRxgs8z8WuP3Hr-Gab6yiaILQFeTekiaMDSrvtElpfUYhYF0Jt0Q9y4g_cPsvG6ROyPkRKzFM_EoX9H5QX-iPphmbl8mkQTI5dAPKQ0