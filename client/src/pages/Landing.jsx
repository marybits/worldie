import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getFlagUrl } from '../utils/teamFlags';
import api from '../services/api';

function getCountdown(matchDate) {
  const diff = new Date(matchDate) - Date.now();
  if (diff <= 0) return null;
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0)  return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function Landing() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [nextMatch, setNextMatch] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    api.get('/matches')
      .then((r) => {
        const next = r.data.find((m) => new Date(m.matchDate) > Date.now());
        setNextMatch(next ?? null);
      })
      .catch(() => {});
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSubmitting(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setAuthError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  /* shared input style */
  const Input = ({ ...props }) => (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-gray-100 outline-none transition-all duration-150"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)' }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--accent)';
        e.target.style.boxShadow   = '0 0 0 3px var(--accent-light)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--glass-border)';
        e.target.style.boxShadow   = 'none';
      }}
    />
  );

  const countdown = nextMatch ? getCountdown(nextMatch.matchDate) : null;
  const homeFlag  = nextMatch ? getFlagUrl(nextMatch.homeTeam) : null;
  const awayFlag  = nextMatch ? getFlagUrl(nextMatch.awayTeam) : null;

  return (
    /*
      We use `height: 100dvh` so the page exactly fills the viewport on mobile too.
      On desktop this is a true split: left marketing | right auth.
    */
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <header
        className="shrink-0 w-full flex items-center justify-between px-6 sm:px-10 py-4"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <span
          className="font-extrabold text-xl sm:text-2xl uppercase tracking-widest whitespace-nowrap"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Worldie
          </span>
          {' '}⚽
        </span>

        {/* small hint on desktop */}
        <p className="hidden sm:block text-xs text-gray-600 m-0">
          FIFA World Cup 2026 · Prediction game
        </p>
      </header>

      {/* ── Main split ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* ════ LEFT — Marketing ════ */}
        <div
          className="flex-1 flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-12 lg:py-0"
          style={{ maxWidth: '680px' }}
        >
          {/* Eyebrow */}
          <p className="text-xs uppercase tracking-[0.3em] mb-5 m-0"
            style={{ color: 'var(--accent)' }}
          >
            FIFA World Cup 2026
          </p>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Predict.{' '}
            <br className="hidden sm:block" />
            Compete.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Win.
            </span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-md mb-10 m-0">
            Call the scoreline before kickoff, earn points for accuracy, and compete with friends on a live leaderboard.
          </p>

          {/* How it works */}
          <div className="flex flex-col gap-3 mb-10">
            {[
              { icon: '⚽', title: 'Predict the score', desc: 'Pick the exact scoreline for each match before kickoff.' },
              { icon: '⭐', title: 'Earn points', desc: '3 pts for the exact score · 1 pt for the correct outcome.' },
              { icon: '🏆', title: 'Compete with friends', desc: 'Create a private league and battle it out all tournament long.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-xl mt-0.5 shrink-0 w-7 text-center">{icon}</span>
                <div>
                  <p className="text-gray-100 font-semibold text-sm m-0">{title}</p>
                  <p className="text-gray-500 text-sm m-0 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next match card */}
          {nextMatch && (
            <div
              className="rounded-2xl p-4 max-w-sm"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p className="text-[10px] uppercase tracking-widest text-gray-600 m-0 mb-2">Next match</p>
              <div className="flex items-center gap-2 mb-1.5">
                {homeFlag && <img src={homeFlag} alt={nextMatch.homeTeam} width="16" className="rounded-sm" />}
                <span className="text-gray-200 font-semibold text-sm">{nextMatch.homeTeam}</span>
                <span className="text-gray-600 text-xs">vs</span>
                <span className="text-gray-200 font-semibold text-sm">{nextMatch.awayTeam}</span>
                {awayFlag && <img src={awayFlag} alt={nextMatch.awayTeam} width="16" className="rounded-sm" />}
              </div>
              <p className="text-gray-600 text-xs m-0 mb-2">
                {new Date(nextMatch.matchDate).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
              {countdown && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  ⏱ {countdown}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ════ RIGHT — Auth panel ════ */}
        <div
          className="w-full lg:w-[480px] shrink-0 flex items-center justify-center px-6 py-12 lg:py-0"
          style={{
            borderTop: '1px solid var(--glass-border)',
            /* subtle right-panel tint so it reads as a distinct column */
            background: 'rgba(13,17,32,0.5)',
          }}
        >
          {/* Outer glow effect — purely decorative */}
          <div className="relative w-full max-w-sm">
            {/* faint glow behind the card */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ boxShadow: '0 0 60px oklch(72% 0.17 210 / 0.08)', transform: 'scale(1.05)' }}
            />

            {/* The glass auth card */}
            <div
              className="relative rounded-3xl p-8"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Tab switcher */}
              <div
                className="flex gap-1 mb-6 rounded-xl p-1"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {['login', 'register'].map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer capitalize transition-all duration-200"
                    style={tab === t
                      ? { background: 'rgba(255,255,255,0.08)', color: '#f9fafb' }
                      : { background: 'transparent', color: '#6b7280' }
                    }
                  >
                    {t === 'login' ? 'Login' : 'Register'}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {tab === 'register' && (
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {authError && (
                  <p className="text-rose-400 text-xs m-0 px-1">{authError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                    color: 'var(--bg)',
                    boxShadow: '0 0 16px var(--accent-glow)',
                  }}
                >
                  {submitting ? '…' : tab === 'login' ? 'Login' : 'Create account'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
                <span className="text-gray-600 text-xs">or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
              </div>

              {/* Google OAuth */}
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/google`}
                className="flex items-center justify-center gap-2.5 no-underline py-2.5 rounded-xl text-sm font-semibold text-gray-300 transition-all duration-200 hover:bg-white/5 hover:text-gray-100"
                style={{ border: '1px solid var(--glass-border)' }}
              >
                {GOOGLE_ICON}
                Continue with Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
