'use client';

import Skeleton from '../ui/Skeleton';

export default function StationInfo({ stations, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm dark:shadow-md transition-colors duration-200">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const hasStations = stations && stations.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm dark:shadow-md transition-colors duration-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Solar Station</h3>
        <span className="text-xs text-slate-500 font-mono">
          {stations ? `${stations.length} registered` : ''}
        </span>
      </div>

      {!hasStations ? (
        <p className="text-xs text-slate-500 py-3">No stations discovered</p>
      ) : (
        <div className="space-y-3">
          {stations.map((station, index) => (
            <div
              key={station.id || index}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base shrink-0">🏡</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{station.name || 'Solar Plant'}</h4>
                </div>
                <span className="rounded bg-slate-200 dark:bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-400 shrink-0">
                  #{station.id || '--'}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs">
                {station.installedCapacity !== undefined && station.installedCapacity !== null && (
                  <div className="rounded-md bg-white dark:bg-slate-900/90 p-2 border border-slate-200 dark:border-slate-800/60 shadow-xs">
                    <dt className="text-[10px] text-slate-500 uppercase tracking-wider">Capacity</dt>
                    <dd className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200 font-mono mt-0.5">
                      {station.installedCapacity} kW
                    </dd>
                  </div>
                )}

                <div className="rounded-md bg-white dark:bg-slate-900/90 p-2 border border-slate-200 dark:border-slate-800/60 shadow-xs">
                  <dt className="text-[10px] text-slate-500 uppercase tracking-wider">Grid Type</dt>
                  <dd className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 uppercase truncate">
                    {station.gridInterconnectionType || 'Grid-Tied'}
                  </dd>
                </div>

                {(station.locationAddress || station.location || station.locationLat) && (
                  <div className="col-span-2 rounded-md bg-white dark:bg-slate-900/90 p-2 border border-slate-200 dark:border-slate-800/60 shadow-xs flex items-center justify-between">
                    <dt className="text-[10px] text-slate-500 uppercase tracking-wider">Location</dt>
                    <dd className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {station.locationAddress || station.location || `${station.locationLat}, ${station.locationLng}`}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
