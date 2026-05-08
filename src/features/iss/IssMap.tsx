import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import { Satellite } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useDashboardStore } from '../../store/dashboardStore';

const issIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="iss-marker">
      <Satellite size={24} />
    </div>,
  ),
  className: '',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

export function IssMap() {
  const { current, history, currentSpeed, nearestLocation } = useDashboardStore((state) => state.iss);
  const center = current ? ([current.latitude, current.longitude] as [number, number]) : ([20, 0] as [number, number]);
  const path = useMemo(
    () => history.map((point) => [point.latitude, point.longitude] as [number, number]),
    [history],
  );

  return (
    <div className="map-frame">
      <MapContainer center={center} zoom={3} scrollWheelZoom className="h-full min-h-[470px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFollower center={center} />
        {path.length > 1 ? <Polyline positions={path} pathOptions={{ color: '#22d3ee', weight: 3 }} /> : null}
        {current ? (
          <Marker position={center} icon={issIcon}>
            <Tooltip direction="top" offset={[0, -16]} opacity={1}>
              <div className="text-xs">
                <strong>ISS</strong>
                <br />
                {nearestLocation}
                <br />
                {currentSpeed ? `${Math.round(currentSpeed).toLocaleString()} km/h` : 'Calculating speed'}
              </div>
            </Tooltip>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}

function MapFollower({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1.2 });
  }, [center, map]);

  return null;
}
