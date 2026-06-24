import { useState } from 'react';
import api from '../services/api';
import { getFlagUrl } from '../utils/teamFlags';

// ── Layout constants ────────────────────────────────────────────────────────
const CARD_W    = 196;
const CARD_H    = 96;
const CONN_W    = 36;   // width of the connector zone between columns
const BASE_SLOT = 116;  // slot height for the first round (CARD_H + 20 gap)

// ── Helpers ─────────────────────────────────────────────────────────────────
function getCountdown(dt) {
  const diff = new Date(dt) - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const RESULT_STYLES = {
  3: { color: '#34d399', bg: 'rgba(52,211,153,0.15)', label: '⭐ +3' },
  1: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  label: '+1' },
  0: { color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: '+0' },
};

// ── Compact bracket match card ───────────────────────────────────────────────
function BracketCard({ match, existingPrediction }) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.predictedHomeScore ?? '');
  const [awayScore, setAwayScore] = useState(existingPrediction?.predictedAwayScore ?? '');
  const [submitted, setSubmitted] = useState(!!existingPrediction);
  const [editing,   setEditing]   = useState(false);
  const [error,     setError]     = useState('');
  const [busy,      setBusy]      = useState(false);

  const hasStarted = new Date() >= new Date(match.matchDate);
  const isLive     = hasStarted && match.status !== 'FINISHED';
  const isFinished = match.status === 'FINISHED';
  const countdown  = getCountdown(match.matchDate);
  const homeTeam   = match.homeTeam || 'TBD';
  const awayTeam   = match.awayTeam || 'TBD';
  const teamsKnown = !!(match.homeTeam && match.awayTeam);
  const homeFlag   = getFlagUrl(match.homeTeam);
  const awayFlag   = getFlagUrl(match.awayTeam);

  const save = async (isEdit) => {
    if (busy) return;
    setError(''); setBusy(true);
    try {
      if (isEdit) {
        await api.put(`/predictions/${match._id}`, {
          predictedHomeScore: Number(homeScore),
          predictedAwayScore: Number(awayScore),
        });
        setEditing(false);
      } else {
        await api.post('/predictions', {
          matchId: match._id,
          predictedHomeScore: Number(homeScore),
          predictedAwayScore: Number(awayScore),
        });
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally { setBusy(false); }
  };

  const numInput = (val, setter) => (
    <input
      type="number" min="0" max="20" value={val}
      onChange={e => setter(e.target.value)}
      className="no-spinner"
      style={{
        width: 26, textAlign: 'center', fontFamily: 'monospace', fontSize: 11,
        padding: '2px 0', borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.06)', color: '#e5e7eb', outline: 'none',
      }}
    />
  );

  return (
    <div style={{
      width: CARD_W, height: CARD_H,
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRadius: 10, padding: '7px 10px',
      boxSizing: 'border-box', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>

      {/* Date + live/countdown badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: '#6b7280', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {new Date(match.matchDate).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
        {isLive && (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.15)', borderRadius: 99, padding: '1px 5px', flexShrink: 0 }}>
            LIVE
          </span>
        )}
        {countdown && !isLive && (
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', borderRadius: 99, padding: '1px 5px', flexShrink: 0 }}>
            {countdown}
          </span>
        )}
      </div>

      {/* Teams */}
      {[
        { team: homeTeam, flag: homeFlag, score: isFinished ? match.homeScore : null },
        { team: awayTeam, flag: awayFlag, score: isFinished ? match.awayScore : null },
      ].map(({ team, flag, score }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {flag
            ? <img src={flag} alt={team} width={15} style={{ borderRadius: 2, flexShrink: 0 }} />
            : <span style={{ width: 15, height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 2, flexShrink: 0, display: 'inline-block' }} />
          }
          <span style={{
            fontSize: 11, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: team === 'TBD' ? '#374151' : '#e5e7eb',
          }}>
            {team}
          </span>
          {score !== null && (
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#f9fafb', flexShrink: 0 }}>
              {score}
            </span>
          )}
        </div>
      ))}

      {/* Bottom row: prediction / result / inputs */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minHeight: 0 }}>

        {/* Finished & predicted → show predicted score + points badge */}
        {isFinished && submitted && (() => {
          const s = RESULT_STYLES[existingPrediction?.points];
          return (
            <>
              <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>
                {homeScore}–{awayScore}
              </span>
              {s && (
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 99, padding: '1px 5px' }}>
                  {s.label}
                </span>
              )}
            </>
          );
        })()}

        {/* Not finished, predicted, not editing */}
        {!isFinished && submitted && !editing && (
          <>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', borderRadius: 99, padding: '1px 6px' }}>
              {homeScore}–{awayScore}
            </span>
            {!hasStarted && (
              <button onClick={() => setEditing(true)} style={{ fontSize: 10, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto' }}>
                edit
              </button>
            )}
          </>
        )}

        {/* Predict / edit form */}
        {teamsKnown && !hasStarted && (!submitted || editing) && (
          <>
            {numInput(homeScore, setHomeScore)}
            <span style={{ fontSize: 11, color: '#4b5563', fontFamily: 'monospace' }}>—</span>
            {numInput(awayScore, setAwayScore)}
            <button
              onClick={() => save(editing)} disabled={busy}
              style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, border: 'none',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                color: '#080b14', cursor: 'pointer', opacity: busy ? 0.5 : 1, flexShrink: 0,
              }}
            >
              {busy ? '…' : editing ? 'Save' : 'Predict'}
            </button>
            {editing && (
              <button onClick={() => { setEditing(false); setError(''); }} style={{ fontSize: 10, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                ✕
              </button>
            )}
          </>
        )}

        {/* TBD teams */}
        {!teamsKnown && !isFinished && (
          <span style={{ fontSize: 10, color: '#374151' }}>Teams TBD</span>
        )}

        {/* Match started, no prediction */}
        {teamsKnown && hasStarted && !submitted && !isFinished && (
          <span style={{ fontSize: 10, color: '#4b5563' }}>Predictions closed</span>
        )}

        {error && (
          <span style={{ fontSize: 10, color: '#f87171', marginLeft: 'auto' }} title={error}>!</span>
        )}
      </div>
    </div>
  );
}

// ── Main bracket component ───────────────────────────────────────────────────
export default function TournamentBracket({ rounds, predictions }) {
  // rounds: [{ name, matches[] }] ordered chronologically (R32 → … → Final)
  // Third Place Play-off is separated and shown below the bracket

  const BRACKET_ROUNDS = rounds.filter(r => r.name !== 'Third Place Play-off');
  const thirdPlace     = rounds.find(r => r.name === 'Third Place Play-off');

  const getPred = (matchId) => predictions.find(p => p.match._id === matchId);

  const nFirst  = BRACKET_ROUNDS[0]?.matches.length ?? 0;
  const TOTAL_H = nFirst * BASE_SLOT;
  const TOTAL_W = BRACKET_ROUNDS.length > 0
    ? BRACKET_ROUNDS.length * CARD_W + (BRACKET_ROUNDS.length - 1) * CONN_W
    : 0;

  // Build SVG connector paths between rounds
  // Each pair of cards (mi=0,1), (2,3), … in round r feeds into one card in round r+1.
  // center of card mi in round r = mi * slotH + slotH/2
  // midpoint y between a pair = (center0 + center1) / 2 = (mi+1) * slotH (for even mi)
  const connPaths = [];
  BRACKET_ROUNDS.forEach((round, ri) => {
    if (ri === BRACKET_ROUNDS.length - 1) return;
    const slotH       = BASE_SLOT * Math.pow(2, ri);
    const colRight    = ri * (CARD_W + CONN_W) + CARD_W;
    const midX        = colRight + CONN_W / 2;
    const nextColLeft = (ri + 1) * (CARD_W + CONN_W);

    for (let mi = 0; mi < round.matches.length; mi += 2) {
      const c0   = mi * slotH + slotH / 2;
      const c1   = (mi + 1) * slotH + slotH / 2;
      const midY = (c0 + c1) / 2; // = (mi + 1) * slotH

      // Top card → midpoint
      connPaths.push(`M ${colRight} ${c0} H ${midX} V ${midY}`);
      // Bottom card → midpoint
      connPaths.push(`M ${colRight} ${c1} H ${midX} V ${midY}`);
      // Midpoint → next column
      connPaths.push(`M ${midX} ${midY} H ${nextColLeft}`);
    }
  });

  if (!BRACKET_ROUNDS.length) return null;

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>

      {/* Column headers */}
      <div style={{ display: 'flex', marginBottom: 10, minWidth: TOTAL_W }}>
        {BRACKET_ROUNDS.map((round, ri) => (
          <div key={round.name} style={{
            width: CARD_W,
            marginRight: ri < BRACKET_ROUNDS.length - 1 ? CONN_W : 0,
            textAlign: 'center',
            fontSize: 10, fontWeight: 700,
            color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {round.name}
          </div>
        ))}
      </div>

      {/* Bracket area */}
      <div style={{ position: 'relative', width: TOTAL_W, height: TOTAL_H }}>

        {/* SVG connector lines */}
        <svg
          width={TOTAL_W} height={TOTAL_H}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {connPaths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
          ))}
        </svg>

        {/* Match cards */}
        {BRACKET_ROUNDS.map((round, ri) => {
          const slotH = BASE_SLOT * Math.pow(2, ri);
          return round.matches.map((match, mi) => {
            const top  = mi * slotH + (slotH - CARD_H) / 2;
            const left = ri * (CARD_W + CONN_W);
            return (
              <div key={match._id} style={{ position: 'absolute', top, left }}>
                <BracketCard match={match} existingPrediction={getPred(match._id)} />
              </div>
            );
          });
        })}
      </div>

      {/* Third place play-off (outside the tree) */}
      {thirdPlace?.matches[0] && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Third Place Play-off
          </p>
          <BracketCard match={thirdPlace.matches[0]} existingPrediction={getPred(thirdPlace.matches[0]._id)} />
        </div>
      )}
    </div>
  );
}
