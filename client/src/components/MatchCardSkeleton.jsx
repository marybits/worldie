function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex h-1">
        <div className="flex-1 skeleton" />
        <div className="flex-1 skeleton opacity-60" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-3.5 rounded-sm skeleton" />
            <div className="h-3 w-16 rounded skeleton" />
          </div>
          <div className="h-2.5 w-4 rounded skeleton" />
          <div className="flex items-center gap-1.5 flex-row-reverse">
            <div className="w-5 h-3.5 rounded-sm skeleton" />
            <div className="h-3 w-16 rounded skeleton" />
          </div>
        </div>
        <div className="h-2.5 w-24 rounded skeleton mb-3" />
        <div className="flex items-center gap-2">
          <div className="w-12 h-9 rounded-lg skeleton" />
          <div className="w-3 h-3 rounded skeleton" />
          <div className="w-12 h-9 rounded-lg skeleton" />
          <div className="w-16 h-9 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );
}

export default MatchCardSkeleton;
