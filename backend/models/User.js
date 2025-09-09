const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  class: { type: String, default: '' },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  badge: { type: String, default: 'Bronze' },
  activities: [{ activity: String, points: Number, date: Date }]
});

module.exports = mongoose.model('User', UserSchema);
