import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Groups() {
  const { user } = useAuth();

  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);

  // Create group form
  const [showCreate, setShowCreate]   = useState(false);
  const [groupName, setGroupName]     = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');
  // After creating, show the invite code to the creator
  const [newGroup, setNewGroup]       = useState(null);

  // Join group form
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
      setNewGroup(res.data);   // triggers the "share your code" modal
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

  const isCreator = (group) => group.creator?._id === user?.id || group.creator === user?.id;

  return (
    <div className="max-w-[900px] mx-auto p-3 sm:p-6">
      <Navbar />

      {/* Header */}
      <div className="flex items-center justify-between mt-8 mb-6">
        <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-100 m-0">
          <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
          My Groups
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); }}
            className="px-4 py-2 rounded-xl text-sm text-gray-300 border border-gray-700 bg-transparent cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Join with code
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-900 border-none cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            + Create group
          </button>
        </div>
      </div>

      {/* Create group form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-gray-800 p-5 mb-6 flex flex-col gap-3"
        >
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide m-0">New group</h3>
          <input
            type="text"
            placeholder="Group name (e.g. Las Chamas)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
            minLength={2}
            maxLength={40}
            required
            autoFocus
          />
          {createError && <p className="text-red-400 text-xs m-0">{createError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-lg text-sm font-bold text-gray-900 border-none cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setCreateError(''); }}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 bg-gray-800 border-none cursor-pointer hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Join group form */}
      {showJoin && (
        <form
          onSubmit={handleJoin}
          className="rounded-2xl border border-gray-800 p-5 mb-6 flex flex-col gap-3"
        >
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide m-0">Join a group</h3>
          <input
            type="text"
            placeholder="Enter invite code (e.g. X7K2PQ)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm font-mono tracking-widest outline-none focus:border-[var(--accent)] placeholder:text-gray-500 placeholder:font-sans placeholder:tracking-normal"
            maxLength={6}
            required
            autoFocus
          />
          {joinError && <p className="text-red-400 text-xs m-0">{joinError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={joining}
              className="px-4 py-2 rounded-lg text-sm font-bold text-gray-900 border-none cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {joining ? 'Joining…' : 'Join'}
            </button>
            <button
              type="button"
              onClick={() => { setShowJoin(false); setJoinError(''); }}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 bg-gray-800 border-none cursor-pointer hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* New group created — show invite code */}
      {newGroup && (
        <div className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-5 mb-6">
          <p className="text-sm text-gray-300 mb-1 m-0">
            <span className="font-bold text-gray-100">{newGroup.name}</span> created! Share this code with your friends:
          </p>
          <p className="font-mono text-3xl font-extrabold tracking-[0.3em] mt-2 mb-3" style={{ color: 'var(--accent)' }}>
            {newGroup.code}
          </p>
          <button
            onClick={() => setNewGroup(null)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Group list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-800 p-5 animate-pulse">
              <div className="h-4 w-32 bg-gray-800 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
          <span className="text-5xl">🏆</span>
          <p className="text-gray-300 font-semibold text-lg m-0">No groups yet</p>
          <p className="text-gray-500 text-sm max-w-xs m-0">
            Create a group and share the code with friends, or join one with an invite code.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group._id} className="rounded-2xl border border-gray-800 p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-100 m-0 text-base">{group.name}</p>
                <p className="text-gray-500 text-sm m-0 mt-0.5">
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  {isCreator(group) && <span className="ml-2 text-xs text-[var(--accent)]">· you created this</span>}
                </p>
              </div>
              {/* Show code only to the creator */}
              {isCreator(group) && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-600 m-0 mb-0.5">Invite code</p>
                  <p className="font-mono font-bold tracking-widest text-gray-300 m-0">{group.code}</p>
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
