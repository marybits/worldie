const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get all users ranked by total points
 *     tags: [Leaderboard]
 *     description: Returns every user sorted by total points descending. Users with 0 points are included so the full ranking is always visible.
 *     responses:
 *       200:
 *         description: Array of leaderboard entries sorted by points
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   username:
 *                     type: string
 *                   totalPoints:
 *                     type: integer
 *                   predictionsCount:
 *                     type: integer
 */
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