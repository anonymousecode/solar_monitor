'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Skeleton from '../ui/Skeleton';
import { useTheme } from '../ui/ThemeContext';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {entry.value?.toLocaleString()} {entry.unit || 'W'}
        </p>
      ))}
    </div>
  );
}

export default function SolarChart({
  data,
  title,
  dataKey = 'value',
  xAxisKey = 'time',
  loading,
  chartType = 'area',
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm dark:shadow-md transition-colors duration-200">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-56 sm:h-64 w-full rounded-lg" />
      </div>
    );
  }

  const hasData = data && data.length > 0;
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const axisStroke = isDark ? '#334155' : '#cbd5e1';
  const tickFill = isDark ? '#64748b' : '#94a3b8';

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm dark:shadow-md flex flex-col transition-colors duration-200">
      {title && (
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">{title}</h3>
          {hasData && (
            <span className="text-[10px] text-slate-500 font-mono">
              {data.length} records
            </span>
          )}
        </div>
      )}

      {!hasData ? (
        <div className="flex h-56 sm:h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div className="text-center">
            <span className="text-2xl mb-1 block">📊</span>
            <p className="text-xs text-slate-500">No telemetry recorded for this timeframe</p>
          </div>
        </div>
      ) : (
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fill: tickFill, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke }}
                />
                <YAxis
                  tick={{ fill: tickFill, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)' }} />
                <Bar
                  dataKey={dataKey}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={isDark ? 0.4 : 0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fill: tickFill, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke }}
                />
                <YAxis
                  tick={{ fill: tickFill, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: axisStroke, strokeDasharray: '3 3' }} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#solarGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981', stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
