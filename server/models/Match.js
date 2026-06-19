const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  externalId: {
    type: Number,
    required: true,
    unique: true
  },
  homeTeam: {
    type: String,
    required: true
  },
  awayTeam: {
    type: String,
    required: true
  },
  homeScore: {
    type: Number,
    default: null
  },
  awayScore: {
    type: Number,
    default: null
  },
  matchDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PLAY', 'FINISHED'],
    default: 'SCHEDULED'
  },
  group: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);