import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos]   = useState({ top: 0, left: 0 });
  const [userRank, setUserRank]         = useState(null);
  const containerRef = useRef(null); // the avatar+name div
  const portalRef    = useRef(null); // the portal dropdown div

  // Close on outside click — must exclude both the button AND the portal
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      const inButton = containerRef.current?.contains(e.target);
      const inPortal = portalRef.current?.contains(e.target);
      if (!inButton && !inPortal) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  useEffect(() => {
    async function fetchRank() {
      try {
        const res = await api.get('/leaderboard');
        const idx = res.data.findIndex((e) => e.userId === user?.id);
        if (idx !== -1) setUserRank({ rank: idx + 1, points: res.data[idx].totalPoints });
      } catch { /* silent */ }
    }
    if (user) fetchRank();
  }, [user]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `no-underline relative px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
      isActive(path) ? 'text-[var(--accent)]' : 'text-gray-400 hover:text-gray-100'
    }`;

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  function openDropdown() {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      // Left-align the dropdown with the container's left edge,
      // but clamp so it never goes off the right side of the viewport.
      const DROPDOWN_W = 220;
      const left = Math.max(8, r.right - DROPDOWN_W + 16);
      setDropdownPos({ top: r.bottom + 8, left });
    }
    setDropdownOpen((o) => !o);
  }

  const dropdown = dropdownOpen && createPortal(
    <div
      ref={portalRef}
      style={{
        position:   'fixed',
        top:        dropdownPos.top,
        left:       dropdownPos.left,
        width:      '220px',
        zIndex:     9999,
        background: 'rgba(10, 13, 24, 0.97)',
        border:     '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow:   'hidden',
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow:  '0 20px 60px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05) inset',
      }}
    >
      {userRank && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs text-gray-500 m-0">Your rank</p>
          <p className="text-sm font-bold text-gray-100 m-0 mt-0.5">
            #{userRank.rank}
            <span className="text-gray-500 font-normal"> · {userRank.points} pts</span>
          </p>
        </div>
      )}
      <button
        onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-gray-100 transition-colors duration-150 cursor-pointer border-none bg-transparent hover:bg-white/5"
      >
        Profile
      </button>
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:text-rose-400 transition-colors duration-150 cursor-pointer border-none bg-transparent hover:bg-white/5"
      >
        Logout
      </button>
    </div>,
    document.body
  );

  return (
    <>
      <nav
        className="mb-6 rounded-2xl px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* ── Logo ── */}
        <Link to="/dashboard" className="no-underline shrink-0">
          <span className="font-extrabold text-lg sm:text-2xl uppercase tracking-widest whitespace-nowrap"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Worldie</span>
            {' '}⚽
          </span>
        </Link>

        {/* ── Nav links ── */}
        <div className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          {[
            { to: '/dashboard',   label: 'Matches' },
            { to: '/leaderboard', label: 'Leaderboard' },
            { to: '/groups',      label: 'Groups' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className={navLinkClass(to)}>
              {label}
              {isActive(to) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ background: 'var(--accent)' }} />
              )}
            </Link>
          ))}
        </div>

        {/* ── Avatar button ── */}
        <div className="shrink-0" ref={containerRef}>
          <button
            onClick={openDropdown}
            className="flex items-center gap-2 cursor-pointer border-none p-1 rounded-xl transition-all duration-200 hover:bg-white/5"
            style={{ background: 'transparent' }}
          >
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                color: 'var(--bg)',
              }}
            >
              {initial}
            </span>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-sm text-gray-200 font-semibold whitespace-nowrap">
                {user?.username}
              </span>
              {userRank && (
                <span className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                  #{userRank.rank} · {userRank.points} pts
                </span>
              )}
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Mobile nav row ── */}
        <div className="sm:hidden w-full flex gap-1 pt-2 mt-1"
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          {[
            { to: '/dashboard',   label: 'Matches' },
            { to: '/leaderboard', label: 'Leaderboard' },
            { to: '/groups',      label: 'Groups' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className={`no-underline flex-1 text-center px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                isActive(to) ? 'bg-white/5' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }`}
              style={isActive(to) ? { color: 'var(--accent)' } : {}}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Portal dropdown — rendered in document.body, escapes all stacking contexts */}
      {dropdown}
    </>
  );
}

export default Navbar;
