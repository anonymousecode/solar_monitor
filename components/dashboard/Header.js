'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../ui/ThemeContext';

export default function Header({
  connectionStatus,
  lastUpdated,
  onRefresh,
  autoRefresh,
  onAutoRefreshToggle,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        handleRefresh();
      }, 2 * 60 * 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, handleRefresh]);

  const isConnected = connectionStatus === 'connected';
  const isError = connectionStatus === 'error';

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {/* Left: Brand title & live status pill */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-xl border border-amber-500/20">
              ☀️
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Deye Solar Monitor
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
                OpenAPI Real-Time Telemetry
              </p>
            </div>
          </div>

          {/* Connection status badge (visible in top-right on mobile) */}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 px-2.5 py-1 sm:hidden">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 dark:bg-emerald-400 shadow-emerald-400/50 shadow-sm animate-pulse'
                  : isError
                  ? 'bg-rose-500 dark:bg-rose-400 shadow-rose-400/50 shadow-sm'
                  : 'bg-amber-500 dark:bg-amber-400 shadow-amber-400/50 shadow-sm'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {isConnected ? 'Online' : isError ? 'Error' : 'Connecting'}
            </span>
          </div>
        </div>

        {/* Right: Controls, Theme Toggle & Time */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t border-slate-200 dark:border-slate-800/60 pt-2.5 sm:border-0 sm:pt-0">
          {/* Status badge & timestamp on tablet / desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-500 dark:bg-emerald-400 shadow-emerald-400/50 shadow-sm'
                    : isError
                    ? 'bg-rose-500 dark:bg-rose-400 shadow-rose-400/50 shadow-sm'
                    : 'bg-amber-500 dark:bg-amber-400 shadow-amber-400/50 shadow-sm'
                }`}
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {isConnected ? 'Connected' : isError ? 'Error' : 'Checking'}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Updated:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{formatTimestamp(lastUpdated)}</span>
            </div>
          </div>

          {/* Mobile timestamp */}
          <div className="flex items-center gap-1 sm:hidden text-[11px] text-slate-500 dark:text-slate-400">
            <span>Upd:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{formatTimestamp(lastUpdated)}</span>
          </div>

          {/* Action buttons & Light/Dark toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle light/dark mode"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Auto-refresh button */}
            <button
              type="button"
              onClick={() => onAutoRefreshToggle?.()}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-300'
              }`}
              title={autoRefresh ? 'Disable auto-refresh (2m)' : 'Enable auto-refresh (2m)'}
            >
              <span className={`text-[11px] ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                ⟳
              </span>
              <span className="hidden xs:inline">Auto</span>
            </button>

            {/* Refresh button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 active:scale-95"
            >
              <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
