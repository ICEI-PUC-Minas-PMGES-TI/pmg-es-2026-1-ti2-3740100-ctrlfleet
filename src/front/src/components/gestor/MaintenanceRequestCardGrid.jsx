import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { MaintenanceDateMeta } from '../maintenance/MaintenanceDateMeta';
import { MaintenanceStatusBadges } from '../maintenance/MaintenanceStatusBadges';
import { resolveManutencaoStatusVariant } from '../../utils/manutencaoMappers';

export function MaintenanceRequestCardGrid({ items, onApprove, onReject, onSetPriority }) {
  if (!items.length) {
    return (
      <div className="gestor-maintenance-grid-empty">
        <Icon name="maintenance" />
        <p>Nenhuma solicitação encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="gestor-maintenance-grid">
      {items.map((item) => {
        const isPending = item.status === 'PENDENTE';
        const variant = resolveManutencaoStatusVariant(item.status);

        return (
          <article
            className={`gestor-maintenance-card gestor-maintenance-card--${variant}${item.emergencia ? ' gestor-maintenance-card--emergency' : ''}${item.atrasada ? ' gestor-maintenance-card--overdue' : ''}`}
            key={item.id}
          >
            <header className="gestor-maintenance-card__header">
              <div>
                <span className="gestor-maintenance-card__eyebrow">
                  {item.emergencia ? 'Emergência' : item.tipoLabel}
                </span>
                <h3>
                  {item.placa} · {item.vehicleLabel}
                </h3>
              </div>
              <MaintenanceStatusBadges item={item} />
            </header>

            <p className="gestor-maintenance-card__description">{item.descricao}</p>

            <dl className="gestor-maintenance-card__meta">
              <div>
                <dt>Modelo</dt>
                <dd>{item.vehicleLabel}</dd>
              </div>
              <div>
                <dt>Motorista</dt>
                <dd>{item.nomeMotorista || '—'}</dd>
              </div>
              <MaintenanceDateMeta item={item} />
              <div>
                <dt>Quilometragem</dt>
                <dd>{item.quilometragemRegistroLabel}</dd>
              </div>
              {item.oficinaExecutor ? (
                <div>
                  <dt>Oficina</dt>
                  <dd>{item.oficinaExecutor}</dd>
                </div>
              ) : null}
            </dl>

            {item.prioridadeLabel ? (
              <p
                className={`gestor-maintenance-card__priority gestor-maintenance-card__priority--${item.prioridade?.toLowerCase()}`}
              >
                Prioridade {item.prioridadeLabel}
              </p>
            ) : null}

            <footer className="gestor-maintenance-card__actions">
              <Link
                className="gestor-maintenance-card__action gestor-maintenance-card__action--primary"
                to={`/gestor/frota/${item.idVeiculo}/historico`}
              >
                <Icon name="history" />
                <span>Prontuário</span>
              </Link>
              <Link
                className="gestor-maintenance-card__action"
                to={`/gestor/frota/${item.idVeiculo}`}
              >
                <Icon name="fleet" />
                <span>Veículo</span>
              </Link>

              {isPending ? (
                <>
                  <button
                    className="gestor-maintenance-card__action gestor-maintenance-card__action--primary"
                    onClick={() => onSetPriority?.(item)}
                    type="button"
                  >
                    <Icon name="alert" />
                    <span>Prioridade</span>
                  </button>
                  <button
                    className="gestor-maintenance-card__action gestor-maintenance-card__action--success"
                    onClick={() => onApprove?.(item)}
                    type="button"
                  >
                    <Icon name="check" />
                    <span>Aprovar</span>
                  </button>
                  <button
                    className="gestor-maintenance-card__action gestor-maintenance-card__action--danger"
                    onClick={() => onReject?.(item)}
                    type="button"
                  >
                    <Icon name="close" />
                    <span>Reprovar</span>
                  </button>
                </>
              ) : null}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
