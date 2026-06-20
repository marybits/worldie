// A skeleton placeholder that mimics the shape of a real MatchCard.
// Shown while matches are being fetched, so the layout doesn't jump.
function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-800 bg-transparent shadow-[0_-2px_12px_rgba(0,0,0,0.3)]">
      {/* Color bar at the top */}
      <div className="flex h-1">
        <div className="flex-1 bg-gray-700 animate-pulse" />
        <div className="flex-1 bg-gray-800 animate-pulse" />
      </div>

      <div className="p-3 sm:p-4 animate-pulse">
        {/* Team names row */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-3.5 rounded-sm bg-gray-700" />
          <div className="h-3 w-16 rounded bg-gray-700" />
          <div className="h-2.5 w-4 rounded bg-gray-800" />
          <div className="h-3 w-16 rounded bg-gray-700" />
          <div className="w-5 h-3.5 rounded-sm bg-gray-700" />
        </div>

        {/* Date / time row */}
        <div className="h-2.5 w-24 rounded bg-gray-800 mt-2" />

        {/* Score inputs placeholder */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-12 h-9 rounded-lg bg-gray-800" />
          <div className="w-2 h-3 rounded bg-gray-700" />
          <div className="w-12 h-9 rounded-lg bg-gray-800" />
          <div className="w-16 h-9 rounded-lg bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export default MatchCardSkeleton;
