import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { FLEET_GARAGE } from '../../services/fleetMapLocations';
import { DESTINATION_MAP_ICON, ORIGIN_MAP_ICON } from '../../utils/routeMapIcons';

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function FitPreviewBounds({ points }) {
  const map = useMap();
  const pointsKey = useMemo(
    () => points.map((point) => `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`).join('|'),
    [points],
  );

  useEffect(() => {
    if (!points.length) return;
    const bounds = points.map((point) => [point.lat, point.lng]);
    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
      return;
    }
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
  }, [map, points, pointsKey]);

  return null;
}

function positionsToFitPoints(routePositions, origemCoords, destinoCoords) {
  if (routePositions?.length >= 2) {
    return routePositions.map(([lat, lng]) => ({ lat, lng }));
  }
  const points = [];
  if (origemCoords?.lat != null && origemCoords?.lng != null) points.push(origemCoords);
  if (destinoCoords?.lat != null && destinoCoords?.lng != null) points.push(destinoCoords);
  return points.length ? points : [FLEET_GARAGE];
}

export function RouteMapPreview({
  className = '',
  destinoCoords,
  loading = false,
  origemCoords,
  routePositions = [],
}) {
  const [mounted, setMounted] = useState(false);

  const hasOrigin = origemCoords?.lat != null && origemCoords?.lng != null;
  const hasDest = destinoCoords?.lat != null && destinoCoords?.lng != null;

  const fitPoints = useMemo(
    () => positionsToFitPoints(routePositions, origemCoords, destinoCoords),
    [destinoCoords, origemCoords, routePositions],
  );

  const linePositions = useMemo(() => {
    if (routePositions.length >= 2) return routePositions;
    if (!hasOrigin || !hasDest) return [];
    return [
      [origemCoords.lat, origemCoords.lng],
      [destinoCoords.lat, destinoCoords.lng],
    ];
  }, [destinoCoords, hasDest, hasOrigin, origemCoords, routePositions]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className={`route-map-preview route-map-preview--loading ${className}`.trim()}>
        {loading ? 'Traçando rota…' : ''}
      </div>
    );
  }

  return (
    <MapContainer
      center={[FLEET_GARAGE.lat, FLEET_GARAGE.lng]}
      className={`route-map-preview ${className}`.trim()}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      zoom={14}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitPreviewBounds points={fitPoints} />
      {hasOrigin ? <Marker icon={ORIGIN_MAP_ICON} position={[origemCoords.lat, origemCoords.lng]} /> : null}
      {hasDest ? <Marker icon={DESTINATION_MAP_ICON} position={[destinoCoords.lat, destinoCoords.lng]} /> : null}
      {linePositions.length >= 2 ? (
        <Polyline color="#2563eb" pathOptions={{ weight: 4, opacity: 0.88 }} positions={linePositions} />
      ) : null}
    </MapContainer>
  );
}
