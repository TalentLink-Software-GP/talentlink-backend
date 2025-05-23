require('dotenv').config(); 
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
const post = require("./routes/postsRoutes");
const messageRoutes = require("./routes/messageRoutes");
const applications = require("./routes/applicationRoutes");
const jobMatch = require("./routes/jobMatchRoutes");
const notifications = require('./routes/notificationsRoutes');
const setupSwagger = require("./swagger");

const User = require('./models/User');
const { sendNotification } = require('./services/firebaseAdmin');
const meetings= require('./routes/meetingsRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/posts", post);
app.use("/api/users", userDataRoutes);
app.use("/api/organization", organaizationRouts);
app.use("/api/job", jobRoutes);
app.use("/api", messageRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/applications", applications);
app.use("/api/jobMatch", jobMatch);
app.use("/api/notifications", notifications);
app.use("/api/meetings", meetings);

// Swagger Docs
setupSwagger(app);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- Socket.IO Namespaces ---
const activeConnections = new Map();

// --- Presence Namespace ---
const presenceNamespace = io.of('/presence');

presenceNamespace.on("connection", (socket) => {
  //console.log("[Presence] Connected:", socket.id);
  let userId = null;

  socket.on("register", async (id) => {
    userId = id;
    try {
      await User.findByIdAndUpdate(userId, {
        online: true,
        lastSeen: null
      });
      presenceNamespace.emit("userStatusUpdate", { userId, isOnline: true });
    } catch (err) {
      console.error("[Presence] Register Error:", err);
    }
  });

  socket.on("updatePresence", async ({ isOnline }) => {
    if (!userId) return;
    try {
      await User.findByIdAndUpdate(userId, {
        online: isOnline,
        lastSeen: isOnline ? null : new Date()
      });
      presenceNamespace.emit("userStatusUpdate", { userId, isOnline });
    } catch (err) {
      console.error("[Presence] Update Error:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("[Presence] Disconnected:", socket.id);
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          online: false,
          lastSeen: new Date()
        });
        presenceNamespace.emit("userStatusUpdate", { userId, isOnline: false });
      } catch (err) {
        console.error("[Presence] Disconnect Error:", err);
      }
    }
  });
});

// --- Chat Namespace ---
// const chatNamespace = io.of('/chat');

const chatNamespace = io.of('/chat');
chatNamespace.on("connection", (socket) => {
  console.log("[Chat] Connected:", socket.id);
  let userId = null;
  
  socket.on("register", (id) => {
    userId = id;
    activeConnections.set(userId, { socketId: socket.id, lastActive: Date.now() });
    socket.join(userId); // Join a room with the user's ID
    socket.emit("registrationSuccess", { userId });
    console.log(`[Chat] User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("registerFCMToken", async ({ userId, fcmToken }) => {
    try {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { fcmTokens: fcmToken }
      });
      console.log(`✅ FCM token saved for user ${userId}`);
    } catch (err) {
      console.error("[Chat] FCM Token Error:", err);
    }
  });

  socket.on("sendMessage", async (data) => {
    try {
      if (!data.senderId || !data.receiverId || !data.message) {
        throw new Error("Missing fields in message");
      }
      
      data.timestamp = data.timestamp || new Date().toISOString();
      console.log(`[Chat] Message from ${data.senderId} to ${data.receiverId}: ${data.message}`);
      
      // Send to the specific room (user)
      socket.to(data.receiverId).emit("receiveMessage", data);
      
      // Also send back to sender to confirm delivery
      socket.emit("messageDelivered", {
        messageId: data.messageId || Date.now().toString(),
        timestamp: data.timestamp
      });
      
      const recipient = await User.findById(data.receiverId).select('fcmTokens notificationSettings').lean();
      const sender = await User.findById(data.senderId).select('username').lean();
      
      if (recipient?.fcmTokens?.length > 0 &&
          (!recipient.notificationSettings || recipient.notificationSettings.chat !== false)) {
        await sendNotification(recipient.fcmTokens, {
          title: `${sender.username}`,
          body: data.message,
          data: { type: 'chat', senderId: data.senderId }
        });
        console.log(`[Chat] Push notification sent to ${data.receiverId}`);
      }
    } catch (err) {
      console.error("[Chat] sendMessage Error:", err);
      socket.emit("messageError", { error: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("[Chat] Disconnected:", socket.id);
    if (userId) {
      activeConnections.delete(userId);
    }
  });
});
// --- Call Namespace ---
const callNamespace = io.of('/calls');

callNamespace.on("connection", (socket) => {
  console.log("[Call] Connected:", socket.id);
  let userId = null;

  socket.on("register", (id) => {
    userId = id;
    activeConnections.set(userId, { socketId: socket.id, lastActive: Date.now() });
  });

  socket.on("registerFCMToken", async ({ userId, fcmToken }) => {
    try {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { fcmTokens: fcmToken }
      });
      console.log(`[Call] FCM token saved for user ${userId}`);
    } catch (err) {
      console.error("[Call] FCM Token Error:", err);
    }
  });

  socket.on("callRequest", async (data) => {
    const targetSocket = activeConnections.get(data.receiverId)?.socketId;
    if (targetSocket) {
      callNamespace.to(targetSocket).emit("callRequest", data);
    } else {
      socket.emit("callFailed", { reason: "recipient_offline" });
    }
  });

  socket.on("callAccepted", (data) => {
    callNamespace.to(activeConnections.get(data.callerId)?.socketId).emit("callAccepted", data);
  });

  socket.on("callRejected", (data) => {
    callNamespace.to(activeConnections.get(data.callerId)?.socketId).emit("callRejected", data);
  });

  socket.on("callEnded", (data) => {
    [data.callerId, data.receiverId].forEach(id => {
      const target = activeConnections.get(id)?.socketId;
      if (target) callNamespace.to(target).emit("callEnded", data);
    });
  });

  socket.on("disconnect", () => {
    console.log("[Call] Disconnected:", socket.id);
    if (userId) activeConnections.delete(userId);
  });
});

// Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
