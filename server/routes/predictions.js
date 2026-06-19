const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const protect = require('../middleware/auth');

// POST /api/predictions 
router.post('/', protect, async (req, res) => {
  try {
    const { matchId, predictedHomeScore, predictedAwayScore } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (new Date() >= new Date(match.matchDate)) {
      return res.status(400).json({ message: 'Cannot predict after match has started' });
    }

    const prediction = await Prediction.create({
      user: req.userId,
      match: matchId,
      predictedHomeScore,
      predictedAwayScore
    });

    res.status(201).json(prediction);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You already predicted this match' });
    }
    res.status(500).json({ message: error.message });
  }
});

// GET /api/predictions/me 
router.get('/me', protect, async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.userId }).populate('match');
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;