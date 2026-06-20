import { useState } from 'react';
import api from '../services/api';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/teamFlags';

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

  const hasStarted = new Date() >= new Date(match.matchDate);
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

        <p className="text-gray-400 text-xs my-1 font-medium">
          {new Date(match.matchDate).toLocaleDateString()}
        </p>

        {match.status === 'FINISHED' && (
          <>
            <p className="font-bold font-mono text-sm my-1">
              {match.homeScore} - {match.awayScore}
            </p>
            {submitted && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs uppercase tracking-wide bg-gray-800 text-gray-400 rounded-full px-2 py-0.5">
                  Predicted
                </span>
                <span className="font-mono text-gray-300 text-sm">
                  {homeScore} - {awayScore}
                </span>
                {existingPrediction?.points != null && (
                  <span className="bg-[var(--accent)] text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold">
                    {existingPrediction.points} pts
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {!teamsKnown && (
          <p className="text-gray-500 text-xs mt-1">Teams TBD</p>
        )}

        {teamsKnown && !hasStarted && !submitted && (
          <div className="mt-1">
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              style={{ width: '36px' }}
              className="no-spinner font-mono p-0.5 text-xs bg-gray-800 border border-gray-700 text-gray-100 rounded placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:shadow-[0_0_8px_oklch(62%_0.13_229.7_/_0.5)]"
            />
            <span className="mx-1 font-mono">-</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              style={{ width: '36px' }}
              className="no-spinner font-mono p-0.5 text-xs bg-gray-800 border border-gray-700 text-gray-100 rounded placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:shadow-[0_0_8px_oklch(62%_0.13_229.7_/_0.5)]"
            />
            <button
              onClick={handlePredict}
              className="ml-2 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-gray-900 border-none rounded-md px-2 py-0.5 text-xs cursor-pointer hover:from-[var(--accent-dark)] hover:to-[oklch(32%_0.11_229.7)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Predict
            </button>
            {error && <p className="text-red-500 text-xs">{error}</p>}
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
          <div className="mt-1">
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              style={{ width: '36px' }}
              className="no-spinner font-mono p-0.5 text-xs bg-gray-800 border border-gray-700 text-gray-100 rounded placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:shadow-[0_0_8px_oklch(62%_0.13_229.7_/_0.5)]"
            />
            <span className="mx-1 font-mono">-</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              style={{ width: '36px' }}
              className="no-spinner font-mono p-0.5 text-xs bg-gray-800 border border-gray-700 text-gray-100 rounded placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:shadow-[0_0_8px_oklch(62%_0.13_229.7_/_0.5)]"
            />
            <button
              onClick={handleEdit}
              className="ml-2 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-gray-900 border-none rounded-md px-2 py-0.5 text-xs cursor-pointer hover:from-[var(--accent-dark)] hover:to-[oklch(32%_0.11_229.7)] hover:scale-105 active:scale-95 transition-all duration-200"
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
