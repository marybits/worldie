import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const dropdownRef = useRef(null);

  const linkClass = (path) =>
    location.pathname === path
      ? 'no-underline rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-[var(--accent)] bg-gray-800 transition-colors'
      : 'no-underline rounded-xl px-3 py-1.5 text-xs sm:text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 transition-colors';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchRank() {
      try {
        const res = await api.get('/leaderboard');
        const index = res.data.findIndex((entry) => entry.userId === user?.id);
        if (index !== -1) {
          setUserRank({ rank: index + 1, points: res.data[index].totalPoints });
        }
      } catch {
        // Silently fail — rank is a nice-to-have, not critical
      }
    }
    if (user) fetchRank();
  }, [user]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <div className="py-4 mb-6 border-b border-gray-800">

      {/* Top row: logo on left, nav links (desktop) + avatar on right */}
      <div className="flex justify-between items-center">

        <h2 className="m-0 uppercase tracking-widest font-extrabold text-xl sm:text-4xl whitespace-nowrap">
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent">Worldie</span> ⚽
        </h2>

        <div className="flex items-center gap-2">
          {/* Nav links — desktop only */}
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/dashboard" className={linkClass('/dashboard')}>Matches</Link>
            <Link to="/leaderboard" className={linkClass('/leaderboard')}>Leaderboard</Link>
            <Link to="/groups" className={linkClass('/groups')}>Groups</Link>
          </div>

          {/* User avatar + dropdown */}
          <div className="relative ml-2 sm:ml-4" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 text-gray-300 hover:text-gray-100 transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              <span className="bg-[var(--accent)] text-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold uppercase">
                {user?.username?.[0]}
              </span>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm text-gray-200">{user?.username}</span>
                {userRank && (
                  <span className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                    #{userRank.rank} · {userRank.points} pts
                  </span>
                )}
              </div>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden z-50">
                {userRank && (
                  <div className="px-4 py-2.5 border-b border-gray-800">
                    <p className="text-xs text-gray-500 m-0">Your rank</p>
                    <p className="text-sm font-semibold text-gray-100 m-0 mt-0.5">
                      #{userRank.rank} · {userRank.points} pts
                    </p>
                  </div>
                )}
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors cursor-pointer border-none bg-transparent"
                >
                  Profile
                </button>
                <div className="h-px bg-gray-800" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors cursor-pointer border-none bg-transparent"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only nav row — below logo/avatar */}
      <div className="flex sm:hidden gap-1 mt-3">
        <Link to="/dashboard" className={linkClass('/dashboard')}>Matches</Link>
        <Link to="/leaderboard" className={linkClass('/leaderboard')}>Leaderboard</Link>
        <Link to="/groups" className={linkClass('/groups')}>Groups</Link>
      </div>

    </div>
  );
}

export default Navbar;
