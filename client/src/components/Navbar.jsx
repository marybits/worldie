import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const linkClass = (path) =>
    location.pathname === path
      ? 'no-underline rounded-full px-4 py-2 border border-[var(--accent)] text-[var(--accent)] bg-transparent font-bold transition-colors'
      : 'no-underline rounded-full px-4 py-2 border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200 transition-colors';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <div className="flex justify-between items-center py-4 mb-6 border-b border-gray-800">
      <div className="flex flex-col">
        <h2 className="m-0 uppercase tracking-widest font-extrabold text-3xl text-[var(--accent)]">Worldie ⚽</h2>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">World Cup 2026 Predictions</span>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          Matches
        </Link>
        <Link to="/leaderboard" className={linkClass('/leaderboard')}>
          Leaderboard
        </Link>

        <div className="relative ml-4" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 text-gray-300 hover:text-gray-100 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <span className="bg-[var(--accent)] text-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold uppercase">
              {user?.username?.[0]}
            </span>
            <span className="text-sm">{user?.username}</span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden z-50">
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
  );
}

export default Navbar;
