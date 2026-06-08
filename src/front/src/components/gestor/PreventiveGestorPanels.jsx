import { Link } from 'react-router-dom';
import { ActionButton } from '../common/ActionButton';
import { Icon } from '../common/Icon';
import { MaintenanceDateMeta } from '../maintenance/MaintenanceDateMeta';
import { MaintenanceStatusBadges } from '../maintenance/MaintenanceStatusBadges';
import { PreventiveAlertList, PreventiveMaintenanceList } from '../motorista/MaintenancePanels';

function EmptyState({ icon = 'preventive', message }) {
  return (
    <div className="gestor-preventiva-empty">
      <Icon name={icon} />
      <p>{message}</p>
    </div>
  );
}

export function PreventiveGestorUpcomingSection({ items }) {
  if (!items.length) {
    return (
      <section aria-label="Preventivas próximas" className="maintenance-section">
        <div className="maintenance-section__header">
          <div>
            <span className="maintenance-section__eyebrow">Prioridade</span>
            <h2>Preventivas próximas ou atrasadas</h2>
            <p>Revisões com data ou quilometragem prevista nos próximos 45 dias.</p>
          </div>
        </div>
        <EmptyState message="Nenhuma preventiva próxima no momento." />
      </section>
    );
  }

  return <PreventiveMaintenanceList items={items} />;
}

