import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import Navbar from '../components/Navbar';

const MEDAL = ['🥇', '🥈', '🥉'];

function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard]     = useState([]);
  const [groups, setGroups]               = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null); // null = Global
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    api.get('/groups/me').then((r) => setGroups(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedGroup ? `/leaderboard?groupId=${selectedGroup._id}` : '/leaderboard';
    api.get(url)
      .then((r) => setLeaderboard(r.data))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, [selectedGroup]);

  const podium = leaderboard.slice(0, 3).filter((e) => e.totalPoints > 0);
  const hasData = leaderboard.length > 0;

  /* ── Podium card ── */
  const PodiumCard = ({ entry, index }) => {
    const sizes  = ['h-40 sm:h-48', 'h-32 sm:h-40', 'h-28 sm:h-36'];
    const widths = ['w-28 sm:w-36', 'w-24 sm:w-32', 'w-24 sm:w-32'];
    const isFirst = index === 0;
    return (
      <div
        className={`flex flex-col items-center justify-end pb-4 rounded-2xl ${widths[index]} ${sizes[index]} transition-transform duration-200 hover:-translate-y-1`}
        style={{
          background: isFirst
            ? 'linear-gradient(160deg, oklch(72% 0.17 210 / 0.15), oklch(72% 0.17 210 / 0.04))'
            : 'var(--glass-bg)',
          border: `1px solid ${isFirst ? 'oklch(72% 0.17 210 / 0.3)' : 'var(--glass-border)'}`,
          boxShadow: isFirst ? '0 0 24px oklch(72% 0.17 210 / 0.12)' : 'var(--shadow-card)',
        }}
      >
        <span className="text-2xl mb-2">{MEDAL[index]}</span>
        <p className="text-xs sm:text-sm font-bold text-gray-100 truncate w-full text-center px-2 m-0">
          {entry.username}
        </p>
        <p className="font-mono text-xs mt-1 m-0" style={{ color: isFirst ? 'var(--accent)' : '#6b7280' }}>
          {entry.totalPoints} pts
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-[900px] mx-auto p-3 sm:p-6">
      <Navbar />

      {/* ── Header ── */}
      <div className="flex items-center justify-between mt-8 mb-6 flex-wrap gap-3">
        <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-100 m-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
          Leaderboard
        </h2>

        {/* Group selector */}
        {groups.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap p-1 rounded-xl"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
          >
            {[{ _id: null, name: 'Global' }, ...groups].map((g) => {
              const active = g._id === null ? selectedGroup === null : selectedGroup?._id === g._id;
              return (
                <button
                  key={g._id ?? 'global'}
                  onClick={() => setSelectedGroup(g._id === null ? null : g)}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border-none cursor-pointer transition-all duration-200"
                  style={active
                    ? { background: 'var(--accent)', color: 'var(--bg)' }
                    : { background: 'transparent', color: '#9ca3af' }
                  }
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4"
              style={i > 1 ? { borderTop: '1px solid var(--glass-border)' } : {}}
            >
              <div className="h-4 w-5 rounded skeleton shrink-0" />
              <div className="w-8 h-8 rounded-full skeleton shrink-0" />
              <div className="h-4 w-28 rounded skeleton" />
              <div className="h-6 w-14 rounded-full skeleton ml-auto" />
              <div className="h-4 w-8 rounded skeleton" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !hasData && (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3 rounded-2xl"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
        >
          <span className="text-4xl">🏆</span>
          <p className="text-gray-300 font-semibold m-0">No results yet</p>
          {selectedGroup && (
            <p className="text-gray-500 text-sm m-0 max-w-xs">
              Invite more friends to <span className="text-gray-300 font-semibold">{selectedGroup.name}</span> using your code from the{' '}
              <Link to="/groups" style={{ color: 'var(--accent)' }}>Groups</Link> page.
            </p>
          )}
        </div>
      )}

      {/* ── Podium ── */}
      {!loading && podium.length >= 1 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {/* Order: 2nd, 1st, 3rd */}
          {podium[1]
            ? <PodiumCard entry={podium[1]} index={1} />
            : <div className="w-24 sm:w-32" />
          }
          <PodiumCard entry={podium[0]} index={0} />
          {podium[2]
            ? <PodiumCard entry={podium[2]} index={2} />
            : <div className="w-24 sm:w-32" />
          }
        </div>
      )}

      {/* ── Table ── */}
      {!loading && hasData && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}
        >
          {/* Table header */}
          <div className="grid px-4 py-2.5"
            style={{
              gridTemplateColumns: '2.5rem 1fr 5rem 5rem',
              borderBottom: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {['#', 'Player', 'Points', 'Predictions'].map((h) => (
              <span key={h} className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold last:text-right">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {leaderboard.map((entry, index) => {
            const isMe    = entry.userId === user?.id;
            const isTop3  = index < 3 && entry.totalPoints > 0;

            return (
              <div
                key={entry.userId}
                className="grid items-center px-4 py-3 transition-colors duration-150 hover:bg-white/[0.02]"
                style={{
                  gridTemplateColumns: '2.5rem 1fr 5rem 5rem',
                  borderTop: index === 0 ? 'none' : '1px solid var(--glass-border)',
                  background: isMe ? 'oklch(72% 0.17 210 / 0.04)' : undefined,
                }}
              >
                {/* Rank */}
                <span className="font-mono text-sm text-gray-500 font-bold">
                  {isTop3 ? MEDAL[index] : `${index + 1}`}
                </span>

                {/* Avatar + username */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
                        : 'rgba(255,255,255,0.06)',
                      color: isMe ? 'var(--bg)' : '#9ca3af',
                    }}
                  >
                    {entry.username[0].toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold truncate ${isMe ? 'text-gray-100' : 'text-gray-300'}`}>
                    {entry.username}
                    {isMe && (
                      <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                      >
                        you
                      </span>
                    )}
                  </span>
                </div>

                {/* Points */}
                <div>
                  <span
                    className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-full"
                    style={isTop3
                      ? { background: 'var(--accent)', color: 'var(--bg)' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#d1d5db' }
                    }
                  >
                    {entry.totalPoints}
                  </span>
                </div>

                {/* Predictions */}
                <div className="text-right text-sm text-gray-500 font-mono">
                  {entry.predictionsCount}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
