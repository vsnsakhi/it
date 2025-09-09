const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const School = require('../models/School');

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('school', 'name');
    res.json(users.map(u => ({
      id: u._id, // frontend expects 'id'
      name: u.name,
      school: u.school,
      class: u.class,
      points: u.points,
      badge: u.badge
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('school', 'name');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register user
router.post('/users', async (req, res) => {
  try {
    const { name, schoolId, class: className } = req.body;
    if (!name || !schoolId || !isValidObjectId(schoolId)) return res.status(400).json({ error: 'Name and valid schoolId required' });

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ error: 'School not found' });

    const user = new User({ name, school: schoolId, class: className || '', points: 0, streak: 0, badge: 'Bronze', activities: [] });
    await user.save();

    res.status(201).json(user); // ✅ return full user including _id
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log activity
router.post('/activity', async (req, res) => {
  try {
    const { userId, activity, points } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const earnedPoints = points || 10;
    user.points += earnedPoints;
    user.activities.push({ activity, points: earnedPoints, date: new Date() });
    user.badge = user.points >= 50 ? 'Gold' : user.points >= 20 ? 'Silver' : 'Bronze';
    await user.save();

    res.json({ message: 'Activity completed', points: user.points, badge: user.badge });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Update streak
router.post('/streak', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.streak += 1;
    user.points += 5;
    user.badge = user.points >= 50 ? 'Gold' : user.points >= 20 ? 'Silver' : 'Bronze';
    await user.save();

    res.json({ streak: user.streak, points: user.points, badge: user.badge });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

module.exports = router;
