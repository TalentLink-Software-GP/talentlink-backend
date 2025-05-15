const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const skillsRoutes = require("./routes/skillsRouts");
const userDataRoutes = require("./routes/userDataRouts");
const organaizationRouts = require('./routes/orgnizationRoutes');
const jobRoutes = require('./routes/jobsRoutes');
const locationRoutes = require('./routes/locationRoutes');
const setupSwagger = require("./swagger");
const post = require("./routes/postsRoutes");
const messageRoutes = require("./routes/messageRoutes");

const applications = require("./routes/applicationRoutes");
const User = require('./models/User');
const { sendNotification } = require('./services/firebaseAdmin');

const jobMatch = require('./routes/jobMatchRoutes');
const notifcations=require('./routes/notificationsRoutes');



dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/posts", post);
app.use("/api/users", userDataRoutes);
app.use("/api/organization", organaizationRouts);
app.use("/api/job", jobRoutes);
app.use('/api', messageRoutes);


app.use('/api/location',locationRoutes)


app.use('/api/applications', applications);
app.use('/api/jobMatch',jobMatch)
app.use('/api/notifications',notifcations); 

setupSwagger(app);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

const presenceNamespace = io.of('/presence');

presenceNamespace.on("connection", (socket) => {
  console.log("[Presence] User connected: " + socket.id);
  let userId = null;

  socket.on("register", async (userID) => {
    userId = userID;
    console.log(`[Presence] User ${userID} registered`);
    
    try {
      await User.findByIdAndUpdate(userID, {
        online: true,
        lastSeen: null
        
      });

      presenceNamespace.emit('userStatusUpdate', { 
        userId: userID, 
        isOnline: true 
      });
    } catch (error) {
      console.error('[Presence] Registration error:', error);
    }
  });

  socket.on("updatePresence", async (data) => {
    if (!userId) return;
    
    try {
      await User.findByIdAndUpdate(userId, {
        online: data.isOnline,
        lastSeen: data.isOnline ? null : new Date()
      });
      
      presenceNamespace.emit('userStatusUpdate', { 
        userId, 
        isOnline: data.isOnline 
      });
    } catch (error) {
      console.error('[Presence] Update error:', error);
    }
  });

  socket.on("disconnect", async () => {
    console.log("[Presence] User disconnected: " + socket.id);
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          online: false,
          lastSeen: new Date()
        });
        
        presenceNamespace.emit('userStatusUpdate', { 
          userId, 
          isOnline: false 
        });
      } catch (error) {
        console.error('[Presence] Disconnect error:', error);
      }
    }
  });
});




const chatConnections = new Map();
const callConnections = new Map();

const activeConnections = new Map();
const chatNamespace = io.of('/chat');

chatNamespace.on("connection", (socket) => {
  console.log("[Chat] User connected: " + socket.id);
  let userId = null;

  socket.on("register", (userID) => {
    userId = userID;
    activeConnections.set(userID, {
      socketId: socket.id,
      lastActive: Date.now()
    });
    socket.emit('registrationSuccess', { userId });
  });
  //for notfication
socket.on('registerFCMToken', async ({ userId, fcmToken }) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: fcmToken }
    });
    console.log(`FCM token registered for user ${userId}`);
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
});
socket.on("sendMessage", async (data) => {
  try {
    if (!data.senderId || !data.receiverId || !data.message) {
      throw new Error('Invalid message format - missing required fields');
    }

    // Add timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }

    // Check if receiver is connected
    const recipientSocketId = activeConnections.get(data.receiverId)?.socketId;
    
    if (recipientSocketId) {
      // Receiver is online - send via socket
      chatNamespace.to(recipientSocketId).emit("receiveMessage", data);
      console.log(`[Chat] Message sent via socket to ${data.receiverId}`);
    } 
    
    // Always send push notification if receiver has FCM tokens
    try {
      const recipient = await User.findById(data.receiverId)
        .select('fcmTokens notificationSettings')
        .lean();
      
      const sender = await User.findById(data.senderId)
        .select('username')
        .lean();

      if (recipient?.fcmTokens?.length > 0 && 
          (!recipient.notificationSettings || recipient.notificationSettings.chat !== false)) {
        
        console.log(`[Chat] Push notification sent to ${data.receiverId}`);
      }
    } catch (fcmError) {
      console.error('[Chat] FCM Error:', fcmError);
    }

  } catch (error) {
    console.error('[Chat] Message handling error:', error);
    socket.emit('messageError', { 
      error: error.message,
      code: 'MESSAGE_SEND_FAILED'
    });
  }
});
  socket.on("disconnect", async () => {
    console.log("[Chat] User disconnected: " + socket.id);
    if (userId) {
      activeConnections.delete(userId);
    }
  });
});


const callNamespace = io.of('/calls');
callNamespace.on("connection", (socket) => {
  console.log("[Call] User connected: " + socket.id);

  socket.on("register", (userID) => {
  callConnections.set(userID, {
    socketId: socket.id,
    lastActive: Date.now()
  });
  console.log(`[Call] User ${userID} registered`);
});
socket.on('registerFCMToken', async ({ userId, fcmToken }) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: fcmToken }
    });
    console.log(`FCM token registered for user ${userId}`);
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
});
  socket.on('callRequest', async (data) => {
    const recipientSocketId = callConnections.get(data.receiverId)?.socketId;
    if (recipientSocketId) {
      callNamespace.to(recipientSocketId).emit('callRequest', data);
    } 
    else {
      socket.emit('callFailed', { reason: 'recipient_offline', receiverId: data.receiverId });
    }
      
  });

  socket.on('callAccepted', (data) => {
    console.log(`[Call] Call accepted: ${JSON.stringify(data)}`);
    callNamespace.emit('callAccepted', data);
  });

  socket.on('callRejected', (data) => {
    const callerSocketId = callConnections.get(data.callerId)?.socketId;
    if (callerSocketId) {
      callNamespace.to(callerSocketId).emit('callRejected', data);
    }
  });

  socket.on('callEnded', (data) => {
    console.log(`[Call] Call ended: ${JSON.stringify(data)}`);
    const callerSocket = callConnections.get(data.callerId)?.socketId;
    const receiverSocket = callConnections.get(data.receiverId)?.socketId;
    callNamespace.to(callerSocket).emit('callEnded', data);
    callNamespace.to(receiverSocket).emit('callEnded', data);
  });

  socket.on("disconnect", () => {
    console.log("[Call] User disconnected: " + socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
