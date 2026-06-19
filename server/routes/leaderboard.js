const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');

// GET /api/leaderboard - Get leaderboard sorted by total points
router.get('/', async (req, res) => {
  try {
    const leaderboard = await Prediction.aggregate([
      {
        $match: { points: { $ne: null } }
      },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
          predictionsCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$userInfo.username',
          totalPoints: 1,
          predictionsCount: 1
        }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;