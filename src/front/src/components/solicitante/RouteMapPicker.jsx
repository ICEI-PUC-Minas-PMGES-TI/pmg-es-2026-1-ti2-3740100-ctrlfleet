import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { FLEET_GARAGE } from '../../services/fleetMapLocations';
import { createGarageIcon } from '../../utils/fleetMapIcons';
import { DESTINATION_MAP_ICON, ORIGIN_MAP_ICON } from '../../utils/routeMapIcons';

const DEFAULT_ZOOM = 13;
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const GARAGE_MAP_ICON = createGarageIcon();

function FitRouteBounds({ points }) {
  const map = useMap();
  const pointsKey = useMemo(
    () => points.map((point) => `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`).join('|'),
    [points],
  );

  useEffect(() => {
    if (!points.length) return;
    const bounds = points.map((point) => [point.lat, point.lng]);
    if (bounds.length === 1) {
      map.setView(bounds[0], DEFAULT_ZOOM);
      return;
    }
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15 });
  }, [map, pointsKey, points]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function resolveMapStatus(activePoint, geocodeStatus, routeStatus) {
  if (geocodeStatus?.origem === 'loading' || geocodeStatus?.destino === 'loading') {
    return 'Buscando endereço do ponto marcado…';
  }
  if (routeStatus === 'loading') return 'Calculando rota do trajeto…';
  if (geocodeStatus?.origem === 'error' || geocodeStatus?.destino === 'error') {
    return 'Não foi possível obter o endereço. Tente marcar outro ponto.';
  }
  if (routeStatus === 'error') return 'Rota não calculada; exibindo pontos A e B.';
  if (geocodeStatus?.origem === 'ok' && geocodeStatus?.destino === 'ok' && routeStatus === 'ok') {
    return 'Trajeto traçado entre origem e destino.';
  }
  if (activePoint === 'origem') {
    return 'Clique no mapa para marcar a origem (A).';
  }
  return 'Clique no mapa para marcar o destino (B).';
}

export function RouteMapPicker({
  activePoint = 'destino',
  className = '',
  destinoCoords,
  destinoLabel = '',
  geocodeStatus = {},
  onActivePointChange,
  onMapClick,
  origemCoords,
  origemLabel = '',
  routeMeta = null,
  routePositions = [],
  routeStatus = 'idle',
  showGaragePin = true,
}) {
  const [mounted, setMounted] = useState(false);

  const fitPoints = useMemo(() => {
    if (routePositions.length >= 2) {
      return routePositions.map(([lat, lng]) => ({ lat, lng }));
    }
    const points = [];
    if (origemCoords?.lat != null && origemCoords?.lng != null) points.push(origemCoords);
    if (destinoCoords?.lat != null && destinoCoords?.lng != null) points.push(destinoCoords);
    if (!points.length) points.push(FLEET_GARAGE);
    return points;
  }, [destinoCoords, origemCoords, routePositions]);

  const fallbackLine = useMemo(() => {
    if (
      origemCoords?.lat == null ||
      origemCoords?.lng == null ||
      destinoCoords?.lat == null ||
      destinoCoords?.lng == null
    ) {
      return [];
    }
    return [
      [origemCoords.lat, origemCoords.lng],
      [destinoCoords.lat, destinoCoords.lng],
    ];
  }, [destinoCoords, origemCoords]);

  const linePositions = routePositions.length >= 2 ? routePositions : fallbackLine;

  useEffect(() => {
    setMounted(true);
  }, []);

  const hint = resolveMapStatus(activePoint, geocodeStatus, routeStatus);

  if (!mounted) {
    return (
      <div className={`route-map-picker__canvas route-map-picker__canvas--loading ${className}`.trim()}>
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className={`route-map-picker ${className}`.trim()}>
      <div className="route-map-picker__toolbar">
        <div className="route-map-picker__point-tabs" role="tablist" aria-label="Ponto a marcar no mapa">
          <button
            aria-selected={activePoint === 'origem'}
            className={`route-map-picker__point-tab${activePoint === 'origem' ? ' route-map-picker__point-tab--active' : ''}`}
            onClick={() => onActivePointChange?.('origem')}
            role="tab"
            type="button"
          >
            Origem (A)
          </button>
          <button
            aria-selected={activePoint === 'destino'}
            className={`route-map-picker__point-tab${activePoint === 'destino' ? ' route-map-picker__point-tab--active' : ''}`}
            onClick={() => onActivePointChange?.('destino')}
            role="tab"
            type="button"
          >
            Destino (B)
          </button>
        </div>
        <p className="route-map-picker__click-hint">
          Marque <strong>{activePoint === 'origem' ? 'a origem' : 'o destino'}</strong> com um clique no mapa.
        </p>
      </div>

      <div className="route-map-picker__status">
        <p className="route-map-picker__hint">{hint}</p>
        {routeMeta?.distanceKm != null ? (
          <span className="route-map-picker__meta">
            ~{routeMeta.distanceKm.toFixed(1)} km
            {routeMeta.durationMin != null ? ` · ${routeMeta.durationMin} min` : ''}
          </span>
        ) : null}
      </div>

      <MapContainer
        center={[FLEET_GARAGE.lat, FLEET_GARAGE.lng]}
        className="route-map-picker__canvas route-map-picker__canvas--clickable"
        scrollWheelZoom
        zoom={DEFAULT_ZOOM}
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitRouteBounds points={fitPoints} />
        {onMapClick ? <MapClickHandler onMapClick={onMapClick} /> : null}

        {showGaragePin ? (
          <Marker icon={GARAGE_MAP_ICON} position={[FLEET_GARAGE.lat, FLEET_GARAGE.lng]}>
            <Popup>
              <strong>{FLEET_GARAGE.label}</strong>
              <p>Ponto de referência da frota</p>
            </Popup>
          </Marker>
        ) : null}

        {origemCoords?.lat != null && origemCoords?.lng != null ? (
          <Marker icon={ORIGIN_MAP_ICON} position={[origemCoords.lat, origemCoords.lng]}>
            <Popup>
              <strong>Origem (A)</strong>
              <p>{origemLabel || 'Origem'}</p>
            </Popup>
          </Marker>
        ) : null}

        {destinoCoords?.lat != null && destinoCoords?.lng != null ? (
          <Marker icon={DESTINATION_MAP_ICON} position={[destinoCoords.lat, destinoCoords.lng]}>
            <Popup>
              <strong>Destino (B)</strong>
              <p>{destinoLabel || 'Destino'}</p>
            </Popup>
          </Marker>
        ) : null}

        {linePositions.length >= 2 ? (
          <Polyline
            color="#2563eb"
            pathOptions={{ weight: 5, opacity: 0.85 }}
            positions={linePositions}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
