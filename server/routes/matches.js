const express = require('express');
const router = express.Router();
const axios = require('axios');
const Match = require('../models/Match');

// GET /api/matches 
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ matchDate: 1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/matches/sync 
router.post('/sync', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.football-data.org/v4/competitions/WC/matches',
      { headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY } }
    );

    const matches = response.data.matches;

    for (const m of matches) {
      await Match.findOneAndUpdate(
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
        { upsert: true, new: true }
      );
    }

    res.json({ message: `${matches.length} matches synced` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;