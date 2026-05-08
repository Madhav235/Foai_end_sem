import { fetchWithTimeout, json, rateLimit } from './_security';

type WhereIssResponse = {
  latitude?: number;
  longitude?: number;
  timestamp?: number;
};

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (rateLimit(request, 60, 60_000)) return json({ error: 'Too many requests' }, 429);

  try {
    const response = await fetchWithTimeout('https://api.wheretheiss.at/v1/satellites/25544');
    const data = (await response.json()) as WhereIssResponse;

    if (
      !response.ok ||
      typeof data.latitude !== 'number' ||
      typeof data.longitude !== 'number' ||
      typeof data.timestamp !== 'number'
    ) {
      return json({ error: 'Unable to fetch ISS position' }, 502);
    }

    return json({
      message: 'success',
      timestamp: data.timestamp,
      iss_position: {
        latitude: String(data.latitude),
        longitude: String(data.longitude),
      },
    });
  } catch {
    return json({ error: 'ISS position service timed out' }, 504);
  }
}
