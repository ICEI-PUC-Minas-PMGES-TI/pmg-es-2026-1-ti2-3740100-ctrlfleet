import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';

export function FleetMapVehicleDetail({ onClose, vehicle }) {
  if (!vehicle) return null;

  return (
    <div className="fleet-map-detail">
      <div className="fleet-map-detail__header">
        <div className="fleet-map-detail__title">
          <span className="fleet-map-detail__plate">{vehicle.plate}</span>
          <StatusBadge label={vehicle.status} />
        </div>
        {onClose ? (
          <button aria-label="Fechar detalhes" className="fleet-map-detail__close" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        ) : null}
      </div>

      <p className="fleet-map-detail__model">{vehicle.model}</p>

      <div className="fleet-map-detail__status fleet-map-detail__status--garage">
        <Icon name="fleet" />
        <span>Na garagem</span>
      </div>

      <dl className="fleet-map-detail__meta">
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
