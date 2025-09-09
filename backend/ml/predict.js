 const SimpleLinearRegression = require('ml-regression-simple-linear');

function predictConsumption(bills, type = 'kwh') {
  if (bills.length < 2) return null; // Not enough data

  // Prepare data: x = month index, y = consumption
  const x = bills.map((_, i) => i); // [0, 1, 2, ...]
  const y = bills.map(b => b[type]); // [kwh1, kwh2, ...] or [liters1, liters2, ...]

  const regression = new SimpleLinearRegression(x, y);
  const nextMonthIndex = bills.length;
  const prediction = regression.predict(nextMonthIndex);

  return Math.max(0, prediction); // Ensure non-negative
}

// Advanced: Anomaly detection (z-score for unusual usage)
function detectAnomaly(currentValue, historicalValues) {
  if (historicalValues.length < 3) return false;
  const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
  const stdDev = Math.sqrt(historicalValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historicalValues.length);
  const zScore = (currentValue - mean) / stdDev;
  return Math.abs(zScore) > 2; // Anomaly if >2 std devs
}

module.exports = { predictConsumption, detectAnomaly };