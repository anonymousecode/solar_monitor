'use client';

const granularityOptions = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function DateFilter({
  startDate,
  endDate,
  granularity,
  onStartDateChange,
  onEndDateChange,
  onGranularityChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-2.5 sm:px-3.5 sm:py-2 shadow-sm transition-colors duration-200">
      {/* Date Pickers */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <label htmlFor="start-date" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
            From
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange?.(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <label htmlFor="end-date" className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
            To
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange?.(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Granularity Pills */}
      <div className="grid grid-cols-4 sm:flex items-center gap-1">
        {granularityOptions.map((option) => {
          const isActive = granularity === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onGranularityChange?.(option.value)}
              className={`rounded-lg px-2.5 py-1 text-center text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
