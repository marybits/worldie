// StatsBar — shows the user's personal performance summary.
// Receives the predictions array already fetched by Dashboard,
// so no extra API call needed.
function StatsBar({ predictions }) {
  // Only count predictions where points have been calculated (match finished)
  const finished = predictions.filter((p) => p.points != null);

  const totalPoints  = finished.reduce((sum, p) => sum + p.points, 0);
  const exactCount   = finished.filter((p) => p.points === 3).length;
  const correctCount = finished.filter((p) => p.points >= 1).length;
  const accuracy     = finished.length > 0
    ? Math.round((correctCount / finished.length) * 100)
    : null;

  const stats = [
    { label: 'points',      value: totalPoints },
    { label: 'predictions', value: predictions.length },
    { label: 'exact ⭐',    value: exactCount },
    { label: 'accuracy',    value: accuracy != null ? `${accuracy}%` : '—' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center bg-gray-900 border border-gray-800 rounded-xl py-3 px-2 gap-0.5"
        >
          <span className="text-lg sm:text-2xl font-extrabold font-mono" style={{ color: 'var(--accent)' }}>
            {value}
          </span>
          <span className="text-gray-500 text-[10px] sm:text-xs text-center leading-tight">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
