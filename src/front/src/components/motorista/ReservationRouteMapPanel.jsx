import { useEffect, useMemo, useState } from 'react';
import { RouteMapPreview } from '../solicitante/RouteMapPreview';
import { fetchDrivingRoute } from '../../services/geocodingApi';
import { coordsFromReservation, resolveReservationCoords } from '../../utils/resolveReservationCoords';
import { hasReservationCoords } from '../../utils/motoristaReservaUtils';

export function ReservationRouteMapPanel({ className = '', compact = false, reserva }) {
  const fromApi = useMemo(() => coordsFromReservation(reserva), [reserva]);

  const [coords, setCoords] = useState({
    origem: fromApi.origemCoords,
    destino: fromApi.destinoCoords,
    ready: hasReservationCoords(reserva),
    loading: !hasReservationCoords(reserva),
    error: null,
  });

  const [routePositions, setRoutePositions] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    if (hasReservationCoords(reserva)) {
      setCoords({
        origem: fromApi.origemCoords,
        destino: fromApi.destinoCoords,
        ready: true,
        loading: false,
        error: null,
      });
      return undefined;
    }

    if (!reserva?.origem?.trim() || !reserva?.destino?.trim()) {
      setCoords({ origem: null, destino: null, ready: false, loading: false, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setCoords((current) => ({ ...current, loading: true, error: null }));

    resolveReservationCoords(
      {
        origem: reserva.origem,
        destino: reserva.destino,
        origemCoords: fromApi.origemCoords,
        destinoCoords: fromApi.destinoCoords,
      },
      { signal: controller.signal },
    )
      .then((resolved) => {
        if (resolved.origemCoords?.lat != null && resolved.destinoCoords?.lat != null) {
          setCoords({
            origem: resolved.origemCoords,
            destino: resolved.destinoCoords,
            ready: true,
            loading: false,
            error: null,
          });
        } else {
          setCoords({
            origem: null,
            destino: null,
            ready: false,
            loading: false,
            error: 'Não foi possível localizar o trajeto no mapa.',
          });
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setCoords({
          origem: null,
          destino: null,
          ready: false,
          loading: false,
          error: error.message || 'Não foi possível localizar o trajeto.',
        });
      });

    return () => controller.abort();
  }, [
    reserva?.destino,
    reserva?.destinoLat,
    reserva?.destinoLng,
    reserva?.idReserva,
    reserva?.origem,
    reserva?.origemLat,
    reserva?.origemLng,
    fromApi.destinoCoords,
    fromApi.origemCoords,
    reserva,
  ]);

  useEffect(() => {
    if (!coords.ready || coords.origem?.lat == null || coords.destino?.lat == null) {
      setRoutePositions([]);
      setRouteLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setRouteLoading(true);

    fetchDrivingRoute(coords.origem, coords.destino, { signal: controller.signal })
      .then((route) => setRoutePositions(route.positions || []))
      .catch(() => {
        setRoutePositions([
          [coords.origem.lat, coords.origem.lng],
          [coords.destino.lat, coords.destino.lng],
        ]);
      })
      .finally(() => setRouteLoading(false));

    return () => controller.abort();
  }, [coords.destino, coords.origem, coords.ready, reserva?.idReserva]);

  const mapLoading = coords.loading || routeLoading;
  const mapClassName = [
    'reservation-route-map-panel__map',
    compact ? 'reservation-route-map-panel__map--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="reservation-route-map-panel">
      {coords.ready ? (
        <RouteMapPreview
          className={mapClassName}
          destinoCoords={coords.destino}
          loading={mapLoading}
          origemCoords={coords.origem}
          routePositions={routePositions}
        />
      ) : (
        <div className={`${mapClassName} reservation-route-map-panel__placeholder`.trim()}>
          {coords.loading ? 'Traçando rota…' : coords.error || 'Trajeto indisponível no mapa'}
        </div>
      )}

      <div className="reservation-route-map-panel__points">
        <div>
          <span className="reservation-route-map-panel__dot reservation-route-map-panel__dot--origin" />
          <div>
            <span>Ponto A — Origem</span>
            <strong>{reserva?.origem || '—'}</strong>
          </div>
        </div>
        <div>
          <span className="reservation-route-map-panel__dot reservation-route-map-panel__dot--dest" />
          <div>
            <span>Ponto B — Destino</span>
            <strong>{reserva?.destino || '—'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
