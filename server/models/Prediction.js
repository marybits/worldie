const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  predictedHomeScore: {
    type: Number,
    required: true,
    min: 0
  },
  predictedAwayScore: {
    type: Number,
    required: true,
    min: 0
  },
  points: {
    type: Number,
    default: null
  }
}, { timestamps: true });

// A user can only have ONE prediction per match
predictionSchema.index({ user: 1, match: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);