import type { IssPosition } from '../types/dashboard';

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: IssPosition, b: IssPosition) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function calculateSpeedKmh(previous: IssPosition, current: IssPosition) {
  const hours = Math.max((current.timestamp - previous.timestamp) / 3600, 1 / 3600);
  return haversineDistanceKm(previous, current) / hours;
}

export function nearestLocation(position: IssPosition | null) {
  if (!position) return 'Awaiting orbital fix';

  const { latitude, longitude } = position;
  const regions = [
    { name: 'North America', lat: 48, lon: -102 },
    { name: 'South America', lat: -15, lon: -60 },
    { name: 'Europe', lat: 54, lon: 15 },
    { name: 'Africa', lat: 3, lon: 20 },
    { name: 'Asia', lat: 34, lon: 100 },
    { name: 'Australia', lat: -25, lon: 134 },
    { name: 'Pacific Ocean', lat: 0, lon: -150 },
    { name: 'Atlantic Ocean', lat: 5, lon: -35 },
    { name: 'Indian Ocean', lat: -20, lon: 80 },
    { name: 'Southern Ocean', lat: -58, lon: 20 },
    { name: 'Arctic Ocean', lat: 75, lon: 0 },
  ];

  return regions
    .map((region) => ({
      name: region.name,
      distance: haversineDistanceKm(
        { latitude, longitude, timestamp: 0 },
        { latitude: region.lat, longitude: region.lon, timestamp: 0 },
      ),
    }))
    .sort((a, b) => a.distance - b.distance)[0].name;
}
