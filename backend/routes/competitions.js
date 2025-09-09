const express = require('express');
const router = express.Router();
const School = require('../models/School');
const User = require('../models/User');

// -------------------- Competitions / Leaderboards --------------------

// Get top 5 schools by efficiency score
router.get('/schools', async (req, res) => {
    try {
        const topSchools = await School.find()
            .sort({ efficiencyScore: -1 })
            .limit(5)
            .select('name district state efficiencyScore');

        res.json(topSchools.map((s, i) => ({
            rank: i + 1,
            name: s.name,
            district: s.district,
            state: s.state,
            efficiencyScore: s.efficiencyScore
        })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch top schools: ' + err.message });
    }
});

// Get top 5 users (students) by points
router.get('/users', async (req, res) => {
    try {
        const topUsers = await User.find()
            .sort({ points: -1 })
            .limit(5)
            .select('name school class points badge');

        res.json(topUsers.map((u, i) => ({
            rank: i + 1,
            name: u.name,
            school: u.school,
            class: u.class,
            points: u.points,
            badge: u.badge
        })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch top users: ' + err.message });
    }
});

// Dynamic leaderboard endpoint: /competitions/:type (student or school)
router.get('/:type', async (req, res) => {
    const { type } = req.params;
    try {
        if (type === 'school') {
            const schools = await School.find().sort({ efficiencyScore: -1 }).limit(10);
            return res.json(schools.map((s, i) => ({
                rank: i + 1,
                name: s.name,
                score: s.efficiencyScore
            })));
        } else if (type === 'student') {
            const users = await User.find().sort({ points: -1 }).limit(10);
            return res.json(users.map((u, i) => ({
                rank: i + 1,
                name: u.name,
                points: u.points,
                badge: u.badge
            })));
        } else {
            return res.status(400).json({ error: 'Invalid leaderboard type' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
