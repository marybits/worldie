function StatsBar({ predictions }) {
  const finished     = predictions.filter((p) => p.points != null);
  const totalPoints  = finished.reduce((sum, p) => sum + p.points, 0);
  const exactCount   = finished.filter((p) => p.points === 3).length;
  const correctCount = finished.filter((p) => p.points >= 1).length;
  const accuracy     = finished.length > 0
    ? Math.round((correctCount / finished.length) * 100)
    : null;

  const stats = [
    { label: 'Points',      value: totalPoints,                      highlight: true },
    { label: 'Predictions', value: predictions.length,               highlight: false },
    { label: 'Exact ⭐',    value: exactCount,                       highlight: false },
    { label: 'Accuracy',    value: accuracy != null ? `${accuracy}%` : '—', highlight: false },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
      {stats.map(({ label, value, highlight }) => (
        <div
          key={label}
          className="relative flex flex-col items-center justify-center rounded-2xl py-4 px-2 gap-1 overflow-hidden"
          style={{
            background: highlight
              ? 'linear-gradient(160deg, oklch(72% 0.17 210 / 0.15), oklch(72% 0.17 210 / 0.04))'
              : 'var(--glass-bg)',
            border: `1px solid ${highlight ? 'oklch(72% 0.17 210 / 0.25)' : 'var(--glass-border)'}`,
            boxShadow: highlight ? '0 0 20px oklch(72% 0.17 210 / 0.1)' : 'var(--shadow-card)',
          }}
        >
          {highlight && (
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(72% 0.17 210 / 0.1), transparent)',
              }}
            />
          )}
          <span
            className="text-xl sm:text-3xl font-extrabold font-mono relative z-10"
            style={{ color: highlight ? 'var(--accent)' : '#f9fafb' }}
          >
            {value}
          </span>
          <span className="text-gray-500 text-[10px] sm:text-xs text-center leading-tight relative z-10 uppercase tracking-wide">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;
