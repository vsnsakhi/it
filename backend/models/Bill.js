
const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  month: { type: String, required: true },
  kwh: { type: Number, required: true },
  elecCost: { type: Number, default: 0 },
  liters: { type: Number, required: true },
  waterCost: { type: Number, default: 0 },
  perStudentKwh: Number,
  perAreaKwh: Number,
  perStudentLiters: Number,
  perAreaLiters: Number,
  elecScore: Number,
  waterScore: Number
});

module.exports = mongoose.model('Bill', BillSchema);
