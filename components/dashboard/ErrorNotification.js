'use client';

export default function ErrorNotification({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="transform transition-all duration-300 ease-out translate-y-0 opacity-100">
      <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 shadow-lg">
        {/* Error icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
          <span className="text-sm">⚠️</span>
        </div>

        {/* Error message */}
        <p className="flex-1 text-sm text-rose-300">
          {typeof error === 'string' ? error : error.message || 'An unexpected error occurred'}
        </p>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
