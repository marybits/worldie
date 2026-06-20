const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/leaderboard - Get all users ranked by total points (0-point users included)
router.get('/', async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'predictions',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] }, points: { $ne: null } } }
          ],
          as: 'scoredPredictions'
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: 1,
          totalPoints: { $sum: '$scoredPredictions.points' },
          predictionsCount: { $size: '$scoredPredictions' }
        }
      },
      {
        $sort: { totalPoints: -1, username: 1 }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;