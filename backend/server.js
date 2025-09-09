
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Debug print to check if MONGO_URI is loaded
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// -------------------- API Routes --------------------
// AI / Quiz / Activity
app.use('/api/ai', require('./routes/aiRoutes'));

// School registration & bill analysis
app.use('/api/analysis', require('./routes/analysis'));

// Leaderboards
app.use('/api/leaderboards', require('./routes/leaderboards'));

// Gamification / Users / Points
app.use('/api/gamification', require('./routes/gamification'));

// Competitions / top schools / top users
app.use('/api/competitions', require('./routes/competitions'));

// -------------------- Serve Frontend --------------------
app.use(express.static(path.join(__dirname, "../client")));

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
