import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentPills } from './DocumentPills';
import { VehicleCardThumbnail } from './VehicleCardThumbnail';

export function VehicleCardGrid({ onDeactivate, readOnly = false, vehicles, viewTo }) {
  if (!vehicles.length) {
    return (
      <div className="fleet-vehicle-grid-empty">
        <Icon name="fleet" />
        <p>Nenhum veículo encontrado com os filtros atuais.</p>
      </div>
    );
  }

  function resolveViewPath(vehicle) {
    if (typeof viewTo === 'function') return viewTo(vehicle);
    if (viewTo) return viewTo.replace(':vehicleId', vehicle.id);
    return `/gestor/frota/${vehicle.id}`;
  }

  return (
    <div className="fleet-vehicle-grid">
      {vehicles.map((vehicle) => (
        <article className="fleet-vehicle-card" key={vehicle.id}>
          <VehicleCardThumbnail vehicle={vehicle} />

          <div className="fleet-vehicle-card__body">
            <div className="fleet-vehicle-card__headline">
              <span className="fleet-vehicle-card__plate">{vehicle.plate}</span>
              <StatusBadge label={vehicle.status} />
            </div>

            <h3 className="fleet-vehicle-card__title">
              {vehicle.marca} {vehicle.model}
            </h3>

            {readOnly && (vehicle.status === 'Manutenção' || vehicle.status === 'Inativo') ? (
              <div className="fleet-vehicle-card__alert">
                <Icon name="alert" />
                <span>
                  {vehicle.status === 'Manutenção'
                    ? 'Veículo em manutenção — consulte a frota antes de utilizar.'
                    : 'Veículo inativo — não disponível para uso.'}
                </span>
              </div>
            ) : null}

            {!readOnly && !vehicle.isDisponivel ? (
              <div className="fleet-vehicle-card__alert">
                <Icon name="alert" />
                <span>Veículo indisponível — {vehicle.availabilityLabel}</span>
              </div>
            ) : null}

            <dl className="fleet-vehicle-card__meta">
              <div>
                <dt>Tipo</dt>
                <dd>{vehicle.vehicleTypeLabel || '—'}</dd>
              </div>
              <div>
                <dt>Ano</dt>
                <dd>{vehicle.year || '—'}</dd>
              </div>
              <div>
                <dt>Categoria CNH</dt>
                <dd>{vehicle.licenseCategory || '—'}</dd>
              </div>
            </dl>

            <div className="fleet-vehicle-card__documents">
              <span className="fleet-vehicle-card__documents-label">Documentos</span>
              <DocumentPills documents={vehicle.documents} />
            </div>
          </div>

          <footer className="fleet-vehicle-card__actions">
            <Link
              aria-label={`Visualizar ${vehicle.plate}`}
              className={`fleet-vehicle-card__action fleet-vehicle-card__action--primary${readOnly ? ' fleet-vehicle-card__action--full' : ''}`}
              to={resolveViewPath(vehicle)}
            >
              <Icon name="eye" />
              <span>Visualizar</span>
            </Link>
            {!readOnly ? (
              <>
                <Link
                  aria-label={`Editar ${vehicle.plate}`}
                  className="fleet-vehicle-card__action"
                  to={`/gestor/frota/${vehicle.id}/editar`}
                >
                  <Icon name="edit" />
                  <span>Editar</span>
                </Link>
                <button
                  aria-label={`Desativar ${vehicle.plate}`}
                  className="fleet-vehicle-card__action fleet-vehicle-card__action--danger"
                  disabled={vehicle.status === 'Inativo'}
                  onClick={() => onDeactivate?.(vehicle)}
                  type="button"
                >
                  <Icon name="close" />
                  <span>Desativar</span>
                </button>
              </>
            ) : null}
          </footer>
        </article>
      ))}
    </div>
  );
}
