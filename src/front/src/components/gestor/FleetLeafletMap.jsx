import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { FLEET_GARAGE } from '../../services/fleetMapLocations';
import { createFleetCarIcon, createGarageIcon } from '../../utils/fleetMapIcons';

const DEFAULT_ZOOM = 13;
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function FitMapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    const bounds = points.map((point) => [point.lat, point.lng]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [map, points]);

  return null;
}

function vehiclesWithLocation(vehicles) {
  return vehicles.filter((vehicle) => vehicle.location?.lat != null && vehicle.location?.lng != null);
}

export function FleetLeafletMap({ onSelectVehicle, selectedVehicle, showGaragePin = true, vehicles = [] }) {
  const [mounted, setMounted] = useState(false);
  const located = useMemo(() => vehiclesWithLocation(vehicles), [vehicles]);

  const fitPoints = useMemo(() => {
    const points = showGaragePin ? [{ lat: FLEET_GARAGE.lat, lng: FLEET_GARAGE.lng }] : [];
    located.forEach((vehicle) => points.push(vehicle.location));
    return points;
  }, [located, showGaragePin]);

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

      <FitMapBounds points={fitPoints} />

      {showGaragePin ? (
        <Marker icon={createGarageIcon()} position={[FLEET_GARAGE.lat, FLEET_GARAGE.lng]}>
          <Popup>
            <strong>{FLEET_GARAGE.label}</strong>
            <p>Referência da garagem da frota.</p>
          </Popup>
        </Marker>
      ) : null}

      {located.map((vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;

        return (
          <Marker
            key={vehicle.id}
            eventHandlers={{
              click: () => onSelectVehicle?.(vehicle),
            }}
            icon={createFleetCarIcon({
              bearing: 0,
              isSelected,
              placeType: 'garage',
              plate: vehicle.plate,
              showPlate: true,
            })}
            position={[vehicle.location.lat, vehicle.location.lng]}
          />
        );
      })}
    </MapContainer>
  );
}
