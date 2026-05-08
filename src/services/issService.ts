import type { Astronaut, IssPosition } from '../types/dashboard';
import { sanitizeAstronauts, sanitizeIssPosition } from '../utils/validation';
import { http, withRetry } from './http';

type OpenNotifyPositionResponse = {
  message: string;
  timestamp: number;
  iss_position: { latitude: string; longitude: string };
  velocity?: number;
};

type PeopleResponse = {
  people?: Astronaut[];
  number?: number;
};

export async function fetchIssPosition(signal?: AbortSignal): Promise<IssPosition> {
  return withRetry(async () => {
    const { data } = await http.get<OpenNotifyPositionResponse>('/api/iss-position', { signal });

    return sanitizeIssPosition({
      latitude: Number(data.iss_position.latitude),
      longitude: Number(data.iss_position.longitude),
      timestamp: data.timestamp,
      velocity: data.velocity,
    });
  });
}

export async function fetchAstronauts(signal?: AbortSignal): Promise<Astronaut[]> {
  return withRetry(async () => {
    const { data } = await http.get<PeopleResponse>('/api/astronauts', { signal });
    return sanitizeAstronauts(data.people).filter((person) => person.craft.toLowerCase().includes('iss'));
  });
}
