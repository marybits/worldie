const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const protect = require('../middleware/auth');

// Generates a random 6-character uppercase alphanumeric code, e.g. "X7K2PQ".
// We check for uniqueness before saving, retrying if there's a collision (very rare).
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new private group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Las Chamas
 *     responses:
 *       201:
 *         description: Group created — returns group object including the invite code
 *       400:
 *         description: Name missing or too short
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Group name must be at least 2 characters' });
    }

    // Keep generating codes until we find one that's not already taken
    let code;
    let exists = true;
    while (exists) {
      code = generateCode();
      exists = await Group.findOne({ code });
    }

    const group = await Group.create({
      name: name.trim(),
      code,
      creator: req.userId,
      members: [req.userId], // creator is automatically a member
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/groups/join:
 *   post:
 *     summary: Join a group using an invite code
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: X7K2PQ
 *     responses:
 *       200:
 *         description: Joined successfully — returns updated group object
 *       400:
 *         description: Already a member
 *       404:
 *         description: Invalid invite code
 *       401:
 *         description: Unauthorized
 */
router.post('/join', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Invite code is required' });

    const group = await Group.findOne({ code: code.trim().toUpperCase() });
    if (!group) return res.status(404).json({ message: 'Invalid invite code' });

    // $addToSet is a MongoDB operator that adds a value to an array
    // only if it doesn't already exist — prevents duplicate members
    const alreadyMember = group.members.some((m) => m.toString() === req.userId);
    if (alreadyMember) return res.status(400).json({ message: 'You are already in this group' });

    group.members.push(req.userId);
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/groups/me:
 *   get:
 *     summary: Get all groups the current user belongs to
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of group objects
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, async (req, res) => {
  try {
    // Find groups where the user is in the members array
    // Populate creator so the frontend can tell if the current user is the owner
    const groups = await Group.find({ members: req.userId })
      .populate('creator', 'username')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
