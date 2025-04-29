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

setupSwagger(app);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const activeConnections = new Map();


//sockets
io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);
  
    // Add rate limiting if needed
    let messageCount = 0;
    let lastResetTime = Date.now();

    socket.on("sendMessage", (data) => {
        const now = Date.now();
        if (now - lastResetTime > 60000) { 
          messageCount = 0;
          lastResetTime = now;
        }
      
        if (messageCount < 100) { 
          messageCount++;
      
          const messageWithTimestamp = {
            ...data,
            timestamp: new Date().toISOString(),
          };
      
          io.emit("receiveMessage", messageWithTimestamp);
        } else {
          console.log("Rate limit exceeded for socket:", socket.id);
        }
      });
  
    // socket.on("sendMessage", async (data) => {
    //     const now = Date.now();
    //     if (now - lastResetTime > 60000) { 
    //       messageCount = 0;
    //       lastResetTime = now;
    //     }
      
    //     if (messageCount < 100) { 
    //       messageCount++;
      
    //       const messageWithTimestamp = {
    //         ...data,
    //         timestamp: new Date().toISOString(),
    //       };
      
    //       // Save to MongoDB
    //       try {
    //         const newMessage = new Message({
    //           senderId: data.senderId,
    //           receiverId: data.receiverId,
    //           message: data.message,
    //           timestamp: messageWithTimestamp.timestamp,
    //         });
      
    //         await newMessage.save();
    //       } catch (err) {
    //         console.error("❌ Error saving message:", err);
    //       }
      
    //       // Emit to clients
    //       io.emit("receiveMessage", messageWithTimestamp);
    //     } else {
    //       console.log("Rate limit exceeded for socket:", socket.id);
    //     }
    //   });
      
    socket.on("disconnect", () => {
      console.log("User disconnected: " + socket.id);
    });
  });
  

server.listen(PORT, "0.0.0.0",() => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
