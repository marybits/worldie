import { useState } from 'react';
import api from '../services/api';
import { getTeamColor } from '../utils/teamColors';
import { getFlagUrl } from '../utils/teamFlags';

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

function getResultBadge(points) {
  const map = {
    3: { label: '⭐ +3 exact',  classes: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
    1: { label: '+1 correct',   classes: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
    0: { label: '+0 missed',    classes: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
  };
  return map[points] ?? null;
}

function MatchCard({ match, existingPrediction }) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.predictedHomeScore ?? '');
  const [awayScore, setAwayScore] = useState(existingPrediction?.predictedAwayScore ?? '');
  const [submitted, setSubmitted]   = useState(!!existingPrediction);
  const [editing, setEditing]       = useState(false);
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  const scoreInputClass = "no-spinner w-12 text-center font-mono py-2 px-1 text-sm rounded-lg placeholder:text-gray-600 focus:outline-none transition-all duration-150 focus:scale-105"
    + " bg-white/5 border border-white/10 text-gray-100 focus:border-[var(--accent)] focus:shadow-[0_0_12px_var(--accent-glow)]";

  const hasStarted  = new Date() >= new Date(match.matchDate);
  const isLive      = hasStarted && match.status !== 'FINISHED';
  const countdown   = getCountdown(match.matchDate);
  const teamsKnown  = !!(match.homeTeam && match.awayTeam);
  const homeTeam    = match.homeTeam ?? 'TBD';
  const awayTeam    = match.awayTeam ?? 'TBD';
  const homeColor   = getTeamColor(match.homeTeam) ?? '#374151';
  const awayColor   = getTeamColor(match.awayTeam) ?? '#374151';
  const homeFlag    = getFlagUrl(match.homeTeam);
  const awayFlag    = getFlagUrl(match.awayTeam);

  const handlePredict = async () => {
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await api.post('/predictions', {
        matchId: match._id,
        predictedHomeScore: Number(homeScore),
        predictedAwayScore: Number(awayScore),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit prediction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await api.put(`/predictions/${match._id}`, {
        predictedHomeScore: Number(homeScore),
        predictedAwayScore: Number(awayScore),
      });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update prediction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 0 1px var(--border-accent)' }}
      />

      {/* Team color bar — top accent stripe */}
      <div className="flex h-1">
        <div className="flex-1 transition-all duration-300" style={{ background: homeColor }} />
        <div className="flex-1 transition-all duration-300" style={{ background: awayColor }} />
      </div>

      <div className="p-4">

        {/* Teams row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Home */}
          <div className="flex items-center gap-1.5 min-w-0">
            {homeFlag
              ? <img src={homeFlag} alt={homeTeam} width="20" className="rounded-sm shrink-0" />
              : <span className="w-5 h-3.5 rounded-sm bg-white/10 inline-block shrink-0" />
            }
            <span className={`font-semibold text-sm truncate ${homeTeam === 'TBD' ? 'text-gray-500' : 'text-gray-100'}`}>
              {homeTeam}
            </span>
          </div>

          <span className="text-gray-600 text-xs font-bold shrink-0">vs</span>

          {/* Away */}
          <div className="flex items-center gap-1.5 min-w-0 flex-row-reverse">
            {awayFlag
              ? <img src={awayFlag} alt={awayTeam} width="20" className="rounded-sm shrink-0" />
              : <span className="w-5 h-3.5 rounded-sm bg-white/10 inline-block shrink-0" />
            }
            <span className={`font-semibold text-sm truncate text-right ${awayTeam === 'TBD' ? 'text-gray-500' : 'text-gray-100'}`}>
              {awayTeam}
            </span>
          </div>
        </div>

        {/* Date + status badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-gray-500 text-xs m-0">
            {new Date(match.matchDate).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {isLive && (
            <span className="animate-live inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--live-glow)', color: 'var(--live)', border: '1px solid var(--live-glow)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              LIVE
            </span>
          )}
          {countdown && !isLive && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              ⏱ {countdown}
            </span>
          )}
        </div>

        {/* Finished — final score */}
        {match.status === 'FINISHED' && (
          <div className="mb-2">
            <p className="font-bold font-mono text-xl tracking-widest text-gray-100 m-0">
              {match.homeScore} <span className="text-gray-600 text-sm">—</span> {match.awayScore}
            </p>
            {submitted && (
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="font-mono text-gray-500 text-xs">
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
          </div>
        )}

        {!teamsKnown && (
          <p className="text-gray-600 text-xs mt-1">Teams TBD</p>
        )}

        {/* Predict form */}
        {teamsKnown && !hasStarted && !submitted && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <input type="number" min="0" max="20" value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className={scoreInputClass} />
            <span className="font-mono text-gray-600 text-sm">—</span>
            <input type="number" min="0" max="20" value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className={scoreInputClass} />
            <button onClick={handlePredict} disabled={submitting}
              className="px-3 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: '#080b14' }}
            >
              {submitting ? '…' : 'Predict'}
            </button>
            {error && <p className="text-rose-400 text-xs w-full mt-1 m-0">{error}</p>}
          </div>
        )}

        {/* Submitted — read mode */}
        {submitted && match.status !== 'FINISHED' && !editing && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              Predicted
            </span>
            <span className="font-mono text-gray-300 text-sm font-bold">
              {homeScore} — {awayScore}
            </span>
            {!hasStarted && (
              <button onClick={() => setEditing(true)}
                className="text-xs text-gray-600 hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 transition-colors duration-150 ml-auto underline underline-offset-2"
              >
                Edit
              </button>
            )}
          </div>
        )}

        {/* Edit mode */}
        {submitted && editing && !hasStarted && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <input type="number" min="0" max="20" value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className={scoreInputClass} />
            <span className="font-mono text-gray-600 text-sm">—</span>
            <input type="number" min="0" max="20" value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className={scoreInputClass} />
            <button onClick={handleEdit} disabled={submitting}
              className="px-3 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: '#080b14' }}
            >
              {submitting ? '…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setError(''); }} disabled={submitting}
              className="text-xs text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            {error && <p className="text-rose-400 text-xs mt-1 m-0">{error}</p>}
          </div>
        )}

        {teamsKnown && hasStarted && !submitted && match.status !== 'FINISHED' && (
          <p className="text-gray-600 text-xs mt-2 m-0">Predictions closed</p>
        )}
      </div>
    </div>
  );
}

export default MatchCard;
