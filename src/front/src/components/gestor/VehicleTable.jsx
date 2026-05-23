import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentPills } from './DocumentPills';

export function VehicleTable({ onDeactivate, vehicles }) {
  return (
    <>
      <div className="table-wrapper">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>CNH</th>
              <th>Status</th>
              <th>Documentos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>
                  <span className="plate-chip">{vehicle.plate}</span>
                </td>
                <td>{vehicle.marca}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.licenseCategory}</td>
                <td>
                  <StatusBadge label={vehicle.status} />
                </td>
                <td>
                  <DocumentPills documents={vehicle.documents} />
                </td>
                <td>
                  <div className="table-actions">
                    <Link
                      aria-label={`Visualizar ${vehicle.model}`}
                      className="icon-button icon-button--label"
                      to={`/gestor/frota/${vehicle.id}`}
                    >
                      <Icon name="eye" />
                      <span>Visualizar</span>
                    </Link>
                    <Link
                      aria-label={`Editar ${vehicle.model}`}
                      className="icon-button icon-button--label"
                      to={`/gestor/frota/${vehicle.id}/editar`}
                    >
                      <Icon name="edit" />
                      <span>Editar</span>
                    </Link>
                    <button
                      aria-label={`Desativar ${vehicle.model}`}
                      className="icon-button icon-button--label"
                      disabled={vehicle.status === 'Inativo'}
                      onClick={() => onDeactivate?.(vehicle)}
                      type="button"
                    >
                      <Icon name="close" />
                      <span>Desativar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="vehicle-card-list">
        {vehicles.map((vehicle) => (
          <article className="vehicle-card" key={vehicle.id}>
            <div className="vehicle-card__header">
              <div>
                <span className="plate-chip">{vehicle.plate}</span>
                <h3>{vehicle.marca} {vehicle.model}</h3>
              </div>
              <StatusBadge label={vehicle.status} />
            </div>
            <dl className="vehicle-card__meta">
              <div>
                <dt>CNH</dt>
                <dd>{vehicle.licenseCategory}</dd>
              </div>
              <div>
                <dt>Documentos</dt>
                <dd>
                  <DocumentPills documents={vehicle.documents} />
                </dd>
              </div>
            </dl>
            <div className="table-actions">
              <Link className="icon-button icon-button--label" to={`/gestor/frota/${vehicle.id}`}>
                <Icon name="eye" />
                <span>Detalhes</span>
              </Link>
              <Link className="icon-button icon-button--label" to={`/gestor/frota/${vehicle.id}/editar`}>
                <Icon name="edit" />
                <span>Editar</span>
              </Link>
              <button
                className="icon-button icon-button--label"
                disabled={vehicle.status === 'Inativo'}
                onClick={() => onDeactivate?.(vehicle)}
                type="button"
              >
                <Icon name="close" />
                <span>Desativar</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
