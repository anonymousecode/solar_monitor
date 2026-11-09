'use client';

import Skeleton from '../ui/Skeleton';

function NodeBox({ icon, label, value, color, secondaryValue }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/90 p-3 sm:p-4 shadow-sm dark:shadow-md w-24 xs:w-28 sm:w-32 transition-all ${color}`}
    >
      <span className="text-xl sm:text-2xl mb-1">{icon}</span>
      <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">
        {label}
      </span>
      {value !== null && value !== undefined ? (
        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
          {Math.abs(value) >= 1000
            ? `${(Math.abs(value) / 1000).toFixed(1)} kW`
            : `${Math.abs(value)} W`}
        </span>
      ) : (
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">--</span>
      )}
      {secondaryValue !== undefined && secondaryValue !== null && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full font-mono">
          {secondaryValue}
        </span>
      )}
    </div>
  );
}

export default function PowerFlowDiagram({
  solarPower,
  homePower,
  gridPower,
  batteryPower,
  batterySOC,
  loading,
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-6 shadow-sm dark:shadow-md">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-28 rounded-xl" />
          <Skeleton className="h-4 w-12" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-16 w-24 rounded-xl" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-16 w-24 rounded-xl" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-16 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Determine flow states
  const isExporting = gridPower !== null && gridPower > 0;
  const isImporting = gridPower !== null && gridPower < 0;
  const isCharging = batteryPower !== null && batteryPower > 0;
  const isDischarging = batteryPower !== null && batteryPower < 0;

  const gridColor = isExporting
    ? 'bg-emerald-500 dark:bg-emerald-400'
    : isImporting
    ? 'bg-rose-500 dark:bg-rose-400'
    : 'bg-slate-300 dark:bg-slate-700';

  const batteryColor = isCharging
    ? 'bg-blue-500 dark:bg-blue-400'
    : isDischarging
    ? 'bg-amber-500 dark:bg-amber-400'
    : 'bg-slate-300 dark:bg-slate-700';

  const gridStatusText = isExporting ? 'Export' : isImporting ? 'Import' : 'Grid';
  const batteryStatusText = isCharging ? 'Charging' : isDischarging ? 'Discharging' : 'Battery';

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-6 shadow-sm dark:shadow-md transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Energy Flow</h3>
          <p className="text-[11px] text-slate-500">Live directional power distribution</p>
        </div>
        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60">
          {solarPower !== null && solarPower > 0 ? 'Generating' : 'Standby'}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 sm:gap-2 max-w-md mx-auto py-2">
        {/* Solar Panel - Top */}
        <NodeBox
          icon="☀️"
          label="Solar"
          value={solarPower}
          color="hover:border-amber-500/40"
        />

        {/* Solar → Inverter flow pipe */}
        <div className="flex flex-col items-center py-0.5">
          <div
            className={`w-1 h-6 sm:h-8 rounded-full ${
              solarPower ? 'bg-amber-500 dark:bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            style={
              solarPower
                ? {
                    backgroundSize: '8px 12px',
                    backgroundImage:
                      'repeating-linear-gradient(180deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)',
                    animation: 'flow-ltr 1s linear infinite',
                  }
                : {}
            }
          />
        </div>

        {/* Middle row: Grid ← Inverter → Home */}
        <div className="flex items-center justify-between w-full gap-1 xs:gap-2 sm:gap-3">
          {/* Grid Node */}
          <NodeBox
            icon="🏭"
            label={gridStatusText}
            value={gridPower}
            color={
              isExporting
                ? 'hover:border-emerald-500/40'
                : isImporting
                ? 'hover:border-rose-500/40'
                : ''
            }
          />

          {/* Grid ↔ Inverter flow line */}
          <div className="flex-1 flex flex-col items-center min-w-[20px] max-w-[60px] sm:max-w-[80px]">
            <div
              className={`h-1 w-full rounded-full ${gridColor}`}
              style={
                isExporting || isImporting
                  ? {
                      backgroundSize: '12px 12px',
                      backgroundImage: `repeating-linear-gradient(${
                        isExporting ? '270deg' : '90deg'
                      }, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)`,
                      animation: `flow-${isExporting ? 'rtl' : 'ltr'} 1s linear infinite`,
                    }
                  : {}
              }
            />
            {gridPower !== null && gridPower !== undefined && gridPower !== 0 && (
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                {Math.abs(gridPower) >= 1000
                  ? `${(Math.abs(gridPower) / 1000).toFixed(1)} kW`
                  : `${Math.abs(gridPower)} W`}
              </span>
            )}
          </div>

          {/* Central Inverter Node */}
          <NodeBox
            icon="⚡"
            label="Inverter"
            value={null}
            color="border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
            secondaryValue="2.2 kW"
          />

          {/* Inverter → Home flow line */}
          <div className="flex-1 flex flex-col items-center min-w-[20px] max-w-[60px] sm:max-w-[80px]">
            <div
              className={`h-1 w-full rounded-full ${
                homePower ? 'bg-rose-500 dark:bg-rose-400' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={
                homePower
                  ? {
                      backgroundSize: '12px 12px',
                      backgroundImage:
                        'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)',
                      animation: 'flow-ltr 1s linear infinite',
                    }
                  : {}
              }
            />
            {homePower !== null && homePower !== undefined && homePower !== 0 && (
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                {Math.abs(homePower) >= 1000
                  ? `${(Math.abs(homePower) / 1000).toFixed(1)} kW`
                  : `${Math.abs(homePower)} W`}
              </span>
            )}
          </div>

          {/* Home Node */}
          <NodeBox
            icon="🏠"
            label="Home"
            value={homePower}
            color="hover:border-rose-500/40"
          />
        </div>

        {/* Inverter → Battery flow pipe */}
        <div className="flex flex-col items-center py-0.5">
          <div
            className={`w-1 h-6 sm:h-8 rounded-full ${batteryColor}`}
            style={
              isCharging || isDischarging
                ? {
                    backgroundSize: '8px 12px',
                    backgroundImage: `repeating-linear-gradient(${
                      isCharging ? '180deg' : '0deg'
                    }, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)`,
                    animation: 'flow-ltr 1s linear infinite',
                  }
                : {}
            }
          />
        </div>

        {/* Battery Node - Bottom */}
        <NodeBox
          icon="🔋"
          label={batteryStatusText}
          value={batteryPower}
          color={
            isCharging
              ? 'hover:border-blue-500/40'
              : isDischarging
              ? 'hover:border-amber-500/40'
              : ''
          }
          secondaryValue={
            batterySOC !== null && batterySOC !== undefined
              ? `SOC: ${batterySOC}%`
              : 'No Battery'
          }
        />
      </div>
    </div>
  );
}
