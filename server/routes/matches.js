const express = require('express');
const router = express.Router();
const axios = require('axios');
const Match = require('../models/Match');
const Prediction = require('../models/Prediction');

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches sorted by date
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Array of all match objects
 */
// GET /api/matches - Get all matches sorted by date
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ matchDate: 1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function syncMatches() {
  const response = await axios.get(
    'https://api.football-data.org/v4/competitions/WC/matches',
    { headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY } }
  );

  const matches = response.data.matches;
  let scoredCount = 0;

  for (const m of matches) {
    const previousMatch = await Match.findOne({ externalId: m.id });
    const wasAlreadyFinished = previousMatch?.status === 'FINISHED';

    const updatedMatch = await Match.findOneAndUpdate(
      { externalId: m.id },
      {
        externalId: m.id,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        homeScore: m.score.fullTime.home,
        awayScore: m.score.fullTime.away,
        matchDate: m.utcDate,
        status: m.status,
        group: m.group
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (updatedMatch.status === 'FINISHED' && !wasAlreadyFinished) {
      await calculateScoresForMatch(updatedMatch);
      scoredCount++;
    }
  }

  return { matchesCount: matches.length, scoredCount };
}

/**
 * @swagger
 * /api/matches/sync:
 *   post:
 *     summary: Sync matches from the football-data.org API and score finished matches
 *     tags: [Matches]
 *     description: Admin-only. Pulls the latest World Cup match data, updates the database, and runs the scoring algorithm for any newly finished matches. Called automatically by a cron job every hour.
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Must match the ADMIN_SECRET environment variable
 *     responses:
 *       200:
 *         description: Sync complete — returns count of synced and newly scored matches
 *       403:
 *         description: Forbidden — missing or invalid admin secret
 */
// Admin-only guard — requires X-Admin-Secret header matching ADMIN_SECRET env var
function adminOnly(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers['x-admin-secret'] !== secret) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// POST /api/matches/sync - Sync matches from external API and calculate scores for finished matches
router.post('/sync', adminOnly, async (req, res) => {
  try {
    const result = await syncMatches();
    res.json({ message: `${result.matchesCount} matches synced, ${result.scoredCount} newly scored` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate scores for predictions of a finished match
async function calculateScoresForMatch(match) {
  const predictions = await Prediction.find({ match: match._id });

  for (const pred of predictions) {
    let points = 0;

    const exactMatch =
      pred.predictedHomeScore === match.homeScore &&
      pred.predictedAwayScore === match.awayScore;

    const predictedOutcome = Math.sign(pred.predictedHomeScore - pred.predictedAwayScore);
    const actualOutcome = Math.sign(match.homeScore - match.awayScore);
    const correctOutcome = predictedOutcome === actualOutcome;

    if (exactMatch) {
      points = 3;
    } else if (correctOutcome) {
      points = 1;
    }

    pred.points = points;
    await pred.save();
  }
}

/**
 * @swagger
 * /api/matches/{id}/calculate:
 *   post:
 *     summary: Manually trigger score calculation for a specific match
 *     tags: [Matches]
 *     description: Admin-only. Recalculates points for all predictions on a given match.
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Must match the ADMIN_SECRET environment variable
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ID of the match
 *     responses:
 *       200:
 *         description: Scores calculated
 *       403:
 *         description: Forbidden — missing or invalid admin secret
 *       404:
 *         description: Match not found
 */
// POST /api/matches/:id/calculate - admin-only endpoint to manually score a specific match
router.post('/:id/calculate', adminOnly, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    await calculateScoresForMatch(match);
    res.json({ message: 'Scores calculated', match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, syncMatches };