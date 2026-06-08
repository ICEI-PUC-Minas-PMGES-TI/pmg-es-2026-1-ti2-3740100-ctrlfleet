import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { MaintenanceDateMeta } from '../maintenance/MaintenanceDateMeta';
import { MaintenanceStatusBadges } from '../maintenance/MaintenanceStatusBadges';
import { resolveManutencaoStatusVariant } from '../../utils/manutencaoMappers';

function MaintenanceCard({ badge, children, highlight = false, title }) {
  return (
    <article className={`maintenance-card${highlight ? ' maintenance-card--highlight' : ''}`}>
      <header className="maintenance-card__header">
        <div>
          <span className="maintenance-card__eyebrow">{badge}</span>
          <h3>{title}</h3>
        </div>
      </header>
      {children}
    </article>
  );
}

export function PreventiveMaintenanceList({ items, vehiclePathBase }) {
  if (!items.length) return null;

  return (
    <section aria-label="Preventivas próximas" className="maintenance-section">
      <div className="maintenance-section__header">
        <div>
          <span className="maintenance-section__eyebrow">Programação</span>
          <h2>Preventivas próximas</h2>
          <p>Revisões agendadas, atrasadas ou com quilometragem prevista quase atingida.</p>
        </div>
        <span className="maintenance-section__count">{items.length}</span>
      </div>
      <div className="maintenance-card-grid">
        {items.map((item) => (
          <MaintenanceCard
            badge={item.atrasada ? 'Preventiva atrasada' : item.tipoLabel}
            highlight
            key={`preventiva-${item.id}`}
            title={`${item.placa} · ${item.vehicleLabel}`}
          >
            {vehiclePathBase ? (
              <Link className="maintenance-card__vehicle-link" to={`${vehiclePathBase}/${item.idVeiculo}`}>
                Acessar veiculo
              </Link>
            ) : null}
            <p className="maintenance-card__description">{item.descricao}</p>
            <dl className="maintenance-card__meta">
              <MaintenanceDateMeta item={item} />
              <div>
                <dt>Quilometragem alvo</dt>
                <dd>{item.quilometragemRegistroLabel}</dd>
              </div>
              <div>
                <dt>Atual</dt>
                <dd>{item.quilometragemAtualLabel}</dd>
              </div>
            </dl>
            <p className={`maintenance-card__proximity${item.atrasada ? ' maintenance-card__proximity--overdue' : ''}`}>
              <Icon name="preventive" />
              <span>{item.proximidadeLabel}</span>
            </p>
            <MaintenanceStatusBadges item={item} />
          </MaintenanceCard>
        ))}
      </div>
    </section>
  );
}

export function PreventiveAlertList({ items }) {
  if (!items.length) return null;

  return (
    <section aria-label="Alertas preventivos" className="maintenance-section">
      <div className="maintenance-section__header">
        <div>
          <span className="maintenance-section__eyebrow">Alertas</span>
          <h2>Avisos de revisão</h2>
          <p>Indicadores automáticos de manutenção preventiva para sua frota.</p>
        </div>
      </div>
      <div className="maintenance-alert-list">
        {items.map((item) => (
          <article className="maintenance-alert" key={`alerta-${item.id}`}>
            <span className={`maintenance-alert__priority maintenance-alert__priority--${item.prioridade?.toLowerCase()}`}>
              {item.prioridadeLabel}
            </span>
            <div>
              <strong>{item.placa}</strong>
              <p>{item.mensagem}</p>
              <span className="maintenance-alert__date">{item.dataGeracaoLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MaintenanceRequestList({ emptyMessage, items, title, vehiclePathBase, variant = 'default' }) {
  return (
    <section aria-label={title} className="maintenance-section">
      <div className="maintenance-section__header">
        <div>
          <h2>{title}</h2>
        </div>
        {items.length ? <span className="maintenance-section__count">{items.length}</span> : null}
      </div>
      {items.length ? (
        <div className="maintenance-card-grid">
          {items.map((item) => (
            <MaintenanceCard
              badge={item.emergencia ? 'Emergência' : item.tipoLabel}
              highlight={variant === 'pending'}
              key={`${variant}-${item.id}`}
              title={`${item.placa} · ${item.vehicleLabel}`}
            >
              {vehiclePathBase ? (
                <Link className="maintenance-card__vehicle-link" to={`${vehiclePathBase}/${item.idVeiculo}`}>
                  Acessar veiculo
                </Link>
              ) : null}
              <p className="maintenance-card__description">{item.descricao}</p>
              <dl className="maintenance-card__meta">
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
              <div className="maintenance-card__footer">
                <MaintenanceStatusBadges item={item} />
                {item.prioridadeLabel ? (
                  <span className={`maintenance-card__priority maintenance-card__priority--${item.prioridade?.toLowerCase()}`}>
                    Prioridade {item.prioridadeLabel}
                  </span>
                ) : null}
              </div>
            </MaintenanceCard>
          ))}
        </div>
      ) : (
        <div className="maintenance-empty-inline">
          <Icon name={variant === 'history' ? 'reports' : 'maintenance'} />
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

export function MaintenanceQuickActions({ motoristaId }) {
  return (
    <section aria-label="Ações de manutenção" className="maintenance-quick-actions">
      <div>
        <span className="maintenance-section__eyebrow">Emergência</span>
        <h2>Precisa de ajuda imediata?</h2>
        <p>Registre uma falha crítica para acionar o gestor de frota o quanto antes.</p>
      </div>
      <Link className="action-button action-button--danger action-button--with-icon" to={`/motorista/${motoristaId}/manutencao/solicitar`}>
        <Icon className="action-button__icon" name="alert" />
        <span>Solicitar manutenção de emergência</span>
      </Link>
    </section>
  );
}

export function MaintenanceStatusPill({ status, statusLabel }) {
  return (
    <span className={`maintenance-status-pill maintenance-status-pill--${resolveManutencaoStatusVariant(status)}`}>
      {statusLabel}
    </span>
  );
}
