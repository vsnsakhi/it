// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(bodyParser.json());
app.use(cors());

// -------------------- MongoDB Connection --------------------
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// -------------------- API Routes --------------------
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/leaderboards', require('./routes/leaderboards'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/competitions', require('./routes/competitions'));

// -------------------- Serve Frontend --------------------
app.use(express.static(path.join(__dirname, '../client')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




