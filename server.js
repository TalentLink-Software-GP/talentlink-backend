const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const skillsRoutes = require("./routes/skillsRouts");
const userDataRoutes = require("./routes/userDataRouts");
const organaizationRouts = require('./routes/orgnizationRoutes');
const jobRoutes = require('./routes/jobsRoutes');
const setupSwagger = require("./swagger");
const post = require("./routes/postsRoutes");
const messageRoutes = require("./routes/messageRoutes");
const socketIo = require("socket.io");
const videoMeetingRoutes = require('./routes/videoMeetingroutes');


dotenv.config();

const app = express();
const server = http.createServer(app); 

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;



const io = socketIo(server, {
    cors: {
      origin: "*",
    },
  });


app.use(cors());
app.use(express.json());
// io.on('connection', (socket) => {
//     console.log('New socket connection established');
//     console.log(socket.id,"awwad Joined the chat");
//     socket.on("test",(msg)=>{
//         console.log(msg);
//     });
// });


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/posts", post);
app.use("/api/users", userDataRoutes);
app.use("/api/organization", organaizationRouts);
app.use("/api/job", jobRoutes);
app.use('/api', messageRoutes);
app.use('/api', videoMeetingRoutes);


setupSwagger(app);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const activeConnections = new Map();

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);
  let userId = null;

 
  let messageCount = 0;
  let lastResetTime = Date.now();

  socket.on("sendMessage", (data) => {
      try {
          const now = Date.now();
          if (now - lastResetTime > 60000) { 
              messageCount = 0;
              lastResetTime = now;
          }
          
          if (messageCount >= 100) {
              console.log("Rate limit exceeded for socket:", socket.id);
              return socket.emit('rateLimitExceeded', { 
                  userId: data.senderId,
                  limit: 100,
                  window: 'minute'
              });
          }
          
          messageCount++;

          if (!data.senderId || !data.receiverId || !data.message) {
              throw new Error('Invalid message format');
          }

          const messageWithTimestamp = {
              ...data,
              timestamp: new Date().toISOString(),
          };

          const recipientSocketId = activeConnections.get(data.receiverId)?.socketId;
          if (recipientSocketId) {
              io.to(recipientSocketId).emit("receiveMessage", messageWithTimestamp);
          }
          
          socket.emit("receiveMessage", messageWithTimestamp);

        

      } catch (error) {
          console.error('Message handling error:', error);
          socket.emit('messageError', { 
              error: error.message,
              originalData: data
          });
      }
  });

 
  socket.on("register", (userID) => {
      userId = userID;
      activeConnections.set(userID, {
          socketId: socket.id,
          lastActive: Date.now()
      });
      console.log(`Registered user ${userID} with socket ${socket.id}`);
      socket.emit('registrationSuccess', { userId });
  });

  socket.on('callRequest', (data) => {
      const recipientSocketId = activeConnections.get(data.receiverId)?.socketId;
      if (recipientSocketId) {
          io.to(recipientSocketId).emit('callRequest', data);
      } else {
          console.log(`Recipient ${data.receiverId} not found`);
          socket.emit('callFailed', { 
              reason: 'recipient_offline',
              receiverId: data.receiverId
          });
      }
  });

  socket.on('callAccepted', (data) => {
    console.log(`Call accepted: ${JSON.stringify(data)}`);
    
    io.emit('callAccepted', data);
    
   
  });

  socket.on('callRejected', (data) => {
      const callerSocketId = activeConnections.get(data.callerId)?.socketId;
      if (callerSocketId) {
          io.to(callerSocketId).emit('callRejected', data);
      }
  });

  socket.on('callEnded', (data) => {
      const callerSocketId = activeConnections.get(data.callerId)?.socketId;
      const receiverSocketId = activeConnections.get(data.receiverId)?.socketId;
      
      if (callerSocketId) io.to(callerSocketId).emit('callEnded', data);
      if (receiverSocketId) io.to(receiverSocketId).emit('callEnded', data);
  });

 
  socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
      if (userId) {
          activeConnections.delete(userId);
      }
  });
});
  

server.listen(PORT, "0.0.0.0",() => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
