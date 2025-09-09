const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const School = require('../models/School');
const { predictConsumption, detectAnomaly } = require('../ml/predict');

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// ---------------- Register a school ----------------
router.post('/schools', async (req, res) => {
  try {
    const { name, area, students, district, state } = req.body;
    if (!name || !area || !students) return res.status(400).json({ error: 'Name, area, and students required' });

    const school = new School({ name, area, students, district: district || '', state: state || '' });
    await school.save();
    res.status(201).json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Get all schools ----------------
router.get('/schools', async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools.map(s => ({
      _id: s._id,
      name: s.name,
      area: s.area,
      students: s.students,
      district: s.district,
      state: s.state
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// ---------------- Submit bill analysis ----------------
router.post('/', async (req, res) => {
  try {
    const { schoolId, month, kwh, elecCost, liters, waterCost } = req.body;
    if (!isValidObjectId(schoolId)) return res.status(400).json({ error: 'Invalid school ID' });

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ error: 'School not found' });
    if (!school.students || !school.area) return res.status(400).json({ error: 'Students or area cannot be zero' });

    const perStudentKwh = kwh / school.students;
    const perAreaKwh = kwh / school.area;
    const perStudentLiters = liters / school.students;
    const perAreaLiters = liters / school.area;

    const elecScore = Math.max(0, Math.min(100, 100 - (perStudentKwh / 50 * 100)));
    const waterScore = Math.max(0, Math.min(100, 100 - (perStudentLiters / 100 * 100)));
    const combinedScore = (elecScore + waterScore) / 2;

    const bill = new Bill({
      school: schoolId,
      month: month || new Date().toISOString().slice(0, 7),
      kwh,
      elecCost,
      liters,
      waterCost,
      perStudentKwh,
      perAreaKwh,
      perStudentLiters,
      perAreaLiters,
      elecScore,
      waterScore
    });
    await bill.save();

    school.efficiencyScore = combinedScore;
    await school.save();

    // ---------------- ML Prediction & Anomaly ----------------
    const allBills = await Bill.find({ school: schoolId }).sort({ month: 1 });

    // Fix: handle single-bill prediction
    const kwhPrediction = allBills.length === 1 ? allBills[0].kwh : predictConsumption(allBills, 'kwh');
    const waterPrediction = allBills.length === 1 ? allBills[0].liters : predictConsumption(allBills, 'liters');

    let anomaly = null;
    if (detectAnomaly(kwh, allBills.map(b => b.kwh))) anomaly = 'High electricity usage detected';
    if (detectAnomaly(liters, allBills.map(b => b.liters))) anomaly = anomaly ? anomaly + ' & High water usage detected' : 'High water usage detected';

    // ---------------- Response ----------------
    res.json({
      perStudentKwh: perStudentKwh.toFixed(2),
      perAreaKwh: perAreaKwh.toFixed(4),
      elecScore: elecScore.toFixed(0),
      perStudentLiters: perStudentLiters.toFixed(2),
      perAreaLiters: perAreaLiters.toFixed(4),
      waterScore: waterScore.toFixed(0),
      anomaly,
      kwhPrediction: kwhPrediction?.toFixed(2),
      waterPrediction: waterPrediction?.toFixed(2)
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- Get trends & predictions for insights ----------------
router.get('/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    if (!isValidObjectId(schoolId)) return res.status(400).json({ error: 'Invalid school ID' });

    const bills = await Bill.find({ school: schoolId }).sort({ month: 1 });
    const trends = bills.map(b => ({ month: b.month, kwh: b.kwh, liters: b.liters }));

    // Fix: handle single-bill prediction
    const kwhPrediction = bills.length === 1 ? bills[0].kwh : predictConsumption(bills, 'kwh');
    const waterPrediction = bills.length === 1 ? bills[0].liters : predictConsumption(bills, 'liters');

    // ---------------- Anomaly detection ----------------
    let anomaly = null;
    if (trends.length > 0) {
      const avgKwh = trends.reduce((a,b)=>a+b.kwh,0)/trends.length;
      const avgWater = trends.reduce((a,b)=>a+b.liters,0)/trends.length;
      const latest = trends[trends.length-1];
      if (latest.kwh > avgKwh*2) anomaly = "High electricity usage detected";
      if (latest.liters > avgWater*2) anomaly = anomaly ? anomaly + " & High water usage detected" : "High water usage detected";
    }

    res.json({
      trends,
      predictions: {
        elecPred: kwhPrediction?.toFixed(2),
        waterPred: waterPrediction?.toFixed(2)
      },
      anomaly
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;
