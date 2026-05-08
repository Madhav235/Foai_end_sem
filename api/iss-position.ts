import { fetchWithTimeout, json, rateLimit } from './_security';

type WhereIssResponse = {
  latitude?: number;
  longitude?: number;
  timestamp?: number;
};

type OpenNotifyResponse = {
  timestamp?: number;
  iss_position?: {
    latitude?: string;
    longitude?: string;
  };
};

type IssPayload = {
  message: 'success';
  timestamp: number;
  iss_position: {
    latitude: string;
    longitude: string;
  };
};

const CACHE_TTL_MS = 12_000;
const STALE_TTL_MS = 5 * 60_000;
let cachedPosition: { savedAt: number; payload: IssPayload } | null = null;
let pendingFetch: Promise<IssPayload> | null = null;

function validNumber(value: unknown, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function toPayload(latitude: number, longitude: number, timestamp: number): IssPayload {
  if (!validNumber(latitude, -90, 90) || !validNumber(longitude, -180, 180) || !validNumber(timestamp, 0, Infinity)) {
    throw new Error('Malformed ISS response');
  }

  return {
    message: 'success',
    timestamp,
    iss_position: {
      latitude: String(latitude),
      longitude: String(longitude),
    },
  };
}

async function fetchWhereTheIss() {
  const response = await fetchWithTimeout('https://api.wheretheiss.at/v1/satellites/25544', {}, 6500);
  if (response.status === 429) throw new Error('ISS upstream rate limited');
  const data = (await response.json()) as WhereIssResponse;
  if (!response.ok) throw new Error('ISS upstream unavailable');
  return toPayload(Number(data.latitude), Number(data.longitude), Number(data.timestamp));
}

async function fetchOpenNotify() {
  const response = await fetchWithTimeout('http://api.open-notify.org/iss-now.json', {}, 6500);
  const data = (await response.json()) as OpenNotifyResponse;
  if (!response.ok) throw new Error('ISS fallback unavailable');
  return toPayload(
    Number(data.iss_position?.latitude),
    Number(data.iss_position?.longitude),
    Number(data.timestamp),
  );
}

async function fetchFreshPosition() {
  if (pendingFetch) return pendingFetch;

  pendingFetch = (async () => {
    let lastError: unknown;
    const sources = [fetchWhereTheIss, fetchOpenNotify];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      for (const source of sources) {
        try {
          return await source();
        } catch (error) {
          lastError = error;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 450 * 2 ** attempt));
    }

    throw lastError instanceof Error ? lastError : new Error('ISS sources unavailable');
  })().finally(() => {
    pendingFetch = null;
  });

  return pendingFetch;
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (rateLimit(request, 60, 60_000)) return json({ error: 'Too many requests' }, 429);

  const now = Date.now();
  if (cachedPosition && now - cachedPosition.savedAt < CACHE_TTL_MS) {
    return json(cachedPosition.payload, 200, { 'x-orbitdesk-cache': 'hit' });
  }

  try {
    const payload = await fetchFreshPosition();
    cachedPosition = { savedAt: Date.now(), payload };
    return json(payload, 200, { 'x-orbitdesk-cache': 'miss' });
  } catch {
    if (cachedPosition && now - cachedPosition.savedAt < STALE_TTL_MS) {
      return json(cachedPosition.payload, 200, { 'x-orbitdesk-cache': 'stale' });
    }

    return json({ error: 'ISS position temporarily unavailable' }, 503);
  }
}
