import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { FLEET_GARAGE } from '../../services/fleetMapLocations';
import { createFleetCarIcon, createGarageIcon } from '../../utils/fleetMapIcons';
import { positionAlongRoute } from '../../utils/routeSimulationUtils';
import { FleetVehiclePopup } from './FleetVehiclePopup';

const DEFAULT_ZOOM = 13;
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const GARAGE_ICON = createGarageIcon();

function FitMapBoundsOnce({ points }) {
  const map = useMap();
  const fittedKeyRef = useRef('');
  const pointsKey = useMemo(
    () => points.map((point) => `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`).join('|'),
    [points],
  );

  useEffect(() => {
    if (!points.length || fittedKeyRef.current === pointsKey) return;
    const bounds = points.map((point) => [point.lat, point.lng]);
    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
    fittedKeyRef.current = pointsKey;
  }, [map, points, pointsKey]);

  return null;
}

function ActiveTripRoute({ trip }) {
  const traveledLine = useMemo(() => {
    const positions = trip.routePositions;
    const progress = trip.progress ?? 0;
    if (!positions?.length || progress <= 0) return [];

    const pts = [];
    const steps = Math.max(2, Math.floor(positions.length * progress));
    for (let i = 0; i <= steps; i += 1) {
      const t = Math.min(1, (i / steps) * progress);
      const p = positionAlongRoute(positions, t);
      if (p) pts.push([p.lat, p.lng]);
    }
    return pts;
  }, [trip.progress, trip.routePositions]);

  if (!trip.routePositions?.length) return null;

  return (
    <>
      <Polyline
        color="#94a3b8"
        pathOptions={{ weight: 4, opacity: 0.45 }}
        positions={trip.routePositions}
      />
      {traveledLine.length >= 2 ? (
        <Polyline color="#cf4e36" pathOptions={{ weight: 5, opacity: 0.9 }} positions={traveledLine} />
      ) : null}
    </>
  );
}

function FleetVehicleMarker({ isSelected, onSelect, vehicle }) {
  const map = useMap();
  const placeType = vehicle.mapContext?.placeType || 'garage';
  const lat = vehicle.location.lat;
  const lng = vehicle.location.lng;

  const icon = useMemo(
    () =>
      createFleetCarIcon({
        bearing: vehicle.routeBearing ?? 0,
        isSelected,
        placeType,
        plate: vehicle.plate,
        showPlate: true,
      }),
    [isSelected, placeType, vehicle.plate, vehicle.routeBearing],
  );

  const markerRef = useRef(null);
  const isDriving = placeType === 'driving';

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([lat, lng]);
    if (isDriving) {
      map.panTo([lat, lng], { animate: true, duration: 0.35 });
    }
  }, [isDriving, lat, lng, map]);

  return (
    <Marker
      ref={markerRef}
      eventHandlers={{
        click: () => onSelect?.(vehicle),
      }}
      icon={icon}
      position={[lat, lng]}
      zIndexOffset={isDriving ? 500 : 0}
    >
      {isDriving ? (
        <Popup className="fleet-map-popup" maxWidth={320} minWidth={240}>
          <FleetVehiclePopup vehicle={vehicle} />
        </Popup>
      ) : null}
    </Marker>
  );
}

function vehiclesWithLocation(vehicles) {
  return vehicles.filter((vehicle) => vehicle.location?.lat != null && vehicle.location?.lng != null);
}

export function FleetLeafletMap({
  activeTrips = [],
  onSelectVehicle,
  selectedVehicle,
  showGaragePin = true,
  vehicles = [],
}) {
  const [mounted, setMounted] = useState(false);
  const located = useMemo(() => vehiclesWithLocation(vehicles), [vehicles]);

  const fitPoints = useMemo(() => {
    const points = showGaragePin ? [{ lat: FLEET_GARAGE.lat, lng: FLEET_GARAGE.lng }] : [];
    located.forEach((vehicle) => {
      if (vehicle.mapContext?.placeType !== 'driving') {
        points.push(vehicle.location);
      }
    });
    activeTrips.forEach((trip) => {
      trip.routePositions?.forEach(([routeLat, routeLng]) => points.push({ lat: routeLat, lng: routeLng }));
      if (trip.origemCoords?.lat != null) points.push(trip.origemCoords);
      if (trip.destinoCoords?.lat != null) points.push(trip.destinoCoords);
    });
    return points;
  }, [activeTrips, located, showGaragePin]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fleet-map-canvas fleet-map-canvas--loading">Carregando mapa...</div>;
  }

  return (
    <MapContainer
      center={[FLEET_GARAGE.lat, FLEET_GARAGE.lng]}
      className="fleet-map-canvas"
      scrollWheelZoom
      zoom={DEFAULT_ZOOM}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FitMapBoundsOnce points={fitPoints} />

      {showGaragePin ? (
        <Marker icon={GARAGE_ICON} position={[FLEET_GARAGE.lat, FLEET_GARAGE.lng]} zIndexOffset={1000}>
          <Popup>
            <strong>{FLEET_GARAGE.label}</strong>
            <p>Referência da garagem da frota.</p>
          </Popup>
        </Marker>
      ) : null}

      {activeTrips.map((trip) => (
        <ActiveTripRoute key={`route-${trip.reservaId}`} trip={trip} />
      ))}

      {located.map((vehicle) => (
        <FleetVehicleMarker
          key={vehicle.id}
          isSelected={selectedVehicle?.id === vehicle.id}
          onSelect={onSelectVehicle}
          vehicle={vehicle}
        />
      ))}
    </MapContainer>
  );
}
