import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';

function formatDateTime(value) {
  const parsed = value ? new Date(String(value).replace(' ', 'T')) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FleetVehiclePopup({ onClose, vehicle }) {
  if (!vehicle) return null;

  const placeType = vehicle.mapContext?.placeType || 'garage';
  const isGarage = placeType === 'garage';
  const isDriving = placeType === 'driving';
  const reservation = vehicle.mapContext?.reservation;
  const simulation = vehicle.mapContext?.simulation;

  return (
    <div className="fleet-car-popup" role="dialog" aria-label={`Detalhes do veículo ${vehicle.plate}`}>
      <div className="fleet-car-popup__car" aria-hidden="true">
        <Icon name="fleet" />
      </div>

      <div className="fleet-car-popup__content">
        <div className="fleet-car-popup__header">
          <div>
            <strong className="fleet-car-popup__plate">{vehicle.plate}</strong>
            <p className="fleet-car-popup__model">{vehicle.model}</p>
          </div>
          <StatusBadge label={vehicle.status} />
        </div>

        <p
          className={`fleet-car-popup__place fleet-car-popup__place--${
            isDriving ? 'driving' : isGarage ? 'garage' : 'trip'
          }`}
        >
          {isDriving ? (
            <>
              <Icon name="fleet" />
              <span>{vehicle.mapContext?.label || 'Em rota agora'}</span>
            </>
          ) : isGarage ? (
            <>
              <Icon name="fleet" />
              <span>Na garagem — sem reserva no dia</span>
            </>
          ) : (
            <>
              <Icon name="reservations" />
              <span>{vehicle.mapContext?.label || 'No destino'}</span>
            </>
          )}
        </p>

        {simulation ? (
          <dl className="fleet-car-popup__meta">
            <div>
              <dt>Partida (sim.)</dt>
              <dd>
                {simulation.start.label} — {simulation.start.lat.toFixed(4)}, {simulation.start.lng.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt>Chegada (sim.)</dt>
              <dd>
                {simulation.end.label} — {simulation.end.lat.toFixed(4)}, {simulation.end.lng.toFixed(4)}
              </dd>
            </div>
            <div>
              <dt>Progresso</dt>
              <dd>{Math.round((simulation.progress || 0) * 100)}%</dd>
            </div>
          </dl>
        ) : null}

        {reservation ? (
          <dl className="fleet-car-popup__meta">
            <div>
              <dt>Reserva</dt>
              <dd>#{reservation.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{reservation.status}</dd>
            </div>
            <div>
              <dt>Motorista</dt>
              <dd>{reservation.motorista}</dd>
            </div>
            <div>
              <dt>Período</dt>
              <dd>
                {formatDateTime(reservation.inicio)} — {formatDateTime(reservation.fim)}
              </dd>
            </div>
          </dl>
        ) : !simulation ? (
          <p className="fleet-car-popup__hint">Veículo disponível na {vehicle.mapContext?.label || 'garagem'}.</p>
        ) : null}
      </div>

      {onClose ? (
        <button aria-label="Fechar detalhes" className="fleet-car-popup__close" onClick={onClose} type="button">
          <Icon name="close" />
        </button>
      ) : null}
    </div>
  );
}

