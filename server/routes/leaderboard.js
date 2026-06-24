const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get users ranked by total points, optionally filtered by group
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: If provided, returns only the members of that group
 *     description: Returns users sorted by total points descending. Pass ?groupId=xxx to filter to a private group.
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
 *       404:
 *         description: Group not found
 */
// GET /api/leaderboard - Get all users ranked by total points (0-point users included)
// Optional query param: ?groupId=xxx — restricts ranking to members of that group
router.get('/', async (req, res) => {
  try {
    const { groupId } = req.query;

    // Build an optional $match stage to filter by group members.
    // If no groupId is provided, matchStage is empty and all users are included.
    let matchStage = {};
    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ message: 'Invalid group ID' });
      }
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: 'Group not found' });

      // $in checks if a field's value is in a given array — here we filter
      // users whose _id is in the group's members list
      matchStage = { _id: { $in: group.members } };
    }

    const leaderboard = await User.aggregate([
      { $match: matchStage },
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