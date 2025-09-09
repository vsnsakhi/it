const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load .env (from project root, one level above backend)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// -------------------- Middleware --------------------
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000", // local React/Vite
      "http://127.0.0.1:5500", // VSCode Live Server
      "http://localhost:3006", // local backend
      "https://it-10.onrender.com", // deployed Render frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// -------------------- Debug --------------------
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

// -------------------- MongoDB --------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// -------------------- API Routes --------------------
app.use("/api/ai", require(path.join(__dirname, "routes", "aiRoutes")));
app.use("/api/analysis", require(path.join(__dirname, "routes", "analysis")));
app.use("/api/leaderboards", require(path.join(__dirname, "routes", "leaderboards")));
app.use("/api/gamification", require(path.join(__dirname, "routes", "gamification")));
app.use("/api/competitions", require(path.join(__dirname, "routes", "competitions")));

// -------------------- Serve Frontend --------------------
app.use(express.static(path.join(__dirname, "../client")));

// ✅ Express v5 safe catch-all
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

