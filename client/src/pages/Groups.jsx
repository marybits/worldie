import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import Navbar from '../components/Navbar';
import api from '../services/api';

const inputClass = `
  w-full px-3 py-2.5 rounded-xl text-sm text-gray-100 outline-none
  transition-all duration-150
`.trim();
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--glass-border)',
};

function Groups() {
  const { user } = useAuth();

  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate]   = useState(false);
  const [groupName, setGroupName]     = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');
  const [newGroup, setNewGroup]       = useState(null);

  const [showJoin, setShowJoin]   = useState(false);
  const [joinCode, setJoinCode]   = useState('');
  const [joining, setJoining]     = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    api.get('/groups/me')
      .then((r) => setGroups(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await api.post('/groups', { name: groupName });
      setGroups((prev) => [res.data, ...prev]);
      setNewGroup(res.data);
      setGroupName('');
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoining(true);
    try {
      const res = await api.post('/groups/join', { code: joinCode });
      setGroups((prev) => [res.data, ...prev]);
      setJoinCode('');
      setShowJoin(false);
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const isCreator = (group) =>
    group.creator?._id === user?.id || group.creator === user?.id;

  const focusAccent = (e) => {
    e.target.style.borderColor = 'var(--accent)';
    e.target.style.boxShadow   = '0 0 0 3px var(--accent-light)';
  };
  const blurReset = (e) => {
    e.target.style.borderColor = 'var(--glass-border)';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div className="max-w-[900px] mx-auto p-3 sm:p-6">
      <Navbar />

      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-6 flex-wrap gap-3">
        <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-100 m-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
          My Groups
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin((v) => !v); setShowCreate(false); setJoinError(''); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 border-none hover:bg-white/5"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: '#9ca3af' }}
          >
            Join with code
          </button>
          <button
            onClick={() => { setShowCreate((v) => !v); setShowJoin(false); setCreateError(''); }}
            className="px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'var(--bg)' }}
          >
            + Create
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate}
          className="rounded-2xl p-5 mb-5 flex flex-col gap-3 animate-fade-up"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold m-0">New group</p>
          <input
            type="text"
            placeholder="Group name (e.g. World Cup Squad)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={inputClass}
            style={inputStyle}
            onFocus={focusAccent}
            onBlur={blurReset}
            minLength={2}
            maxLength={40}
            required
            autoFocus
          />
          {createError && <p className="text-rose-400 text-xs m-0">{createError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'var(--bg)' }}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button type="button"
              onClick={() => { setShowCreate(false); setCreateError(''); }}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 border-none cursor-pointer transition-colors duration-150 hover:text-gray-200"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Join form */}
      {showJoin && (
        <form onSubmit={handleJoin}
          className="rounded-2xl p-5 mb-5 flex flex-col gap-3 animate-fade-up"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold m-0">Join a group</p>
          <input
            type="text"
            placeholder="INVITE CODE"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className={`${inputClass} font-mono tracking-[0.25em] text-base`}
            style={inputStyle}
            onFocus={focusAccent}
            onBlur={blurReset}
            maxLength={6}
            required
            autoFocus
          />
          {joinError && <p className="text-rose-400 text-xs m-0">{joinError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={joining}
              className="px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'var(--bg)' }}
            >
              {joining ? 'Joining…' : 'Join'}
            </button>
            <button type="button"
              onClick={() => { setShowJoin(false); setJoinError(''); }}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 border-none cursor-pointer transition-colors duration-150 hover:text-gray-200"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* New group created — invite code banner */}
      {newGroup && (
        <div className="rounded-2xl p-5 mb-5 animate-fade-up"
          style={{
            background: 'linear-gradient(135deg, oklch(72% 0.17 210 / 0.12), oklch(72% 0.17 210 / 0.04))',
            border: '1px solid oklch(72% 0.17 210 / 0.3)',
            boxShadow: '0 0 20px oklch(72% 0.17 210 / 0.1)',
          }}
        >
          <p className="text-sm text-gray-400 m-0 mb-1">
            <span className="font-bold text-gray-100">{newGroup.name}</span> created! Share this code with your friends:
          </p>
          <p className="font-mono text-3xl font-extrabold tracking-[0.35em] mt-3 mb-3 m-0"
            style={{ color: 'var(--accent)' }}
          >
            {newGroup.code}
          </p>
          <button
            onClick={() => setNewGroup(null)}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors bg-transparent border-none cursor-pointer p-0 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl p-5"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div className="h-4 w-36 rounded skeleton mb-2" />
              <div className="h-3 w-20 rounded skeleton" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
          <span className="text-5xl">🏆</span>
          <p className="text-gray-300 font-semibold text-lg m-0">No groups yet</p>
          <p className="text-gray-500 text-sm max-w-xs m-0">
            Create a group and share the code with friends, or join one with an invite code.
          </p>
        </div>
      )}

      {/* Group list */}
      {!loading && groups.length > 0 && (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group._id}
              className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}
            >
              {/* Group avatar */}
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-extrabold shrink-0"
                style={{
                  background: isCreator(group)
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
                    : 'rgba(255,255,255,0.06)',
                  color: isCreator(group) ? 'var(--bg)' : '#9ca3af',
                }}
              >
                {group.name[0].toUpperCase()}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-100 m-0 text-base truncate">{group.name}</p>
                <p className="text-gray-500 text-sm m-0 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                  {isCreator(group) && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                    >
                      owner
                    </span>
                  )}
                </p>
              </div>

              {/* Invite code — creator only */}
              {isCreator(group) && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 m-0 mb-1">Invite code</p>
                  <p className="font-mono font-extrabold tracking-[0.2em] m-0"
                    style={{ color: 'var(--accent)' }}
                  >
                    {group.code}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Groups;