export function StoppedVehiclesSection({ items }) {
  return (
    <section aria-label="Veículos parados para revisão" className="maintenance-section">
      <div className="maintenance-section__header">
        <div>
          <span className="maintenance-section__eyebrow">Indisponíveis</span>
          <h2>Veículos parados para revisão</h2>
          <p>Unidades com status de manutenção e indisponíveis para reservas.</p>
        </div>
        {items.length ? <span className="maintenance-section__count">{items.length}</span> : null}
      </div>

      {items.length ? (
        <div className="gestor-preventiva-stopped-grid">
          {items.map((item) => (
            <article className="gestor-preventiva-stopped-card" key={`parado-${item.idVeiculo}`}>
              <header className="gestor-preventiva-stopped-card__header">
                <div>
                  <span className="gestor-preventiva-stopped-card__eyebrow">{item.statusVeiculoLabel}</span>
                  <h3>
                    {item.placa} · {item.vehicleLabel}
                  </h3>
                </div>
                <span className="gestor-preventiva-stopped-card__days">{item.diasParadoLabel}</span>
              </header>

              <p className="gestor-preventiva-stopped-card__reason">
                <Icon name="maintenance" />
                <span>{item.motivoParada}</span>
              </p>

              <dl className="gestor-preventiva-stopped-card__meta">
                <div>
                  <dt>Motorista</dt>
                  <dd>{item.nomeMotorista}</dd>
                </div>
                {item.manutencao ? (
                  <>
                    <div>
                      <dt>Manutenção</dt>
                      <dd>#{item.manutencao.id} · {item.manutencao.tipoLabel}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{item.manutencao.statusLabel}</dd>
                    </div>
                    {item.manutencao.proximidadeLabel ? (
                      <div>
                        <dt>Prazo</dt>
                        <dd>{item.manutencao.proximidadeLabel}</dd>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </dl>

              <footer className="gestor-preventiva-stopped-card__actions">
                <Link className="gestor-preventiva-stopped-card__link" to={`/gestor/frota/${item.idVeiculo}`}>
                  <Icon name="fleet" />
                  <span>Ver veículo</span>
                </Link>
                <Link
                  className="gestor-preventiva-stopped-card__link"
                  to={`/gestor/frota/${item.idVeiculo}/historico`}
                >
                  <Icon name="history" />
                  <span>Prontuário</span>
                </Link>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon="fleet" message="Nenhum veículo parado para revisão no momento." />
      )}
    </section>
  );
}

function MaintenanceActionCard({ item, onStart, onFinish, submittingId }) {
  const isSubmitting = submittingId === item.id;

  return (
    <article
      className={`gestor-preventiva-action-card${item.atrasada ? ' gestor-preventiva-action-card--overdue' : ''}`}
      key={`action-${item.id}`}
    >
      <header className="gestor-preventiva-action-card__header">
        <div>
          <span className="gestor-preventiva-action-card__eyebrow">{item.tipoLabel}</span>
          <h3>
            {item.placa} · {item.vehicleLabel}
          </h3>
        </div>
        <MaintenanceStatusBadges item={item} />
      </header>

      <p className="gestor-preventiva-action-card__description">{item.descricao}</p>

      <dl className="gestor-preventiva-action-card__meta">
        <MaintenanceDateMeta item={item} />
        <div>
          <dt>Quilometragem alvo</dt>
          <dd>{item.quilometragemRegistroLabel}</dd>
        </div>
        <div>
          <dt>Atual</dt>
          <dd>{item.quilometragemAtualLabel}</dd>
        </div>
        <div>
          <dt>Motorista</dt>
          <dd>{item.nomeMotorista || '—'}</dd>
        </div>
      </dl>

      {item.proximidadeLabel ? (
        <p className={`maintenance-card__proximity${item.atrasada ? ' maintenance-card__proximity--overdue' : ''}`}>
          <Icon name="preventive" />
          <span>{item.proximidadeLabel}</span>
        </p>
      ) : null}

      <footer className="gestor-preventiva-action-card__actions">
        {item.status === 'AGENDADA' ? (
          <ActionButton
            disabled={isSubmitting}
            icon="fleet"
            onClick={() => onStart(item)}
            variant="primary"
          >
            {isSubmitting ? 'Iniciando...' : 'Iniciar revisão'}
          </ActionButton>
        ) : null}
        {item.status === 'EM_ANDAMENTO' ? (
          <ActionButton
            disabled={isSubmitting}
            icon="check"
            onClick={() => onFinish(item)}
            variant="primary"
          >
            {isSubmitting ? 'Concluindo...' : 'Concluir manutenção'}
          </ActionButton>
        ) : null}
        <Link className="gestor-preventiva-action-card__link" to={`/gestor/frota/${item.idVeiculo}/historico`}>
          <Icon name="history" />
          <span>Prontuário</span>
        </Link>
      </footer>
    </article>
  );
}

export function ScheduledPreventiveSection({ items, onStart, submittingId }) {
  return (
    <section aria-label="Preventivas agendadas" className="maintenance-section">
      <div className="maintenance-section__header">
        <div>
          <span className="maintenance-section__eyebrow">Calendário</span>
          <h2>Todas as preventivas agendadas</h2>
          <p>Programação completa da frota com prazos por data e quilometragem.</p>
        </div>
        {items.length ? <span className="maintenance-section__count">{items.length}</span> : null}
      </div>

      {items.length ? (
        <div className="gestor-preventiva-action-grid">
          {items.map((item) => (
            <MaintenanceActionCard
              item={item}
              key={`agendada-${item.id}`}
              onFinish={null}
              onStart={onStart}
              submittingId={submittingId}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="Nenhuma preventiva agendada na frota." />
      )}
    </section>
  );
}

export function InProgressMaintenanceSection({ items, onFinish, submittingId }) {
  return (
    <section aria-label="Manutenções em andamento" className="maintenance-section">
      <div className="maintenance-section__header">
        <div>
          <span className="maintenance-section__eyebrow">Oficina</span>
          <h2>Manutenções em andamento</h2>
          <p>Serviços já iniciados e aguardando conclusão para liberar o veículo.</p>
        </div>
        {items.length ? <span className="maintenance-section__count">{items.length}</span> : null}
      </div>

      {items.length ? (
        <div className="gestor-preventiva-action-grid">
          {items.map((item) => (
            <MaintenanceActionCard
              item={item}
              key={`andamento-${item.id}`}
              onFinish={onFinish}
              onStart={null}
              submittingId={submittingId}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon="maintenance" message="Nenhuma manutenção em andamento." />
      )}
    </section>
  );
}

export function PreventiveAlertsSection({ items }) {
  if (!items.length) {
    return (
      <section aria-label="Alertas preventivos" className="maintenance-section">
        <div className="maintenance-section__header">
          <div>
            <span className="maintenance-section__eyebrow">Alertas</span>
            <h2>Avisos de revisão</h2>
            <p>Indicadores automáticos de manutenção preventiva para a frota.</p>
          </div>
        </div>
        <EmptyState icon="alert" message="Nenhum alerta preventivo pendente." />
      </section>
    );
  }

  return <PreventiveAlertList items={items} />;
}
