'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/dashboard/Header';
import StatusCard from '../components/dashboard/StatusCard';
import PowerFlowDiagram from '../components/dashboard/PowerFlowDiagram';
import SolarChart from '../components/dashboard/SolarChart';
import DateFilter from '../components/dashboard/DateFilter';
import DeviceInfo from '../components/dashboard/DeviceInfo';
import StationInfo from '../components/dashboard/StationInfo';
import ErrorNotification from '../components/dashboard/ErrorNotification';

// Map frontend granularity string to Deye API integer
const GRANULARITY_MAP = {
  hourly: 1,
  daily: 2,
  monthly: 3,
  yearly: 4,
};

// Helper to safely parse numeric values from various Deye API metric formats
function findMetric(dataList, possibleKeys) {
  if (!dataList) return null;

  // Case 1: Array of { key, value, unit, name }
  if (Array.isArray(dataList)) {
    for (const key of possibleKeys) {
      const item = dataList.find(
        (d) =>
          d?.key?.toLowerCase() === key.toLowerCase() ||
          d?.dataKey?.toLowerCase() === key.toLowerCase()
      );
      if (item !== undefined && item?.value !== undefined && item?.value !== null && item?.value !== '') {
        const num = parseFloat(item.value);
        return isNaN(num) ? item.value : num;
      }
    }
  }

  // Case 2: Object key-value map
  if (typeof dataList === 'object') {
    for (const key of possibleKeys) {
      for (const objKey of Object.keys(dataList)) {
        if (objKey.toLowerCase() === key.toLowerCase()) {
          const val = dataList[objKey];
          if (val !== undefined && val !== null && val !== '') {
            const num = parseFloat(val);
            return isNaN(num) ? val : num;
          }
        }
      }
    }
  }

  return null;
}

// Pure helper to parse telemetry values from actual Deye API live payload
function parseTelemetry(liveData) {
  const rawList = liveData?.dataList || liveData;

  // 1. Current solar production (W)
  const solarPowerW = findMetric(rawList, [
    'TotalActiveACOutputPower',
    'ActivePower',
    'TotalActivePower',
    'generation_power',
    'generationPower',
    'active_power',
    'pvPower',
    'pv_power',
    'pPv',
    'pac',
    'totalPvPower',
  ]);

  // 2. Today's generation (kWh)
  const todayEnergyKwh = findMetric(rawList, [
    'DailyActiveProduction',
    'DailyProduction',
    'today_energy',
    'todayEnergy',
    'daily_energy',
    'dailyEnergy',
    'eToday',
    'etoday',
    'generationToday',
  ]);

  // 3. Lifetime generation (kWh)
  const totalEnergyKwh = findMetric(rawList, [
    'TotalActiveProduction',
    'TotalProduction',
    'total_energy',
    'totalEnergy',
    'lifetime_energy',
    'eTotal',
    'etotal',
    'generationTotal',
  ]);

  // 4. Home consumption power (W)
  const homePowerW = findMetric(rawList, [
    'TotalConsumptionPower',
    'ConsumptionPower',
    'consumption_power',
    'consumptionPower',
    'load_power',
    'loadPower',
    'home_power',
    'homePower',
    'familyPower',
    'pLoad',
    'pload',
  ]);

  // 5. Grid power (W)
  const gridPowerW = findMetric(rawList, [
    'TotalGridPower',
    'GridPower',
    'grid_power',
    'gridPower',
    'meter_power',
    'meterPower',
    'pGrid',
    'pgrid',
    'gridFeedInPower',
  ]);

  // 6. Battery SOC (%)
  const batterySOCVal = findMetric(rawList, [
    'battery_soc',
    'batterySoc',
    'batterySOC',
    'soc',
    'batteryPercent',
    'bSoc',
  ]);

  // 7. Battery power (W)
  const batteryPowerW = findMetric(rawList, [
    'battery_power',
    'batteryPower',
    'pBat',
    'pbat',
    'bPower',
    'batteryChargingPower',
  ]);

  // 8. Inverter status
  const statusVal = findMetric(rawList, [
    'GridStatus',
    'connect_status',
    'connectStatus',
    'operatingStatus',
    'status',
    'runStatus',
  ]);

  // Optional direct monthly metric
  const monthEnergyKwhLive = findMetric(rawList, [
    'MonthActiveProduction',
    'MonthlyProduction',
    'MonthlyActiveProduction',
    'monthEnergy',
    'monthly_energy',
    'eMonth',
    'emonth',
  ]);

  // Additional hardware info
  const acVoltage = findMetric(rawList, ['ACVoltageRUA', 'ABLineVoltage', 'ACLineVoltage']);
  const gridFreq = findMetric(rawList, ['ACOutputFrequencyR']);
  const temp = findMetric(rawList, ['DCACTemperature', 'HeatSinkTemperature', 'EnvironmentTemperature']);

  return {
    solarPowerW,
    solarPowerKw:
      typeof solarPowerW === 'number'
        ? (solarPowerW / 1000).toFixed(2)
        : null,
    todayEnergyKwh:
      typeof todayEnergyKwh === 'number'
        ? todayEnergyKwh.toFixed(1)
        : todayEnergyKwh !== null && todayEnergyKwh !== undefined
        ? String(todayEnergyKwh)
        : null,
    monthEnergyKwh:
      typeof monthEnergyKwhLive === 'number'
        ? monthEnergyKwhLive.toFixed(1)
        : monthEnergyKwhLive !== null && monthEnergyKwhLive !== undefined
        ? String(monthEnergyKwhLive)
        : null,
    totalEnergyKwh:
      typeof totalEnergyKwh === 'number'
        ? totalEnergyKwh.toFixed(1)
        : totalEnergyKwh !== null && totalEnergyKwh !== undefined
        ? String(totalEnergyKwh)
        : null,
    homePowerW,
    homePowerDisplay:
      typeof homePowerW === 'number'
        ? Math.abs(homePowerW) >= 1000
          ? `${(homePowerW / 1000).toFixed(2)} kW`
          : `${homePowerW} W`
        : null,
    gridPowerW,
    gridPowerDisplay:
      typeof gridPowerW === 'number'
        ? Math.abs(gridPowerW) >= 1000
          ? `${(gridPowerW / 1000).toFixed(2)} kW`
          : `${gridPowerW} W`
        : null,
    batterySOC: batterySOCVal,
    batteryPowerW,
    batteryPowerDisplay:
      typeof batteryPowerW === 'number'
        ? Math.abs(batteryPowerW) >= 1000
          ? `${(batteryPowerW / 1000).toFixed(2)} kW`
          : `${batteryPowerW} W`
        : null,
    inverterStatus:
      statusVal !== null && statusVal !== undefined
        ? String(statusVal)
        : liveData?.deviceState !== undefined
        ? 'Normal'
        : null,
    acVoltage,
    gridFreq,
    temp,
  };
}

