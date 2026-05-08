import type { Astronaut, IssPosition } from '../types/dashboard';
import { sanitizeAstronauts, sanitizeIssPosition } from '../utils/validation';
import { http, withRetry } from './http';

type OpenNotifyPositionResponse = {
  message: string;
  timestamp: number;
  iss_position: { latitude: string; longitude: string };
};

type WhereIssResponse = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

type PeopleResponse = {
  people?: Astronaut[];
  number?: number;
};

export async function fetchIssPosition(signal?: AbortSignal): Promise<IssPosition> {
  return withRetry(async () => {
    try {
      const { data } = await http.get<WhereIssResponse>(
        'https://api.wheretheiss.at/v1/satellites/25544',
        { signal },
      );

      return sanitizeIssPosition({
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
      });
    } catch {
      const { data } = await http.get<OpenNotifyPositionResponse>(
        '/api/iss-position',
        { signal },
      );

      return sanitizeIssPosition({
        latitude: Number(data.iss_position.latitude),
        longitude: Number(data.iss_position.longitude),
        timestamp: data.timestamp,
      });
    }
  });
}

export async function fetchAstronauts(signal?: AbortSignal): Promise<Astronaut[]> {
  return withRetry(async () => {
    try {
      const { data } = await http.get<PeopleResponse>(
        'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json',
        { signal },
      );
      return sanitizeAstronauts(data.people).filter((person) => person.craft.toLowerCase().includes('iss'));
    } catch {
      const { data } = await http.get<PeopleResponse>('/api/astronauts', { signal });
      return sanitizeAstronauts(data.people).filter((person) => person.craft.toLowerCase().includes('iss'));
    }
  });
}
