const express = require('express');
const router = express.Router();
const School = require('../models/School');
const User = require('../models/User');

// -------------------- Helpers --------------------
function assignBadge(rank) {
  if (rank === 1) return "🥇 Gold";
  if (rank === 2) return "🥈 Silver";
  if (rank === 3) return "🥉 Bronze";
  return "";
}

// -------------------- Top schools by efficiency --------------------
router.get('/school', async (req, res) => {
  try {
    const schools = await School.find().sort({ efficiencyScore: -1 }).limit(10);
    res.json(schools.map((s, i) => ({
      name: s.name,
      score: s.efficiencyScore,
      rank: i + 1,
      badge: assignBadge(i + 1)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Top classes by total points --------------------
router.get('/class', async (req, res) => {
  try {
    const classes = await User.aggregate([
      { $match: { class: { $ne: '' } } },
      { $group: { _id: '$class', points: { $sum: '$points' } } },
      { $sort: { points: -1 } },
      { $limit: 10 }
    ]);

    res.json(classes.map((c, i) => ({
      name: c._id,
      score: c.points,
      rank: i + 1,
      badge: assignBadge(i + 1)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Top students by points --------------------
router.get('/student', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(10);
    res.json(users.map((u, i) => ({
      name: u.name,
      score: u.points,
      rank: i + 1,
      badge: assignBadge(i + 1) || u.badge  // keep existing badge if outside top 3
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Top districts by avg school efficiency --------------------
router.get('/district', async (req, res) => {
  try {
    const districts = await School.aggregate([
      { $match: { district: { $ne: '' } } },
      { $group: { _id: '$district', score: { $avg: '$efficiencyScore' } } },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);

    res.json(districts.map((d, i) => ({
      name: d._id,
      score: Number(d.score.toFixed(0)),
      rank: i + 1,
      badge: assignBadge(i + 1)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Top states by avg school efficiency --------------------
router.get('/state', async (req, res) => {
  try {
    const states = await School.aggregate([
      { $match: { state: { $ne: '' } } },
      { $group: { _id: '$state', score: { $avg: '$efficiencyScore' } } },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);

    res.json(states.map((s, i) => ({
      name: s._id,
      score: Number(s.score.toFixed(0)),
      rank: i + 1,
      badge: assignBadge(i + 1)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
