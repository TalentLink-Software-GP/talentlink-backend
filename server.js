const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const authRoutes = require("./routes/authRoutes");
const skillsRoutes = require("./routes/skillsRouts");
const userDataRoutes = require("./routes/userDataRouts");
const organaizationRouts = require('./routes/orgnizationRoutes');
const jobRoutes = require('./routes/jobsRoutes');
const setupSwagger = require("./swagger");
const post = require("./routes/postsRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app); 
const wss = new WebSocket.Server({ server }); 

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

setupSwagger(app);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const activeConnections = new Map();

wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');

    const userId = req.url.split('userId=')[1];
    if (!userId) {
        ws.close(1008, 'No userId provided');
        return;
    }

    activeConnections.set(userId, ws);
    console.log(`User ${userId} connected. Total connections: ${activeConnections.size}`);

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log('Received WebSocket message:', parsedMessage);

            const { senderId, receiverId, content } = parsedMessage;

            if (receiverId && activeConnections.has(receiverId)) {
                activeConnections.get(receiverId).send(JSON.stringify({
                    senderId,
                    content,
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        activeConnections.delete(userId);
        console.log(`User ${userId} disconnected. Total connections: ${activeConnections.size}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        activeConnections.delete(userId);
    });
});
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
