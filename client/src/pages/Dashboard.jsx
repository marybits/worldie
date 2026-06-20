import { useState, useEffect } from 'react';
import api from '../services/api';
import MatchCard from '../components/MatchCard';
import Navbar from '../components/Navbar';

const KNOCKOUT_ROUNDS = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Third Place Play-off', 'Final'];
const KNOCKOUT_SIZES  = [16, 8, 4, 2, 1, 1];

function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchesRes, predictionsRes] = await Promise.all([
          api.get('/matches'),
          api.get('/predictions/me')
        ]);
        setMatches(matchesRes.data);
        setPredictions(predictionsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getPredictionForMatch = (matchId) => {
    return predictions.find((p) => p.match._id === matchId);
  };

  if (loading) return <p>Loading matches...</p>;

  // Group stage
  const groupedMatches = matches
    .filter((m) => m.group)
    .reduce((acc, match) => {
      if (!acc[match.group]) acc[match.group] = [];
      acc[match.group].push(match);
      return acc;
    }, {});

  // Knockout stage — sort chronologically then slice into named rounds
  const knockoutMatches = matches
    .filter((m) => !m.group)
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

  let offset = 0;
  for (let i = 0; i < KNOCKOUT_ROUNDS.length; i++) {
    const slice = knockoutMatches.slice(offset, offset + KNOCKOUT_SIZES[i]);
    if (slice.length > 0) groupedMatches[KNOCKOUT_ROUNDS[i]] = slice;
    offset += KNOCKOUT_SIZES[i];
  }

  const sortedGroupKeys = Object.keys(groupedMatches).sort((a, b) => {
    const aIsKnockout = KNOCKOUT_ROUNDS.includes(a);
    const bIsKnockout = KNOCKOUT_ROUNDS.includes(b);
    if (aIsKnockout !== bIsKnockout) return aIsKnockout ? 1 : -1;
    if (aIsKnockout) return KNOCKOUT_ROUNDS.indexOf(a) - KNOCKOUT_ROUNDS.indexOf(b);
    return a.localeCompare(b);
  });

  const formatGroupTitle = (key) => key.replace('GROUP_', 'Group ');

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <Navbar />

      {sortedGroupKeys.map((groupKey) => (
        <div key={groupKey} className="mb-8">
          <h3 className="flex items-center gap-3 text-2xl font-extrabold text-gray-100 mt-8">
            <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
            {formatGroupTitle(groupKey)}
          </h3>
          <div
            className={`grid gap-3 ${
              groupKey.startsWith('GROUP_') ? 'grid-cols-3' : 'grid-cols-4'
            }`}
          >
            {groupedMatches[groupKey].map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                existingPrediction={getPredictionForMatch(match._id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
