import { cleanText, fetchWithTimeout, json, rateLimit } from './_security';

type PeopleResponse = {
  people?: Array<{ name?: unknown; craft?: unknown }>;
};

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  if (rateLimit(request, 30, 60_000)) return json({ error: 'Too many requests' }, 429);

  try {
    const response = await fetchWithTimeout(
      'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json',
    );
    const data = (await response.json()) as PeopleResponse;

    if (!response.ok || !Array.isArray(data.people)) {
      return json({ error: 'Unable to fetch astronauts' }, 502);
    }

    return json({
      people: data.people.slice(0, 20).map((person) => ({
        name: cleanText(person.name, '', 80),
        craft: cleanText(person.craft, 'ISS', 40),
      })),
    });
  } catch {
    return json({ error: 'Astronaut service timed out' }, 504);
  }
}
