
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  type: { type: String, enum: ['school', 'class', 'student'], required: true },
  entries: [{
    name: String,
    score: Number,
    rank: Number,
  }],
  lastUpdated: Date,
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);