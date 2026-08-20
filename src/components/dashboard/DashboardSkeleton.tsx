'use client';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric cards skeleton — 4 cards in responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`metric-${i}`}
            className="relative rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 p-4 overflow-hidden"
          >
            <div className="shimmer absolute inset-0 rounded-xl" />
            <div className="relative flex items-start justify-between">
              <div className="space-y-2.5 flex-1">
                <div className="h-6 w-[60%] rounded bg-white/60 dark:bg-gray-700/60" />
                <div className="h-3 w-[40%] rounded bg-white/60 dark:bg-gray-700/60" />
              </div>
              <div className="h-5 w-5 rounded-full bg-white/60 dark:bg-gray-700/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Agent grid skeleton — 6 cards in 3x2 grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-4 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`agent-${i}`}
              className="relative rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 p-4 overflow-hidden"
            >
              <div className="shimmer absolute inset-0 rounded-lg" />
              <div className="relative space-y-3">
                {/* Circle with status dot */}
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-white/60 dark:bg-gray-700/60" />
                  <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-white/60 dark:bg-gray-700/60 ml-4 -mt-1" />
                  </div>
                </div>
                {/* Name line */}
                <div className="h-3.5 w-[55%] rounded bg-white/60 dark:bg-gray-700/60" />
                {/* Description line (truncated) */}
                <div className="h-3 w-[80%] rounded bg-white/60 dark:bg-gray-700/60" />
                {/* Progress bar skeleton */}
                <div className="h-2 w-full rounded-full bg-white/60 dark:bg-gray-700/60" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts area skeleton — 2/3 + 1/3 split */}
      <div>
        <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Large chart block (2/3) */}
          <div
            className="relative lg:col-span-2 h-56 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 overflow-hidden"
          >
            <div className="shimmer absolute inset-0 rounded-xl" />
          </div>
          {/* Small chart block (1/3) */}
          <div
            className="relative h-56 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 overflow-hidden"
          >
            <div className="shimmer absolute inset-0 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
