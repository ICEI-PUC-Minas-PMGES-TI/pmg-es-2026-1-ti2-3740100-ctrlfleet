import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { FLEET_GARAGE } from '../../services/fleetMapLocations';
import {
  DESTINATION_MAP_ICON_LABEL,
  ORIGIN_MAP_ICON_LABEL,
} from '../../utils/routeMapIcons';
import { positionAlongRoute, reverseRoutePositions } from '../../utils/routeSimulationUtils';

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function FollowVehicle({ position }) {
  const map = useMap();
  const key = position ? `${position.lat.toFixed(5)},${position.lng.toFixed(5)}` : '';

  useEffect(() => {
    if (!position) return;
    map.panTo([position.lat, position.lng], { animate: true, duration: 0.35 });
  }, [map, key, position]);

  return null;
}

function FitRouteOnce({ positions }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || !positions?.length) return;
    const bounds = positions.map(([lat, lng]) => [lat, lng]);
    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
    fitted.current = true;
  }, [map, positions]);

  return null;
}

function buildTraveledLine(positions, progress) {
  if (!positions.length || progress <= 0) return [];
  const pts = [];
  const steps = Math.max(2, Math.floor(positions.length * progress));
  for (let i = 0; i <= steps; i += 1) {
    const t = Math.min(1, (i / steps) * progress);
    const p = positionAlongRoute(positions, t);
    if (p) pts.push([p.lat, p.lng]);
  }
  return pts;
}

export function RouteSimulationMap({
  className = '',
  destinoCoords,
  loading = false,
  origemCoords,
  progress = 0,
  routePositions = [],
  tripLeg = 'outbound',
}) {
  const [mounted, setMounted] = useState(false);

  const returnPositions = useMemo(
    () => reverseRoutePositions(routePositions),
    [routePositions],
  );

  const activePositions = tripLeg === 'return' ? returnPositions : routePositions;

  const vehiclePosition = useMemo(
    () => positionAlongRoute(activePositions, progress),
    [activePositions, progress],
  );

  const outboundTraveled = useMemo(() => {
    if (tripLeg === 'outbound') {
      return buildTraveledLine(routePositions, progress);
    }
    return routePositions.length >= 2 ? routePositions : [];
  }, [progress, routePositions, tripLeg]);

  const returnTraveled = useMemo(() => {
    if (tripLeg !== 'return') return [];
    return buildTraveledLine(returnPositions, progress);
  }, [progress, returnPositions, tripLeg]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className={`route-simulation-map route-simulation-map--loading ${className}`.trim()}>
        {loading ? 'Carregando rota…' : ''}
      </div>
    );
  }

  const hasOrigin = origemCoords?.lat != null;
  const hasDest = destinoCoords?.lat != null;

  return (
    <MapContainer
      center={[FLEET_GARAGE.lat, FLEET_GARAGE.lng]}
      className={`route-simulation-map ${className}`.trim()}
      doubleClickZoom
      scrollWheelZoom
      zoom={14}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitRouteOnce positions={routePositions} />
      {routePositions.length >= 2 ? (
        <Polyline
          color="#94a3b8"
          pathOptions={{ weight: 5, opacity: 0.5 }}
          positions={routePositions}
        />
      ) : null}
      {outboundTraveled.length >= 2 ? (
        <Polyline color="#cf4e36" pathOptions={{ weight: 5, opacity: 0.92 }} positions={outboundTraveled} />
      ) : null}
      {returnTraveled.length >= 2 ? (
        <Polyline color="#2563eb" pathOptions={{ weight: 5, opacity: 0.88, dashArray: '8 6' }} positions={returnTraveled} />
      ) : null}
      {hasOrigin ? (
        <Marker icon={ORIGIN_MAP_ICON_LABEL} position={[origemCoords.lat, origemCoords.lng]} />
      ) : null}
      {hasDest ? (
        <Marker icon={DESTINATION_MAP_ICON_LABEL} position={[destinoCoords.lat, destinoCoords.lng]} />
      ) : null}
      {vehiclePosition ? <FollowVehicle position={vehiclePosition} /> : null}
    </MapContainer>
  );
}
