import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';

export function FleetMapVehicleDetail({ onClose, vehicle }) {
  if (!vehicle) return null;

  const placeType = vehicle.mapContext?.placeType || 'garage';
  const isDriving = placeType === 'driving';
  const simulation = vehicle.mapContext?.simulation;

  return (
    <div className="fleet-map-detail">
      <div className="fleet-map-detail__header">
        <div className="fleet-map-detail__title">
          <span className="fleet-map-detail__plate">{vehicle.plate}</span>
          <StatusBadge label={isDriving ? 'Em rota' : vehicle.status} />
        </div>
        {onClose ? (
          <button aria-label="Fechar detalhes" className="fleet-map-detail__close" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        ) : null}
      </div>

      <p className="fleet-map-detail__model">{vehicle.model}</p>

      <div
        className={`fleet-map-detail__status fleet-map-detail__status--${isDriving ? 'driving' : 'garage'}`}
      >
        <Icon name={isDriving ? 'fleet' : 'fleet'} />
        <span>{vehicle.mapContext?.label || 'Na garagem'}</span>
      </div>

      {simulation ? (
        <dl className="fleet-map-detail__meta">
          <div>
            <dt>Progresso</dt>
            <dd>{Math.round((simulation.progress || 0) * 100)}%</dd>
          </div>
          <div>
            <dt>Origem</dt>
            <dd>{simulation.start?.label || '—'}</dd>
          </div>
          <div>
            <dt>Destino</dt>
            <dd>{simulation.end?.label || '—'}</dd>
          </div>
        </dl>
      ) : null}

      <dl className="fleet-map-detail__meta">
        <div>
          <dt>Tipo</dt>
          <dd>{vehicle.vehicleTypeLabel || '—'}</dd>
        </div>
        <div>
          <dt>Marca</dt>
          <dd>{vehicle.marca || '—'}</dd>
        </div>
        <div>
          <dt>Ano</dt>
          <dd>{vehicle.year || '—'}</dd>
        </div>
        <div>
          <dt>Categoria CNH</dt>
          <dd>{vehicle.licenseCategory || '—'}</dd>
        </div>
        {vehicle.location ? (
          <div>
            <dt>Coordenadas</dt>
            <dd>
              {vehicle.location.lat.toFixed(5)}, {vehicle.location.lng.toFixed(5)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
