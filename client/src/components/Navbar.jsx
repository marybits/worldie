import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Navbar() {
  const { user, logout, updateUsername } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const dropdownRef = useRef(null);

  // No more capsule borders — active state uses a subtle background + accent color,
  // inactive is plain text. Saves horizontal space and feels more modern.
  const linkClass = (path) =>
    location.pathname === path
      ? 'no-underline rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-[var(--accent)] bg-gray-800 transition-colors'
      : 'no-underline rounded-xl px-3 py-1.5 text-xs sm:text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 transition-colors';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setEditingUsername(false);
        setUsernameError('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  const openEditUsername = () => {
    setUsernameInput(user?.username ?? '');
    setUsernameError('');
    setEditingUsername(true);
  };

  const handleSaveUsername = async () => {
    setUsernameError('');
    try {
      await updateUsername(usernameInput);
      setEditingUsername(false);
      setDropdownOpen(false);
    } catch (err) {
      setUsernameError(err.response?.data?.message || 'Failed to update username');
    }
  };

  return (
    <div className="flex justify-between items-center py-4 mb-6 border-b border-gray-800">
      <div className="flex flex-col">
        {/* whitespace-nowrap prevents the ⚽ from wrapping to a second line on mobile */}
        <h2 className="m-0 uppercase tracking-widest font-extrabold text-xl sm:text-4xl whitespace-nowrap">
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent">Worldie</span> ⚽
        </h2>
        <span className="hidden sm:block text-xs text-gray-500 font-medium uppercase tracking-wide">World Cup 2026 Predictions</span>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          Matches
        </Link>
        <Link to="/leaderboard" className={linkClass('/leaderboard')}>
          Leaderboard
        </Link>

        <div className="relative ml-2 sm:ml-4" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen((o) => !o);
              setEditingUsername(false);
              setUsernameError('');
            }}
            className="flex items-center gap-1.5 text-gray-300 hover:text-gray-100 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <span className="bg-[var(--accent)] text-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold uppercase">
              {user?.username?.[0]}
            </span>
            <span className="hidden sm:block text-sm">{user?.username}</span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden z-50">
              {editingUsername ? (
                <div className="p-3 flex flex-col gap-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                    className="w-full px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
                    autoFocus
                  />
                  {usernameError && (
                    <p className="text-red-400 text-xs">{usernameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUsername}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-gray-900 border-none cursor-pointer transition-colors"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingUsername(false); setUsernameError(''); }}
                      className="flex-1 py-1.5 rounded-lg text-xs text-gray-400 bg-gray-800 border-none cursor-pointer hover:bg-gray-700 hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={openEditUsername}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    Edit username
                  </button>
                  <div className="h-px bg-gray-800" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
