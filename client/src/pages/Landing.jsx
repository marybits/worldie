import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
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

function Landing() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Auth form state
  const [tab, setTab]           = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Match data
  const [matches, setMatches] = useState([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    api.get('/matches').then((r) => setMatches(r.data)).catch(() => {});
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const nextMatch = matches.find((m) => new Date(m.matchDate) > Date.now());
  const upcomingMatches = matches
    .filter((m) => new Date(m.matchDate) > Date.now() && m._id !== nextMatch?._id)
    .slice(0, 4);

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

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 text-sm outline-none focus:border-[var(--accent)] placeholder:text-gray-500 transition-colors";

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Nav ── */}
      <header className="w-full px-4 sm:px-8 py-4 flex justify-between items-center border-b border-gray-800">
        <h2 className="m-0 uppercase tracking-widest font-extrabold text-xl sm:text-2xl whitespace-nowrap">
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent">Worldie</span> ⚽
        </h2>
      </header>

      {/* ── Main two-column layout ── */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* ── Left: Marketing ── */}
        <div className="flex-1 flex flex-col justify-center px-10 sm:px-16 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">FIFA World Cup 2026</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Predict. Compete.{' '}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent">
              Win.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mb-10">
            Call the scoreline before kickoff, earn points for accuracy, and compete with friends on a live leaderboard.
          </p>

          {/* How it works */}
          <div className="flex flex-col gap-4 mb-10">
            {[
              { icon: '⚽', title: 'Predict the score', desc: 'Pick the exact scoreline for each match before kickoff.' },
              { icon: '⭐', title: 'Earn points', desc: '3 pts for the exact score · 1 pt for the correct outcome.' },
              { icon: '🏆', title: 'Compete with friends', desc: 'Create a private league and battle it out all tournament long.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div>
                  <p className="text-gray-100 font-semibold text-sm m-0">{title}</p>
                  <p className="text-gray-500 text-sm m-0">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next match countdown */}
          {nextMatch && (
            <div className="rounded-2xl border border-gray-800 p-4 max-w-sm">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Next match</p>
              <p className="text-gray-200 font-semibold text-sm mb-1">
                {nextMatch.homeTeam} <span className="text-gray-600 mx-1">vs</span> {nextMatch.awayTeam}
              </p>
              <p className="text-gray-500 text-xs mb-2">
                {new Date(nextMatch.matchDate).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
              {getCountdown(nextMatch.matchDate) && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                >
                  ⏱ {getCountdown(nextMatch.matchDate)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Auth form ── */}
        <div className="w-full lg:w-[460px] border-t lg:border-t-0 lg:border-l border-gray-800 flex items-center justify-center px-10 py-12">
          <div className="w-full max-w-xs mx-auto lg:mx-0">

            {/* Login / Register tabs */}
            <div className="flex gap-1 mb-6 bg-gray-800/60 rounded-xl p-1">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors ${
                  tab === 'login' ? 'bg-gray-700 text-gray-100' : 'bg-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors ${
                  tab === 'register' ? 'bg-gray-700 text-gray-100' : 'bg-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {tab === 'register' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  required
                  minLength={3}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
              {authError && <p className="text-red-400 text-sm m-0">{authError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg font-bold text-gray-900 border-none cursor-pointer transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {submitting ? '…' : tab === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-500 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/google`}
              className="flex items-center justify-center gap-2 border border-gray-700 rounded-lg py-2.5 hover:bg-gray-800 transition-colors text-gray-200 no-underline text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
