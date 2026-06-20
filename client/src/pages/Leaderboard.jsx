import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await api.get('/leaderboard');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="max-w-[900px] mx-auto p-3 sm:p-6">
      <Navbar />

      <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-100 mt-8">
        <span className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
        Leaderboard 🏆
      </h2>

      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 sm:gap-4 mt-8 mb-8">
          {/* 2nd place */}
          {top3[1] ? (
            <div className="flex flex-col items-center border border-gray-800 rounded-xl p-3 sm:p-4 w-24 sm:w-36 h-28 sm:h-36 justify-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm">
                🥈
              </span>
              <p className="text-sm font-medium text-gray-300 truncate w-full text-center">{top3[1].username}</p>
              <p className="font-mono text-xs text-gray-400">{top3[1].totalPoints} pts</p>
            </div>
          ) : <div className="w-36" />}

          {/* 1st place — tallest, accent border */}
          <div className="flex flex-col items-center border border-(--accent) rounded-xl p-3 sm:p-4 w-24 sm:w-36 h-36 sm:h-44 justify-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm">
              🥇
            </span>
            <p className="text-sm font-bold text-gray-100 truncate w-full text-center">{top3[0].username}</p>
            <p className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{top3[0].totalPoints} pts</p>
          </div>

          {/* 3rd place */}
          {top3[2] ? (
            <div className="flex flex-col items-center border border-gray-800 rounded-xl p-3 sm:p-4 w-24 sm:w-36 h-20 sm:h-28 justify-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm">
                🥉
              </span>
              <p className="text-sm font-medium text-gray-300 truncate w-full text-center">{top3[2].username}</p>
              <p className="font-mono text-xs text-gray-400">{top3[2].totalPoints} pts</p>
            </div>
          ) : <div className="w-36" />}
        </div>
      )}

      <div className="bg-transparent rounded-2xl border border-gray-800 overflow-x-auto">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Rank</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Username</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Points</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Predictions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.userId} className="border-t border-gray-800">
                <td className="px-4 py-3 font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td className="px-4 py-3">{entry.username}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-gray-900 px-3 py-0.5 rounded-full text-sm font-bold" style={{ backgroundColor: 'var(--accent)' }}>
                    {entry.totalPoints}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{entry.predictionsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;
