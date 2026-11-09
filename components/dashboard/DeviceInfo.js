'use client';

import Skeleton from '../ui/Skeleton';
import Badge from '../ui/Badge';

export default function DeviceInfo({ devices, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm dark:shadow-md transition-colors duration-200">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasDevices = devices && devices.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm dark:shadow-md transition-colors duration-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Hardware Devices</h3>
        <span className="text-xs text-slate-500 font-mono">
          {devices ? `${devices.length} linked` : ''}
        </span>
      </div>

      {!hasDevices ? (
        <p className="text-xs text-slate-500 py-3">No devices linked to station</p>
      ) : (
        <>
          {/* Mobile view: Compact card list */}
          <div className="space-y-2.5 sm:hidden">
            {devices.map((device, index) => {
              const isOnline = device.connectStatus === 1 || device.connectStatus === 'online';
              const isInverter = device.deviceType?.toUpperCase() === 'INVERTER';
              return (
                <div
                  key={device.deviceSn || index}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{isInverter ? '⚡' : '📡'}</span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                        {device.deviceType || 'Device'}
                      </span>
                    </div>
                    <Badge status={isOnline ? 'online' : 'offline'} label={isOnline ? 'Online' : 'Offline'} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="text-slate-500">SN:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-300 font-medium">{device.deviceSn || '--'}</span>
                  </div>

                  {(device.deviceModel || device.productId) && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Model:</span>
                      <span className="text-slate-600 dark:text-slate-400 font-mono">{device.deviceModel || device.productId}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tablet & Desktop view: Clean data table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  <th className="pb-2.5 pr-3">Device</th>
                  <th className="pb-2.5 pr-3">Serial No.</th>
                  <th className="pb-2.5 pr-3">Model</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                {devices.map((device, index) => {
                  const isOnline = device.connectStatus === 1 || device.connectStatus === 'online';
                  const isInverter = device.deviceType?.toUpperCase() === 'INVERTER';
                  return (
                    <tr key={device.deviceSn || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 pr-3 font-medium text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                        <span>{isInverter ? '⚡' : '📡'}</span>
                        <span>{device.deviceType || '--'}</span>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-slate-700 dark:text-slate-300">{device.deviceSn || '--'}</td>
                      <td className="py-2.5 pr-3 font-mono text-slate-500 dark:text-slate-400">
                        {device.deviceModel || device.productId || '--'}
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge status={isOnline ? 'online' : 'offline'} label={isOnline ? 'Online' : 'Offline'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
