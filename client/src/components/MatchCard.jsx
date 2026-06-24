import { useState } from 'react';
import api from '../services/api';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/teamFlags';

// Defined outside the component so it's not recreated on every render.
// Pure function: same input always gives same output, no side effects.
function getCountdown(matchDate) {
  const diff = new Date(matchDate) - Date.now();
  if (diff <= 0) return null;
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0)  return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// Maps a prediction's points value to label + Tailwind color classes.
// Using a lookup object avoids the 0 && '...' React gotcha where the number 0
// would be rendered literally instead of being falsy.
function getResultBadge(points) {
  const map = {
    3: { label: '⭐ +3 exact',   classes: 'bg-green-900/60 text-green-400' },
    1: { label: '+1 correct',    classes: 'bg-amber-900/60 text-amber-400' },
    0: { label: '+0 missed',     classes: 'bg-red-900/60 text-red-400' },
  };
  return map[points] ?? null;
}

function MatchCard({ match, existingPrediction }) {
  const [homeScore, setHomeScore] = useState(
    existingPrediction?.predictedHomeScore ?? ''
  );
  const [awayScore, setAwayScore] = useState(
    existingPrediction?.predictedAwayScore ?? ''
  );
  const [submitted, setSubmitted] = useState(!!existingPrediction);
  // editing = true means the user clicked "Edit" and the inputs are shown again
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  // Shared classes for score inputs — defined once so both predict and edit use the same style
  const scoreInputClass = "no-spinner w-12 text-center font-mono py-2 px-1 text-sm bg-gray-800 border border-gray-700 text-gray-100 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:shadow-[0_0_8px_oklch(62%_0.13_229.7_/_0.5)]";

  const hasStarted = new Date() >= new Date(match.matchDate);
  const countdown = getCountdown(match.matchDate);
  const teamsKnown = !!(match.homeTeam && match.awayTeam);
  const homeTeam = match.homeTeam ?? 'TBD';
  const awayTeam = match.awayTeam ?? 'TBD';
  const homeColor = getTeamColor(match.homeTeam) ?? '#6b7280';
  const awayColor = getTeamColor(match.awayTeam) ?? '#6b7280';
  const homeFlag = getFlagUrl(match.homeTeam);
  const awayFlag = getFlagUrl(match.awayTeam);

  const handlePredict = async () => {
    setError('');
    try {
      await api.post('/predictions', {
        matchId: match._id,
        predictedHomeScore: Number(homeScore),
        predictedAwayScore: Number(awayScore)
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit prediction');
    }
  };

  const handleEdit = async () => {
    setError('');
    try {
      // PUT to our new endpoint — note the matchId goes in the URL, not the body
      await api.put(`/predictions/${match._id}`, {
        predictedHomeScore: Number(homeScore),
        predictedAwayScore: Number(awayScore)
      });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update prediction');
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-800 bg-transparent shadow-[0_-2px_12px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.03)] hover:shadow-[0_0_20px_oklch(62%_0.13_229.7_/_0.3)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex h-1">
        <div className="flex-1" style={{ background: homeColor }} />
        <div className="flex-1" style={{ background: awayColor }} />
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 font-semibold text-sm flex-wrap">
          {homeFlag
            ? <img src={homeFlag} alt={homeTeam} width="20" className="rounded-sm" />
            : <span className="w-5 h-3.5 rounded-sm bg-gray-700 inline-block shrink-0" />
          }
          <span className={homeTeam === 'TBD' ? 'text-gray-500' : ''}>{homeTeam}</span>
          <span className="text-gray-400 text-xs">vs</span>
          <span className={awayTeam === 'TBD' ? 'text-gray-500' : ''}>{awayTeam}</span>
          {awayFlag
            ? <img src={awayFlag} alt={awayTeam} width="20" className="rounded-sm" />
            : <span className="w-5 h-3.5 rounded-sm bg-gray-700 inline-block shrink-0" />
          }
        </div>

        <div className="flex items-center gap-2 my-1 flex-wrap">
          <p className="text-gray-400 text-xs font-medium m-0">
            {new Date(match.matchDate).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {/* Countdown badge — only shown for upcoming matches */}
          {countdown && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-[var(--accent)]">
              ⏱ {countdown}
            </span>
          )}
        </div>

        {match.status === 'FINISHED' && (
          <>
            <p className="font-bold font-mono text-sm my-1">
              {match.homeScore} - {match.awayScore}
            </p>
            {submitted && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-gray-400 text-xs">
                  Predicted: {homeScore}–{awayScore}
                </span>
                {existingPrediction?.points != null && (() => {
                  const badge = getResultBadge(existingPrediction.points);
                  return badge
                    ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.classes}`}>{badge.label}</span>
                    : null;
                })()}
              </div>
            )}
          </>
        )}

        {!teamsKnown && (
          <p className="text-gray-500 text-xs mt-1">Teams TBD</p>
        )}

        {teamsKnown && !hasStarted && !submitted && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className={scoreInputClass}
            />
            <span className="font-mono text-gray-400">-</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className={scoreInputClass}
            />
            <button
              onClick={handlePredict}
              className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-gray-900 border-none rounded-lg px-3 py-2 text-xs font-bold cursor-pointer hover:from-[var(--accent-dark)] hover:to-[oklch(32%_0.11_229.7)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Predict
            </button>
            {error && <p className="text-red-500 text-xs w-full mt-1">{error}</p>}
          </div>
        )}

        {submitted && match.status !== 'FINISHED' && !editing && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs uppercase tracking-wide bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
              Predicted
            </span>
            <span className="font-mono text-gray-300 text-sm">
              {homeScore} - {awayScore}
            </span>
            {/* Only show Edit if match hasn't started yet */}
            {!hasStarted && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 bg-transparent border-none cursor-pointer p-0 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        )}

        {/* Editing mode: show inputs pre-filled with existing scores */}
        {submitted && editing && !hasStarted && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className={scoreInputClass}
            />
            <span className="font-mono text-gray-400">-</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className={scoreInputClass}
            />
            <button
              onClick={handleEdit}
              className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-gray-900 border-none rounded-lg px-3 py-2 text-xs font-bold cursor-pointer hover:from-[var(--accent-dark)] hover:to-[oklch(32%_0.11_229.7)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setError(''); }}
              className="ml-1 text-xs text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 transition-colors"
            >
              Cancel
            </button>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )}

        {teamsKnown && hasStarted && !submitted && (
          <p className="text-gray-400 text-xs">
            {match.status === 'FINISHED' ? 'Full Time' : 'Predictions Closed'}
          </p>
        )}
      </div>
    </div>
  );
}

export default MatchCard;
