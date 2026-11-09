import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function getEnv(name) {
  let value = process.env[name];

  if (!value) {
    // Dynamic fallback if running Next.js dev server has not reloaded .env.local
    try {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const fileContent = fs.readFileSync(envPath, 'utf8');
        for (const line of fileContent.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
          if (match && match[1] === name) {
            value = match[2];
            break;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
}

// ---------------------------------------------------------------------------
// Token cache (in-memory, per-process)
// ---------------------------------------------------------------------------

let tokenCache = {
  accessToken: null,
  expiresAt: 0,
  uid: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Hash a password with SHA-256 and return lowercase hex.
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * Authenticate against the Deye Cloud API and return an access token.
 * Caches the token in memory and re-authenticates automatically when the
 * token is within 60 seconds of expiry.
 *
 * @returns {Promise<string>} access token
 */
export async function getAccessToken() {
  const now = Date.now();

  // Return cached token if still valid (with 60 s buffer)
  if (tokenCache.accessToken && tokenCache.expiresAt - 60_000 > now) {
    return tokenCache.accessToken;
  }

  const baseUrl = getEnv('DEYE_BASE_URL');
  const appId = getEnv('DEYE_APP_ID');
  const appSecret = getEnv('DEYE_APP_SECRET');
  const email = getEnv('DEYE_EMAIL');
  const password = getEnv('DEYE_PASSWORD');

  const url = `${baseUrl}/v1.0/account/token?appId=${encodeURIComponent(appId)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appSecret,
      email,
      password: hashPassword(password),
    }),
  });

  if (!res.ok) {
    throw new Error(`Deye auth request failed with HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.success || data.code !== '1000000') {
    throw new Error(
      `Deye authentication failed: ${data.msg || 'unknown error'} (code ${data.code})`
    );
  }

  tokenCache = {
    accessToken: data.accessToken,
    expiresAt: now + data.expiresIn * 1000,
    uid: data.uid || null,
  };

  return tokenCache.accessToken;
}

/**
 * Get authentication status and metadata without exposing tokens.
 * @returns {Promise<{ authenticated: boolean, uid: string|number|null }>}
 */
export async function getAuthInfo() {
  await getAccessToken();
  return {
    authenticated: true,
    uid: tokenCache.uid,
  };
}

// ---------------------------------------------------------------------------
// Generic authenticated request
// ---------------------------------------------------------------------------

/**
 * Make an authenticated POST request to the Deye Cloud API.
 *
 * @param {string} endpoint  API path starting with /v1.0/
 * @param {object} body      Request body (will be JSON-stringified)
 * @returns {Promise<any>}   The `data` field from the response envelope
 */
export async function deyeApiRequest(endpoint, body = {}) {
  const baseUrl = getEnv('DEYE_BASE_URL');
  const appId = getEnv('DEYE_APP_ID');
  const accessToken = await getAccessToken();

  const url = `${baseUrl}${endpoint}?appId=${encodeURIComponent(appId)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(
      `Deye API request to ${endpoint} failed with HTTP ${res.status}`
    );
  }

  const json = await res.json();

  if (!json.success && json.code !== '1000000' && json.code !== '0') {
    throw new Error(
      `Deye API error on ${endpoint}: ${json.msg || 'unknown error'} (code ${json.code})`
    );
  }

  return json;
}

// ---------------------------------------------------------------------------
// Station endpoints
// ---------------------------------------------------------------------------

/**
 * Get a paginated list of stations.
 *
 * @param {number} [page=1]
 * @param {number} [size=50]
 * @returns {Promise<any[]>}
 */
export async function getStations(page = 1, size = 50) {
  const json = await deyeApiRequest('/v1.0/station/list', { page, size });
  return json.stationList || json.data?.stationList || json.data?.list || json.data || [];
}

/**
 * Get details for a specific station.
 *
 * @param {string|number} stationId
 * @returns {Promise<any>}
 */
export async function getStationDetail(stationId) {
  const id = parseInt(stationId, 10);
  const json = await deyeApiRequest('/v1.0/station/detail', { stationId: id });
  return json.station || json.data?.station || json.data || json;
}

/**
 * Get a paginated list of devices for a station.
 *
 * @param {string|number} stationId
 * @param {number} [page=1]
 * @param {number} [size=50]
 * @returns {Promise<any[]>}
 */
export async function getStationDevices(stationId, page = 1, size = 50) {
  const id = parseInt(stationId, 10);
  const json = await deyeApiRequest('/v1.0/station/device', { stationIds: [id], page, size });
  return json.deviceListItems || json.data?.deviceListItems || json.data?.list || json.data || [];
}

// ---------------------------------------------------------------------------
// Device endpoints
// ---------------------------------------------------------------------------

/**
 * Get the latest data for a list of devices.
 *
 * @param {string[]} deviceSnList  Array of device serial numbers (max 10)
 * @returns {Promise<any[]>}
 */
export async function getDeviceLatest(deviceSnList) {
  if (!Array.isArray(deviceSnList) || deviceSnList.length === 0) {
    throw new Error('deviceSnList must be a non-empty array');
  }
  if (deviceSnList.length > 10) {
    throw new Error('deviceSnList must contain at most 10 serial numbers');
  }
  const json = await deyeApiRequest('/v1.0/device/latest', { deviceList: deviceSnList });
  return json.deviceDataList || json.data?.deviceDataList || json.data || [];
}

/**
 * Get the available measure points for a device.
 *
 * @param {string} deviceSn
 * @returns {Promise<any[]>}
 */
export async function getDeviceMeasurePoints(deviceSn) {
  const json = await deyeApiRequest('/v1.0/device/measurePoints', { deviceSn });
  return json.measurePoints || json.data?.measurePoints || json.data || [];
}

/**
 * Get historical data for a device.
 *
 * @param {string}   deviceSn       Device serial number
 * @param {string}   startAt        Start date (e.g. "2026-01-01")
 * @param {string}   endAt          End date (e.g. "2026-01-31")
 * @param {number}   [granularity=1] 1=hourly/frame, 2=daily, 3=monthly, 4=yearly
 * @param {string[]} [measurePoints=[]] Array of measure point keys (only for granularity 1)
 * @returns {Promise<any[]>}
 */
export async function getDeviceHistory(
  deviceSn,
  startAt,
  endAt,
  granularity = 1,
  measurePoints = []
) {
  const gran = parseInt(granularity, 10) || 1;
  const payload = {
    deviceSn,
    startAt,
    endAt: endAt || startAt,
    granularity: gran,
  };
  // Deye requirement: if granularity != 1, measurePoints should be null/omitted
  if (gran === 1 && Array.isArray(measurePoints) && measurePoints.length > 0) {
    payload.measurePoints = measurePoints;
  }
  const json = await deyeApiRequest('/v1.0/device/history', payload);
  return json.dataList || json.data?.dataList || json.data || [];
}

