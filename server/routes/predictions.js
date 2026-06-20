const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const protect = require('../middleware/auth');

// Helper: returns an error message if scores are invalid, or null if they're fine.
// Number.isInteger() returns false for decimals (1.5) and non-numbers ("abc").
// We also check for negative numbers separately.
function validateScores(home, away) {
  if (!Number.isInteger(home) || !Number.isInteger(away)) {
    return 'Scores must be whole numbers';
  }
  if (home < 0 || away < 0) {
    return 'Scores cannot be negative';
  }
  return null;
}

// POST /api/predictions
router.post('/', protect, async (req, res) => {
  try {
    const { matchId, predictedHomeScore, predictedAwayScore } = req.body;

    const scoreError = validateScores(predictedHomeScore, predictedAwayScore);
    if (scoreError) {
      return res.status(400).json({ message: scoreError });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (!match.homeTeam || !match.awayTeam) {
      return res.status(400).json({ message: 'Teams not yet determined for this match' });
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

// PUT /api/predictions/:matchId — update an existing prediction before the match starts
router.put('/:matchId', protect, async (req, res) => {
  try {
    const { predictedHomeScore, predictedAwayScore } = req.body;
    const { matchId } = req.params;

    const scoreError = validateScores(predictedHomeScore, predictedAwayScore);
    if (scoreError) {
      return res.status(400).json({ message: scoreError });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (new Date() >= new Date(match.matchDate)) {
      return res.status(400).json({ message: 'Cannot edit prediction after match has started' });
    }

    // findOneAndUpdate finds the document matching the filter and updates it.
    // { new: true } makes it return the updated document instead of the old one.
    const prediction = await Prediction.findOneAndUpdate(
      { user: req.userId, match: matchId },
      { predictedHomeScore, predictedAwayScore },
      { new: true }
    );

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    res.json(prediction);
  } catch (error) {
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