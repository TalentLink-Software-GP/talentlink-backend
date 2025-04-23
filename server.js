const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // <-- Add this
const authRoutes = require("./routes/authRoutes");
const skillsRoutes = require("./routes/skillsRouts");
const userDataRoutes = require("./routes/userDataRouts");
const organaizationRouts = require('./routes/orgnizationRoutes')
const jobRoutes = require('./routes/jobsRoutes')
const setupSwagger = require("./swagger");
const post=require("./routes/postsRoutes");
const messageRoutes=require("./routes/messageRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// 🔥 Serve uploaded images from the 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // <-- Add this line

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/posts", post);
app.use("/api/users", userDataRoutes); 
app.use("/api/organization", organaizationRouts)
app.use("/api/job",jobRoutes)
app.use('/api', messageRoutes);


setupSwagger(app);

// DB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
