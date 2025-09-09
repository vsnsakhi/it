const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// -------------------- Middleware --------------------
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3000",     // React/Vite frontend locally
    "http://127.0.0.1:5500",     // VSCode Live Server
    "http://localhost:3006",     // local backend
    "https://it-10.onrender.com" // deployed Render frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// -------------------- MongoDB --------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// -------------------- Routes --------------------
const analysisRoutes = require(path.join(__dirname, "routes", "analysisRoutes"));
const gamificationRoutes = require(path.join(__dirname, "routes", "gamificationRoutes"));
const leaderboardRoutes = require(path.join(__dirname, "routes", "leaderboardRoutes"));
const aiRoutes = require(path.join(__dirname, "routes", "aiRoutes"));

app.use("/analysis", analysisRoutes);
app.use("/gamification", gamificationRoutes);
app.use("/leaderboards", leaderboardRoutes);
app.use("/ai", aiRoutes);

// -------------------- Server --------------------
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
