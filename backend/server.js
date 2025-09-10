// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(bodyParser.json());
app.use(cors());

// -------------------- DEBUG --------------------
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

// -------------------- DATABASE --------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// -------------------- API ROUTES --------------------
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/leaderboards', require('./routes/leaderboards'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/competitions', require('./routes/competitions'));

// -------------------- SERVE FRONTEND --------------------
app.use(express.static(path.join(__dirname, '../client')));

// -------------------- SPA CATCH-ALL --------------------
// Must come AFTER API routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// -------------------- ERROR HANDLING --------------------
// Optional: log uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});









