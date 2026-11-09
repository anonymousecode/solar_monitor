'use client';

import Skeleton from '../ui/Skeleton';

export default function StatusCard({ icon, title, value, unit, subtitle, loading, unavailable }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
          <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-7 w-28 sm:h-8 sm:w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  const isUnavailable = unavailable || value === null || value === undefined;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white dark:border-slate-800/90 dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm dark:shadow-md transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
      <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/90 text-base sm:text-lg border border-slate-200 dark:border-slate-700/50">
          {icon}
        </div>
        <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-1">{title}</span>
      </div>

      {isUnavailable ? (
        <div className="mt-1">
          <p className="text-base sm:text-lg font-medium text-slate-400 dark:text-slate-500">Unavailable</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-600 mt-0.5">Not reported by inverter</p>
        </div>
      ) : (
        <div className="mt-1">
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline flex-wrap">
            <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>
            {unit && (
              <span className="ml-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>
            )}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
