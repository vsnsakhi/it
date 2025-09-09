const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// -------------------- Middleware --------------------
app.use(express.json());

// Allow frontend from both localhost and Render
app.use(cors({
  origin: [
    "http://localhost:3006",  // local backend (if frontend served same port)
    "http://localhost:3000",  // local frontend (React/Vite etc.)
    "http://127.0.0.1:5500",  // if you open HTML directly in Live Server
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
const analysisRoutes = require("./routes/analysisRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/analysis", analysisRoutes);
app.use("/gamification", gamificationRoutes);
app.use("/leaderboards", leaderboardRoutes);
app.use("/ai", aiRoutes);

// -------------------- Server --------------------
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

