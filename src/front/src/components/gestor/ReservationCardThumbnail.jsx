import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';

function statusMediaModifier(status) {
  return (status || 'SOLICITADA')
    .toLowerCase()
    .replace(/_/g, '-');
}

export function ReservationCardThumbnail({ reserva }) {
  const status = reserva?.statusReserva || 'SOLICITADA';

  return (
    <div className={`reservation-card__media reservation-card__media--${statusMediaModifier(status)}`}>
      <div className="reservation-card__media-top">
        <span className="reservation-card__id">#{reserva.idReserva}</span>
        <StatusBadge label={status} />
      </div>

      <div className="reservation-card__route" aria-label={`Trajeto de ${reserva.origem} para ${reserva.destino}`}>
        <div className="reservation-card__route-point">
          <span className="reservation-card__route-icon" aria-hidden="true">
            <Icon name="fleet" />
          </span>
          <div>
            <span className="reservation-card__route-label">Origem</span>
            <strong>{reserva.origem}</strong>
          </div>
        </div>

        <span className="reservation-card__route-line" aria-hidden="true" />

        <div className="reservation-card__route-point reservation-card__route-point--dest">
          <span className="reservation-card__route-icon reservation-card__route-icon--dest" aria-hidden="true">
            <Icon name="reservations" />
          </span>
          <div>
            <span className="reservation-card__route-label">Destino</span>
            <strong>{reserva.destino}</strong>
          </div>
        </div>
      </div>

      <span className="reservation-card__plate">{reserva.placaVeiculo}</span>
    </div>
  );
}
