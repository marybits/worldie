import { useState, useEffect } from 'react';
import api from '../services/api';
import MatchCard from '../components/MatchCard';
import MatchCardSkeleton from '../components/MatchCardSkeleton';
import TournamentBracket from '../components/TournamentBracket';
import Navbar from '../components/Navbar';

const KNOCKOUT_ROUNDS = ['Round of 32', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Third Place Play-off', 'Final'];
const KNOCKOUT_SIZES  = [16, 8, 4, 2, 1, 1];

function Dashboard() {
  const [matches,      setMatches]      = useState([]);
  const [predictions,  setPredictions]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  // Default to list on mobile (bracket requires ~1100px horizontal space)
  const [knockoutView, setKnockoutView] = useState(
    () => window.innerWidth >= 1024 ? 'bracket' : 'list'
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const [matchesRes, predictionsRes] = await Promise.all([
          api.get('/matches'),
          api.get('/predictions/me'),
        ]);
        setMatches(matchesRes.data);
        setPredictions(predictionsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Could not load matches. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getPredictionForMatch = (matchId) => predictions.find((p) => p.match._id === matchId);

  if (loading) return (
    <div className="max-w-[1200px] mx-auto p-3 sm:p-6">
      <Navbar />
      {[1, 2].map((i) => (
        <div key={i} className="mb-8">
          <div className="h-7 w-32 rounded-lg bg-gray-800 animate-pulse mt-8 mb-3" />
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((j) => <MatchCardSkeleton key={j} />)}
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="max-w-[1200px] mx-auto p-3 sm:p-6">
      <Navbar />
      <p className="text-red-400 mt-8">{error}</p>
    </div>
  );

  // ── Group stage ────────────────────────────────────────────────────────────
  const groupedMatches = matches
    .filter((m) => m.group)
    .reduce((acc, match) => {
      if (!acc[match.group]) acc[match.group] = [];
      acc[match.group].push(match);
      return acc;
    }, {});

  const groupKeys = Object.keys(groupedMatches).sort((a, b) => a.localeCompare(b));

  // ── Knockout stage ─────────────────────────────────────────────────────────
  const knockoutMatches = matches
    .filter((m) => !m.group)
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

  let offset = 0;
  const knockoutRounds = KNOCKOUT_ROUNDS.map((name, i) => {
    const slice = knockoutMatches.slice(offset, offset + KNOCKOUT_SIZES[i]);
    offset += KNOCKOUT_SIZES[i];
    return { name, matches: slice };
  }).filter((r) => r.matches.length > 0);

  const hasKnockout = knockoutRounds.length > 0;

  return (
    <div className="max-w-[1400px] mx-auto p-3 sm:p-6">
      <Navbar />

      {/* Empty state */}
      {groupKeys.length === 0 && !hasKnockout && (
        <div className="flex flex-col items-center justify-center text-center py-24 gap-3">
          <span className="text-5xl">⚽</span>
          <p className="text-gray-300 font-semibold text-lg">No matches yet</p>
          <p className="text-gray-500 text-sm max-w-xs">
            Matches will appear here once the World Cup schedule is loaded. Check back soon!
          </p>
        </div>
      )}

      {/* ── Group Stage ── */}
      {groupKeys.map((groupKey) => (
        <div key={groupKey} className="mb-8">
          <h3 className="flex items-center gap-3 text-xl sm:text-3xl font-extrabold text-gray-100 mt-8">
            <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
            {groupKey.replace('GROUP_', 'Group ')}
          </h3>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ── Knockout Stage ── */}
      {hasKnockout && (
        <div className="mb-8">
          {/* Section header + view toggle */}
          <div className="flex items-center gap-3 mt-8 mb-4">
            <h3 className="flex items-center gap-3 text-xl sm:text-3xl font-extrabold text-gray-100 m-0">
              <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
              Knockout Stage
            </h3>
            <div style={{
              display: 'flex', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: 3, gap: 2, marginLeft: 'auto',
            }}>
              {[
                { value: 'bracket', label: '⬡ Bracket' },
                { value: 'list',    label: '☰ List'    },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setKnockoutView(value)}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: 'none',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: knockoutView === value ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: knockoutView === value ? '#e5e7eb' : '#6b7280',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bracket view */}
          {knockoutView === 'bracket' && (
            <TournamentBracket rounds={knockoutRounds} predictions={predictions} />
          )}

          {/* List view */}
          {knockoutView === 'list' && knockoutRounds.map((round) => (
            <div key={round.name} className="mb-6">
              <p className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">
                {round.name}
              </p>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {round.matches.map((match) => (
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
      )}
    </div>
  );
}

export default Dashboard;
