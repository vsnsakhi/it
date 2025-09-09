const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: Number, required: true },
  students: { type: Number, required: true },
  district: { type: String, default: '' },
  state: { type: String, default: '' },
  efficiencyScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('School', SchoolSchema);
