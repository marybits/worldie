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
  const [usernameError, setUsernameError] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  // Delete account state
  // Two-step confirmation: user must type their username to confirm deletion.
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

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
    // Guard: username must match exactly before we allow deletion
    if (deleteInput !== user?.username) {
      setDeleteError('Username does not match');
      return;
    }
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto p-3 sm:p-6">
      <Navbar />

      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-100 mt-8 mb-6">
        <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
        Your Profile
      </h2>

      {/* Stats */}
      <StatsBar predictions={predictions} />

      {/* Account info */}
      <div className="rounded-2xl border border-gray-800 p-5 sm:p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Account</h3>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-800">
          <span className="bg-[var(--accent)] text-gray-900 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold uppercase shrink-0">
            {user?.username?.[0]}
          </span>
          <div>
            <p className="font-semibold text-gray-100 m-0">{user?.username}</p>
            <p className="text-gray-500 text-sm m-0">{user?.email}</p>
          </div>
        </div>

        {/* Change username */}
        <form onSubmit={handleSaveUsername} className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">Username</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => { setUsernameInput(e.target.value); setUsernameSuccess(''); setUsernameError(''); }}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
              minLength={3}
              required
            />
            <button
              type="submit"
              disabled={savingUsername || usernameInput === user?.username}
              className="px-4 py-2 rounded-lg text-sm font-bold text-gray-900 border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {savingUsername ? 'Saving…' : 'Save'}
            </button>
          </div>
          {usernameSuccess && <p className="text-green-400 text-xs">{usernameSuccess}</p>}
          {usernameError   && <p className="text-red-400 text-xs">{usernameError}</p>}
        </form>
      </div>

      {/* Delete account */}
      <div className="rounded-2xl border border-red-900/50 p-5 sm:p-6">
        <p className="text-gray-500 text-sm mb-4">
          Permanently delete your account and all your predictions. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg text-sm font-bold text-red-400 border border-red-900/60 bg-transparent cursor-pointer hover:bg-red-900/20 transition-colors"
          >
            Delete account
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-300">
              Type <span className="font-mono font-bold text-gray-100">{user?.username}</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => { setDeleteInput(e.target.value); setDeleteError(''); }}
              placeholder={user?.username}
              className="px-3 py-2 rounded-lg bg-gray-800 border border-red-900/60 text-gray-100 text-sm outline-none focus:border-red-500 placeholder:text-gray-600"
            />
            {deleteError && <p className="text-red-400 text-xs">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-700 border-none cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteError(''); }}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 bg-gray-800 border-none cursor-pointer hover:bg-gray-700 transition-colors"
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
