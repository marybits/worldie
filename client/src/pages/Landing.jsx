import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Reusable countdown helper — same logic as MatchCard
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
  const [matches, setMatches] = useState([]);
  const [, setTick] = useState(0); // forces re-render every minute for countdowns

  useEffect(() => {
    api.get('/matches').then((r) => setMatches(r.data)).catch(() => {});

    // Re-render every 60 seconds so countdowns stay live
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Next match that hasn't started yet
  const nextMatch = matches.find((m) => new Date(m.matchDate) > Date.now());

  // Next 4 upcoming matches (excluding the hero one)
  const upcomingMatches = matches
    .filter((m) => new Date(m.matchDate) > Date.now() && m._id !== nextMatch?._id)
    .slice(0, 4);

  return (
    <div className="min-h-screen">

      {/* ── Nav ── */}
      <header className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <h2 className="m-0 uppercase tracking-widest font-extrabold text-xl sm:text-3xl whitespace-nowrap">
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent">Worldie</span> ⚽
        </h2>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="no-underline px-4 py-1.5 rounded-xl text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="no-underline px-4 py-1.5 rounded-xl text-sm font-bold text-gray-900 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Register
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6">

        {/* ── Hero ── */}
        <section className="py-20 sm:py-28 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">FIFA World Cup 2026</p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Predict. Compete.{' '}
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] bg-clip-text text-transparent">
              Win.
            </span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-10">
            Call the scoreline before kickoff, earn points for accuracy, and battle
            your friends on a live leaderboard.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="no-underline px-6 py-3 rounded-xl font-bold text-gray-900 text-base transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Start predicting →
            </Link>
            <Link
              to="/login"
              className="no-underline px-6 py-3 rounded-xl font-bold text-gray-300 text-base border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              Already have an account
            </Link>
          </div>
        </section>

        {/* ── Next match countdown ── */}
        {nextMatch && (
          <section className="mb-16">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 text-center">Next match</p>
            <div className="rounded-2xl border border-gray-800 p-6 sm:p-8 text-center max-w-md mx-auto">
              <p className="text-gray-300 font-semibold text-lg mb-1">
                {nextMatch.homeTeam} <span className="text-gray-600 mx-2">vs</span> {nextMatch.awayTeam}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {new Date(nextMatch.matchDate).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
              {getCountdown(nextMatch.matchDate) && (
                <div
                  className="inline-block px-5 py-2 rounded-full text-2xl font-extrabold tracking-tight"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                >
                  ⏱ {getCountdown(nextMatch.matchDate)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Upcoming matches ── */}
        {upcomingMatches.length > 0 && (
          <section className="mb-16">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-gray-100 mb-4">
              <span className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
              Upcoming matches
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {upcomingMatches.map((m) => (
                <div key={m._id} className="rounded-2xl border border-gray-800 p-4">
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(m.matchDate).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-200 font-semibold text-sm leading-snug">
                    {m.homeTeam}
                    <span className="text-gray-600 mx-1.5">vs</span>
                    {m.awayTeam}
                  </p>
                  {getCountdown(m.matchDate) && (
                    <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      ⏱ {getCountdown(m.matchDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}


        {/* ── Points system explainer ── */}
        <section className="mb-20">
          <h2 className="flex items-center gap-3 text-xl font-extrabold text-gray-100 mb-6">
            <span className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '⚽', title: 'Predict the score', desc: 'Pick the exact scoreline for each match before kickoff.' },
              { icon: '⭐', title: 'Earn points', desc: '3 pts for the exact score. 1 pt for the correct outcome (win / draw / loss).' },
              { icon: '🏆', title: 'Climb the leaderboard', desc: 'Compete against everyone — see who calls the World Cup best.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-800 p-5">
                <span className="text-3xl mb-3 block">{icon}</span>
                <h3 className="text-gray-100 font-bold mb-1 text-base">{title}</h3>
                <p className="text-gray-500 text-sm m-0">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="text-center pb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-100 mb-3">Ready to play?</h2>
          <p className="text-gray-500 mb-6">Free to join. Compete with friends.</p>
          <Link
            to="/register"
            className="no-underline inline-block px-8 py-3 rounded-xl font-bold text-gray-900 text-base transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Create your account →
          </Link>
        </section>

      </main>
    </div>
  );
}

export default Landing;
