import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';
import api from '../services/api';

function Profile() {
  const { user, updateUsername, logout } = useAuth();
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState([]);

  // Username form state
  const [usernameInput, setUsernameInput] = useState(user?.username ?? '');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [usernameError, setUsernameError]   = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    api.get('/predictions/me')
      .then((res) => setPredictions(res.data))
      .catch(() => {});
  }, []);

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess('');
    setSavingUsername(true);
    try {
      await updateUsername(usernameInput);
      setUsernameSuccess('Username updated!');
    } catch (err) {
      setUsernameError(err.response?.data?.message || 'Failed to update username');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.username) {
      setDeleteError('Username does not match');
      return;
    }
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="max-w-[900px] mx-auto p-3 sm:p-6">
      <Navbar />

      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-100 mt-8 mb-6"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
        Your Profile
      </h2>

      {/* Stats */}
      <StatsBar predictions={predictions} />

      {/* Account info */}
      <div className="rounded-2xl p-5 sm:p-6 mb-4"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-4 m-0">Account</p>

        {/* Avatar + info */}
        <div className="flex items-center gap-3 mb-5 pb-5"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              color: 'var(--bg)',
            }}
          >
            {initial}
          </span>
          <div>
            <p className="font-bold text-gray-100 m-0 text-base">{user?.username}</p>
            <p className="text-gray-500 text-sm m-0 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Change username */}
        <form onSubmit={handleSaveUsername} className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Username</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => { setUsernameInput(e.target.value); setUsernameSuccess(''); setUsernameError(''); }}
              className="flex-1 px-3 py-2 rounded-xl text-sm text-gray-100 outline-none transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
              minLength={3}
              required
            />
            <button
              type="submit"
              disabled={savingUsername || usernameInput === user?.username}
              className="px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'var(--bg)' }}
            >
              {savingUsername ? 'Saving…' : 'Save'}
            </button>
          </div>
          {usernameSuccess && (
            <p className="text-emerald-400 text-xs m-0 flex items-center gap-1">
              <span>✓</span> {usernameSuccess}
            </p>
          )}
          {usernameError && <p className="text-rose-400 text-xs m-0">{usernameError}</p>}
        </form>
      </div>

      {/* Delete account */}
      <div className="rounded-2xl p-5 sm:p-6"
        style={{ background: 'var(--glass-bg)', border: '1px solid rgba(244,63,94,0.2)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-[10px] uppercase tracking-widest text-rose-900 font-semibold mb-1 m-0">Danger zone</p>
        <p className="text-gray-500 text-sm mb-4 m-0 mt-1">
          Permanently delete your account and all your predictions. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-rose-900/20"
            style={{ color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', background: 'transparent' }}
          >
            Delete account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-300 m-0">
              Type <span className="font-mono font-bold text-gray-100">{user?.username}</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => { setDeleteInput(e.target.value); setDeleteError(''); }}
              placeholder={user?.username}
              className="px-3 py-2 rounded-xl text-sm text-gray-100 outline-none transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(244,63,94,0.4)',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#f43f5e'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(244,63,94,0.4)'; }}
            />
            {deleteError && <p className="text-rose-400 text-xs m-0">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white border-none cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{ background: '#be123c' }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteError(''); }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 border-none cursor-pointer transition-colors duration-150 hover:text-gray-200"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
