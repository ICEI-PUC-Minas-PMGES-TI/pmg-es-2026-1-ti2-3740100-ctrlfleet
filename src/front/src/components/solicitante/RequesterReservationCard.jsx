import { useEffect, useState } from 'react';
import { fetchDrivingRoute } from '../../services/geocodingApi';
import { coordsFromReservation, resolveReservationCoords } from '../../utils/resolveReservationCoords';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { RouteMapPreview } from './RouteMapPreview';

export function RequesterReservationCard({ onCancel, onDelete, cancelingId, deletingId, reservation }) {
  const canCancel = reservation.statusKey === 'SOLICITADA';
  const canDelete = reservation.statusKey === 'CANCELADA';
  const hasTextRoute = Boolean(reservation.origem?.trim() && reservation.destino?.trim());

  const [coords, setCoords] = useState(() => {
    const fromApi = coordsFromReservation(reservation);
    return {
      origem: fromApi.origemCoords,
      destino: fromApi.destinoCoords,
      ready: Boolean(fromApi.origemCoords?.lat && fromApi.destinoCoords?.lat),
      loading: !fromApi.origemCoords?.lat || !fromApi.destinoCoords?.lat,
      error: null,
    };
  });

  const [routePositions, setRoutePositions] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    const fromApi = coordsFromReservation(reservation);
    if (fromApi.origemCoords?.lat && fromApi.destinoCoords?.lat) {
      setCoords({
        origem: fromApi.origemCoords,
        destino: fromApi.destinoCoords,
        ready: true,
        loading: false,
        error: null,
      });
      return undefined;
    }

    if (!hasTextRoute) {
      setCoords({ origem: null, destino: null, ready: false, loading: false, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setCoords((current) => ({ ...current, loading: true, error: null }));

    resolveReservationCoords(
      {
        origem: reservation.origem,
        destino: reservation.destino,
        origemCoords: fromApi.origemCoords,
        destinoCoords: fromApi.destinoCoords,
      },
      { signal: controller.signal },
    )
      .then((resolved) => {
        if (resolved.origemCoords?.lat && resolved.destinoCoords?.lat) {
          setCoords({
            origem: resolved.origemCoords,
            destino: resolved.destinoCoords,
            ready: true,
            loading: false,
            error: null,
          });
        } else {
          setCoords({ origem: null, destino: null, ready: false, loading: false, error: 'Trajeto indisponível' });
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
    hasTextRoute,
    reservation.destino,
    reservation.destinoLat,
    reservation.destinoLng,
    reservation.origem,
    reservation.origemLat,
    reservation.origemLng,
    reservation.rawId,
  ]);

  useEffect(() => {
    if (!coords.ready || !coords.origem?.lat || !coords.destino?.lat) {
      setRoutePositions([]);
      setRouteLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setRouteLoading(true);

    fetchDrivingRoute(coords.origem, coords.destino, { signal: controller.signal })
      .then((route) => setRoutePositions(route.positions))
      .catch(() => {
        setRoutePositions([
          [coords.origem.lat, coords.origem.lng],
          [coords.destino.lat, coords.destino.lng],
        ]);
      })
      .finally(() => setRouteLoading(false));

    return () => controller.abort();
  }, [coords.destino, coords.origem, coords.ready, reservation.rawId]);

  const showMap = coords.ready;
  const mapLoading = coords.loading || routeLoading;

  return (
    <article className="requester-reservation-card">
      <div className="requester-reservation-card__map">
        {showMap ? (
          <RouteMapPreview
            destinoCoords={coords.destino}
            loading={mapLoading}
            origemCoords={coords.origem}
            routePositions={routePositions}
          />
        ) : (
          <div className="requester-reservation-card__map-placeholder">
            <Icon name="reservations" />
            <span>{coords.loading ? 'Carregando trajeto…' : coords.error || 'Trajeto sem coordenadas'}</span>
          </div>
        )}
      </div>

      <div className="requester-reservation-card__body">
        <header className="requester-reservation-card__header">
          <div>
            <span className="requester-reservation-card__id">Reserva #{reservation.idReserva}</span>
            <h3>{reservation.destino}</h3>
            <p>{reservation.veiculo}</p>
          </div>
          <StatusBadge label={reservation.statusLabel} />
        </header>

        <div className="requester-reservation-card__route">
          <div className="requester-reservation-card__route-point">
            <span className="requester-reservation-card__route-dot requester-reservation-card__route-dot--origin" />
            <div>
              <span>Origem</span>
              <strong>{reservation.origem}</strong>
            </div>
          </div>
          <div className="requester-reservation-card__route-point">
            <span className="requester-reservation-card__route-dot requester-reservation-card__route-dot--dest" />
            <div>
              <span>Destino</span>
              <strong>{reservation.destino}</strong>
            </div>
          </div>
        </div>

        <dl className="requester-reservation-card__meta">
          <div>
            <dt>Solicitada em</dt>
            <dd>{reservation.dataHoraSolicitacao}</dd>
          </div>
          <div>
            <dt>Retirada prevista</dt>
            <dd>{reservation.dataHoraInicioPrevista}</dd>
          </div>
          <div>
            <dt>Devolução prevista</dt>
            <dd>{reservation.dataHoraFimEstimada}</dd>
          </div>
        </dl>

        {canCancel || canDelete ? (
          <div className="requester-reservation-card__actions">
            {canCancel ? (
              <button
                className="requester-reservation-card__cancel"
                disabled={cancelingId === reservation.rawId || deletingId === reservation.rawId}
                onClick={() => onCancel?.(reservation.rawId)}
                type="button"
              >
                {cancelingId === reservation.rawId ? 'Cancelando...' : 'Cancelar solicitação'}
              </button>
            ) : null}
            {canDelete ? (
              <button
                className="requester-reservation-card__delete"
                disabled={deletingId === reservation.rawId || cancelingId === reservation.rawId}
                onClick={() => onDelete?.(reservation.rawId)}
                type="button"
              >
                {deletingId === reservation.rawId ? 'Removendo...' : 'Excluir do histórico'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