export default function DashboardPage() {
  // Connection & refresh state
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected' | 'error'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Raw data from Deye APIs
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceSn, setSelectedDeviceSn] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  // Loading states
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingLive, setLoadingLive] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingMonthEnergy, setLoadingMonthEnergy] = useState(false);

  // Weather & Monthly Generation
  const [weather, setWeather] = useState(null);
  const [monthEnergyKwh, setMonthEnergyKwh] = useState(null);

  // Derived telemetry metrics
  const telemetry = useMemo(() => parseTelemetry(liveData), [liveData]);

  // Current calendar month label (e.g., "November 2026")
  const currentMonthLabel = useMemo(() => {
    const d = new Date();
    const monthName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return `${monthName} • Resets monthly`;
  }, []);

  // Display value for Current Month Generation (calculated sum of days or direct telemetry)
  const displayMonthEnergy = useMemo(() => {
    if (monthEnergyKwh !== null && monthEnergyKwh !== undefined) {
      return monthEnergyKwh;
    }
    if (telemetry.monthEnergyKwh !== null && telemetry.monthEnergyKwh !== undefined) {
      return telemetry.monthEnergyKwh;
    }
    return null;
  }, [monthEnergyKwh, telemetry.monthEnergyKwh]);

  // History filtering states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [granularity, setGranularity] = useState('hourly');

  // 1. Fetch stations on mount or manual refresh
  useEffect(() => {
    let active = true;

    async function fetchStations() {
      try {
        const authRes = await fetch('/api/deye/auth');
        const authJson = await authRes.json();

        if (!authRes.ok || !authJson.success) {
          throw new Error(
            authJson.error || 'Authentication with Deye Cloud OpenAPI failed. Check credentials in .env.local'
          );
        }

        const res = await fetch('/api/deye/stations');
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to retrieve stations from Deye');
        }

        if (active) {
          const stationList = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.data?.stationList)
            ? json.data.stationList
            : Array.isArray(json.data?.list)
            ? json.data.list
            : [];

          setStations(stationList);
          setConnectionStatus('connected');
          setLastUpdated(json.timestamp || new Date().toISOString());

          if (stationList.length > 0) {
            const firstId = stationList[0].id || stationList[0].stationId;
            setSelectedStationId((prev) => prev || firstId);
          }
          setLoadingStations(false);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load stations:', err);
          setConnectionStatus('error');
          setError(err.message);
          setLoadingStations(false);
        }
      }
    }

    fetchStations();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  // 2. Fetch devices when selected station changes
  useEffect(() => {
    if (!selectedStationId) return;
    let active = true;

    async function fetchDevices() {
      try {
        const res = await fetch(`/api/deye/devices?stationId=${encodeURIComponent(selectedStationId)}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to retrieve devices');
        }

        if (active) {
          const deviceList = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.data?.deviceListItems)
            ? json.data.deviceListItems
            : Array.isArray(json.data?.list)
            ? json.data.list
            : [];

          setDevices(deviceList);

          if (deviceList.length > 0) {
            // Prioritize INVERTER over datalogger COLLECTOR
            const inverter = deviceList.find((d) => d.deviceType?.toUpperCase() === 'INVERTER') || deviceList[0];
            const defaultSn = inverter.deviceSn || inverter.sn;
            setSelectedDeviceSn((prev) => (deviceList.some((d) => (d.deviceSn || d.sn) === prev) ? prev : defaultSn));
          } else {
            setSelectedDeviceSn(null);
          }
          setLoadingDevices(false);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load devices:', err);
          setError(err.message);
          setLoadingDevices(false);
        }
      }
    }

    fetchDevices();

    return () => {
      active = false;
    };
  }, [selectedStationId, refreshKey]);

  // 3. Fetch live telemetry, measure points, and history for selected device
  useEffect(() => {
    if (!selectedDeviceSn) return;
    let active = true;

    async function fetchTelemetryAndHistory() {
      try {
        // Fetch live readings
        const liveRes = await fetch(`/api/deye/live?deviceSn=${encodeURIComponent(selectedDeviceSn)}`);
        const liveJson = await liveRes.json();

        if (active && liveRes.ok && liveJson.success) {
          const raw = liveJson.data;
          const list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.deviceDataList)
            ? raw.deviceDataList
            : [raw];
          const match = list.find((item) => item?.deviceSn === selectedDeviceSn) || list[0];
          setLiveData(match);
          setLastUpdated(liveJson.timestamp || new Date().toISOString());
          setConnectionStatus('connected');
          setLoadingLive(false);
        }

        // Fetch measure points discovery
        const mpRes = await fetch(`/api/deye/measure-points?deviceSn=${encodeURIComponent(selectedDeviceSn)}`);
        const mpJson = await mpRes.json();
        if (active && mpRes.ok && mpJson.success) {
          const points = Array.isArray(mpJson.data)
            ? mpJson.data
            : Array.isArray(mpJson.data?.measurePoints)
            ? mpJson.data.measurePoints
            : [];
          setMeasurePoints(points);
        }

        // Fetch history data
        const todayStr = new Date().toISOString().split('T')[0];
        const effectiveStart = startDate || todayStr;
        const effectiveEnd = endDate || effectiveStart;
        const granCode = GRANULARITY_MAP[granularity] || 1;

        // For granularity 1, specify power & daily generation measure keys; for > 1, Deye requires null
        const measureKeys = granCode === 1 ? 'TotalActiveACOutputPower,DailyActiveProduction' : '';
        const histUrl = `/api/deye/history?deviceSn=${encodeURIComponent(selectedDeviceSn)}&startAt=${encodeURIComponent(effectiveStart)}&endAt=${encodeURIComponent(effectiveEnd)}&granularity=${granCode}${measureKeys ? `&measurePoints=${measureKeys}` : ''}`;

        const histRes = await fetch(histUrl);
        const histJson = await histRes.json();

        if (active) {
          if (histRes.ok && histJson.success) {
            let items = [];
            const raw = histJson.data;
            if (Array.isArray(raw)) {
              items = raw;
            } else if (Array.isArray(raw?.dataList)) {
              items = raw.dataList;
            }

            const formatted = items.map((point, idx) => {
              let val = 0;
              if (Array.isArray(point.itemList)) {
                // Find active power or production metric in item list
                const powerItem = point.itemList.find((it) =>
                  [
                    'totalactiveacoutputpower',
                    'production',
                    'dailyactiveproduction',
                    'activepower',
                    'generationpower',
                  ].includes(it.key?.toLowerCase())
                ) || point.itemList[0];
                val = parseFloat(powerItem?.value) || 0;
              } else if (point.value !== undefined) {
                val = parseFloat(point.value) || 0;
              }

              // Format time label for chart axis
              let timeLabel = point.time || point.date || `${idx}:00`;
              if (/^\d{10}$/.test(String(timeLabel))) {
                const d = new Date(parseInt(timeLabel, 10) * 1000);
                timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(timeLabel))) {
                timeLabel = timeLabel.slice(5); // e.g. "11-09"
              }

              return {
                time: timeLabel,
                value: Math.round(val * 100) / 100,
              };
            });
            setHistoryData(formatted);
          } else {
            setHistoryData([]);
          }
          setLoadingHistory(false);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load device data:', err);
          setError(err.message);
          setLoadingLive(false);
          setLoadingHistory(false);
        }
      }
    }

    fetchTelemetryAndHistory();

    return () => {
      active = false;
    };
  }, [selectedDeviceSn, startDate, endDate, granularity, refreshKey]);

  // Auto-refresh interval (30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 4. Fetch weather based on station coordinates
  useEffect(() => {
    let active = true;

    async function fetchWeather() {
      try {
        const selectedStation =
          stations.find((s) => String(s.id || s.stationId) === String(selectedStationId)) ||
          stations[0];

        const lat = selectedStation?.locationLat || selectedStation?.lat || '10.028079';
        const lng = selectedStation?.locationLng || selectedStation?.lng || '76.2260241';

        const res = await fetch(
          `/api/weather?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
        );
        const json = await res.json();

        if (active && res.ok && json.success) {
          setWeather(json.data);
        }
      } catch (err) {
        console.warn('Weather fetch notice:', err.message);
      } finally {
        if (active) setLoadingWeather(false);
      }
    }

    if (stations.length > 0) {
      fetchWeather();
    }

    return () => {
      active = false;
    };
  }, [stations, selectedStationId, refreshKey]);

  // 5. Fetch current month generation (resets on 1st of every month)
  useEffect(() => {
    if (!selectedDeviceSn) return;
    let active = true;

    async function fetchCurrentMonthGeneration() {
      setLoadingMonthEnergy(true);
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const monthStart = `${currentYear}-${currentMonth}-01`;
        const todayDateStr = `${currentYear}-${currentMonth}-${String(now.getDate()).padStart(2, '0')}`;

        // Deye history with daily granularity (2) from month start to today
        const res = await fetch(
          `/api/deye/history?deviceSn=${encodeURIComponent(
            selectedDeviceSn
          )}&startAt=${encodeURIComponent(monthStart)}&endAt=${encodeURIComponent(
            todayDateStr
          )}&granularity=2`
        );
        const json = await res.json();

        if (active && res.ok && json.success) {
          let items = [];
          const raw = json.data;
          if (Array.isArray(raw)) {
            items = raw;
          } else if (Array.isArray(raw?.dataList)) {
            items = raw.dataList;
          }

          let sum = 0;
          let hasToday = false;

          items.forEach((point) => {
            let val = 0;
            if (Array.isArray(point.itemList)) {
              const item =
                point.itemList.find((it) =>
                  [
                    'production',
                    'dailyactiveproduction',
                    'dailyproduction',
                    'generation',
                    'energy',
                    'dailyenergy',
                  ].includes(it.key?.toLowerCase())
                ) || point.itemList[0];
              val = parseFloat(item?.value) || 0;
            } else if (point.value !== undefined) {
              val = parseFloat(point.value) || 0;
            }

            const pointDate = point.date || point.time;
            if (pointDate && String(pointDate).startsWith(todayDateStr)) {
              hasToday = true;
              const liveToday = parseFloat(telemetry.todayEnergyKwh) || 0;
              val = Math.max(val, liveToday);
            }

            sum += val;
          });

          // If today's generation is not yet registered in daily history records, include today's live production
          if (!hasToday && telemetry.todayEnergyKwh) {
            sum += parseFloat(telemetry.todayEnergyKwh) || 0;
          }

          setMonthEnergyKwh(Math.round(sum * 10) / 10);
        }
      } catch (err) {
        console.warn('Failed to calculate current month generation:', err.message);
      } finally {
        if (active) setLoadingMonthEnergy(false);
      }
    }

    fetchCurrentMonthGeneration();

    return () => {
      active = false;
    };
  }, [selectedDeviceSn, telemetry.todayEnergyKwh, refreshKey]);

  // Manual refresh trigger
  const handleRefresh = useCallback(async () => {
    setError(null);
    setLoadingLive(true);
    setLoadingHistory(true);
    setLoadingWeather(true);
    setLoadingMonthEnergy(true);
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <Header
        connectionStatus={connectionStatus}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        autoRefresh={autoRefresh}
        onAutoRefreshToggle={() => setAutoRefresh((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Error notification banner */}
        {error && (
          <ErrorNotification
            error={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Station and Device Selectors */}
        {(stations.length > 0 || devices.length > 0) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 sm:p-4 shadow-sm transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
              {stations.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="station-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    Station:
                  </label>
                  <select
                    id="station-select"
                    value={selectedStationId || ''}
                    onChange={(e) => {
                      setSelectedStationId(e.target.value);
                      setLoadingDevices(true);
                    }}
                    className="w-full sm:w-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    {stations.map((s) => (
                      <option key={s.id || s.stationId} value={s.id || s.stationId}>
                        {s.name || `Station #${s.id}`} ({s.installedCapacity || 0} kW)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {devices.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="device-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    Device:
                  </label>
                  <select
                    id="device-select"
                    value={selectedDeviceSn || ''}
                    onChange={(e) => {
                      setSelectedDeviceSn(e.target.value);
                      setLoadingLive(true);
                      setLoadingHistory(true);
                    }}
                    className="w-full sm:w-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    {devices.map((d) => (
                      <option key={d.deviceSn || d.sn} value={d.deviceSn || d.sn}>
                        {d.deviceSn || d.sn} ({d.deviceType || 'Device'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Hardware Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2.5 md:border-0 md:pt-0">
              {telemetry.acVoltage && (
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/50">
                  <span className="text-slate-500">Grid:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{telemetry.acVoltage} V</strong>
                  {telemetry.gridFreq && <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">({telemetry.gridFreq} Hz)</span>}
                </span>
              )}
              {telemetry.temp && (
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/50">
                  <span className="text-slate-500">Inverter:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{telemetry.temp} °C</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Section 1: 8 Primary Metric Cards */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {/* 1. Current solar production */}
            <StatusCard
              icon="☀️"
              title="Solar Production"
              value={telemetry.solarPowerKw}
              unit="kW"
              subtitle={
                telemetry.solarPowerW !== null
                  ? `${telemetry.solarPowerW.toLocaleString()} W currently`
                  : null
              }
              loading={loadingLive || loadingStations}
              unavailable={telemetry.solarPowerKw === null}
            />

            {/* 2. Today's generation */}
            <StatusCard
              icon="⚡"
              title="Today's Generation"
              value={telemetry.todayEnergyKwh}
              unit="kWh"
              subtitle="Accumulated today"
              loading={loadingLive || loadingStations}
              unavailable={telemetry.todayEnergyKwh === null}
            />

            {/* 3. Current month generation (resets every month) */}
            <StatusCard
              icon="🗓️"
              title="Monthly Generation"
              value={displayMonthEnergy}
              unit="kWh"
              subtitle={currentMonthLabel}
              loading={loadingMonthEnergy || loadingStations}
              unavailable={displayMonthEnergy === null}
            />

            {/* 4. Total lifetime generation */}
            <StatusCard
              icon="🌍"
              title="Lifetime Generation"
              value={telemetry.totalEnergyKwh}
              unit="kWh"
              subtitle="All-time production"
              loading={loadingLive || loadingStations}
              unavailable={telemetry.totalEnergyKwh === null}
            />

            {/* 5. Home consumption */}
            <StatusCard
              icon="🏠"
              title="Home Consumption"
              value={telemetry.homePowerDisplay}
              subtitle="Active household load"
              loading={loadingLive || loadingStations}
              unavailable={telemetry.homePowerDisplay === null}
            />

            {/* 6. Grid import/export */}
            <StatusCard
              icon="🔌"
              title="Grid Power"
              value={telemetry.gridPowerDisplay}
              subtitle={
                typeof telemetry.gridPowerW === 'number'
                  ? telemetry.gridPowerW > 0
                    ? 'Exporting to grid'
                    : telemetry.gridPowerW < 0
                    ? 'Importing from grid'
                    : 'Balanced'
                  : null
              }
              loading={loadingLive || loadingStations}
              unavailable={telemetry.gridPowerDisplay === null}
            />

            {/* 7. Current Weather */}
            <StatusCard
              icon={weather?.icon || '🌤️'}
              title="Current Weather"
              value={
                weather?.temperature !== null && weather?.temperature !== undefined
                  ? weather.temperature
                  : telemetry.temp !== null
                  ? telemetry.temp
                  : null
              }
              unit="°C"
              subtitle={
                weather?.condition
                  ? `${weather.condition}${weather.humidity ? ` • ${weather.humidity}` : ''}${
                      weather.windSpeed ? ` • ${weather.windSpeed} km/h` : ''
                    }`
                  : telemetry.temp !== null
                  ? 'Inverter ambient temp'
                  : 'Weather conditions'
              }
              loading={loadingWeather || loadingStations}
              unavailable={weather?.temperature === null && telemetry.temp === null}
            />

            {/* 8. Inverter connectivity status */}
            <StatusCard
              icon="📡"
              title="Inverter Status"
              value={telemetry.inverterStatus}
              subtitle={selectedDeviceSn ? `SN: ${selectedDeviceSn}` : null}
              loading={loadingLive || loadingStations}
              unavailable={telemetry.inverterStatus === null}
            />
          </div>
        </section>

        {/* Section 2: Power Flow Diagram + Station/Device Details */}
        <section aria-label="Energy Flow and Telemetry" className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PowerFlowDiagram
              solarPower={telemetry.solarPowerW}
              homePower={telemetry.homePowerW}
              gridPower={telemetry.gridPowerW}
              batteryPower={telemetry.batteryPowerW}
              batterySOC={telemetry.batterySOC}
              loading={loadingLive || loadingStations}
            />
          </div>

          {/* Quick Station / Device Snapshot */}
          <div className="space-y-4 sm:space-y-6">
            <StationInfo
              stations={stations}
              loading={loadingStations}
            />
            <DeviceInfo
              devices={devices}
              loading={loadingDevices}
            />
          </div>
        </section>

        {/* Section 3: Charts & Historical Analytics */}
        <section aria-label="Historical Analytics" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Generation Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time & historical generation telemetry retrieved directly from Deye Cloud OpenAPI
              </p>
            </div>

            <DateFilter
              startDate={startDate}
              endDate={endDate}
              granularity={granularity}
              onStartDateChange={(val) => {
                setStartDate(val);
                setLoadingHistory(true);
              }}
              onEndDateChange={(val) => {
                setEndDate(val);
                setLoadingHistory(true);
              }}
              onGranularityChange={(val) => {
                setGranularity(val);
                setLoadingHistory(true);
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <SolarChart
              data={historyData}
              title={`Production Output (${granularity.toUpperCase()})`}
              dataKey="value"
              xAxisKey="time"
              loading={loadingHistory}
              chartType="area"
            />

            <SolarChart
              data={historyData}
              title={`Energy Yield Breakdown (${granularity.toUpperCase()})`}
              dataKey="value"
              xAxisKey="time"
              loading={loadingHistory}
              chartType="bar"
            />
          </div>
        </section>

        {/* Section 4: Measure Points Discovery */}
        {measurePoints.length > 0 && (
          <section aria-label="Hardware Measure Points" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-sm dark:shadow-lg transition-colors duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300">
                  Supported Measure Points
                </h3>
                <p className="text-xs text-slate-500">
                  Active telemetry keys discovered for inverter {selectedDeviceSn}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                {measurePoints.length} points
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
              {measurePoints.map((mp, idx) => {
                const pointName = typeof mp === 'string' ? mp : mp.name || mp.key || mp.dataKey;
                const pointKey = typeof mp === 'string' ? mp : mp.key || mp.dataKey;
                return (
                  <span
                    key={pointKey || idx}
                    className="rounded-md border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300"
                    title={pointName}
                  >
                    {pointName}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 transition-colors duration-200">
        <p>
          Deye Solar Monitor &bull; Direct connection to official Deye Cloud OpenAPI
        </p>
      </footer>
    </div>
  );
}
