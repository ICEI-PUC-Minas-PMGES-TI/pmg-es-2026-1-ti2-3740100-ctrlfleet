import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { getAuthSession } from '../../services/authSession';
import {
  canOpenChecklistSaida,
  canStartTrip,
  formatDateTime,
  formatKm,
  formatStatusReserva,
  getChecklistStartWindow,
  getChecklistWindowMessage,
} from '../../utils/motoristaReservaUtils';

function statusHeaderModifier(status) {
  return (status || 'APROVADA').toLowerCase().replace(/_/g, '-');
}

function getSecondaryAction({ reserva, motoristaId, checklistDone, canFillChecklist }) {
  const base = `/motorista/${motoristaId}/reservas/${reserva.idReserva}`;
  const isEmUso = reserva.statusReserva === 'EM_USO';
  const isConcluida = reserva.statusReserva === 'CONCLUIDA';

  if (isConcluida) {
    return {
      type: 'link',
      icon: 'history',
      label: 'Ver histórico',
      to: `${base}/historico`,
      state: { reserva },
    };
  }

  if (isEmUso) {
    return {
      type: 'link',
      icon: 'fleet',
      label: 'Corrida em andamento',
      to: `${base}/corrida`,
      state: { reserva, tripStartedAt: Date.now() },
    };
  }

  if (checklistDone && canStartTrip(reserva)) {
    return {
      type: 'link',
      icon: 'fleet',
      label: 'Iniciar corrida',
      to: `${base}/iniciar-corrida`,
    };
  }

  if (canFillChecklist) {
    return {
      type: 'link',
      icon: 'check',
      label: 'Preencher checklist',
      to: `${base}/checklist-saida`,
    };
  }

  const windowStart = getChecklistStartWindow(reserva.dataHoraInicioPrevista);
  const label = windowStart
    ? `Saída a partir de ${formatDateTime(windowStart)}`
    : 'Saída a partir de...';
  return { type: 'muted', icon: 'calendar', label };
}

export function MotoristaReservationCardGrid({ motoristaId, reservas }) {
  const driverName = getAuthSession()?.nome || 'Motorista';

  if (!reservas.length) {
    return (
      <div className="motorista-viagens-empty">
        <Icon name="reservations" />
        <p>Nenhuma viagem encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="motorista-viagens-grid">
      {reservas.map((reserva, index) => {
        const isEmUso = reserva.statusReserva === 'EM_USO';
        const isConcluida = reserva.statusReserva === 'CONCLUIDA';
        const checklistDone = Boolean(reserva.checklistSaidaConcluido);
        const canFillChecklist = canOpenChecklistSaida(reserva);
        const windowMessage = isConcluida ? null : getChecklistWindowMessage(reserva);
        const kmSaida = reserva.quilometragemSaidaTrajeto;
        const kmRetorno = reserva.quilometragemRetornoTrajeto;
        const kmPercorrida =
          reserva.quilometragemPercorridaTrajeto ??
          (kmSaida != null && kmRetorno != null ? kmRetorno - kmSaida : null);
        const statusLabel = formatStatusReserva(reserva.statusReserva);
        const secondaryAction = getSecondaryAction({
          reserva,
          motoristaId,
          checklistDone,
          canFillChecklist,
        });

        return (
          <article className="motorista-viagem-card" key={reserva.idReserva}>
            <header
              className={`motorista-viagem-card__header motorista-viagem-card__header--${statusHeaderModifier(reserva.statusReserva)}`}
            >
              <span className="motorista-viagem-card__trip-label">VIAGEM {index + 1}</span>
              <StatusBadge label={statusLabel} />
            </header>

            <div className="motorista-viagem-card__body">
              <div
                aria-label={`Trajeto de ${reserva.origem} para ${reserva.destino}`}
                className="motorista-viagem-card__route"
              >
                <div className="motorista-viagem-card__route-point">
                  <span aria-hidden="true" className="motorista-viagem-card__route-badge motorista-viagem-card__route-badge--origem">
                    A
                  </span>
                  <div>
                    <span className="motorista-viagem-card__route-label">Origem</span>
                    <strong>{reserva.origem}</strong>
                  </div>
                </div>

                <div className="motorista-viagem-card__route-point">
                  <span aria-hidden="true" className="motorista-viagem-card__route-badge motorista-viagem-card__route-badge--destino">
                    B
                  </span>
                  <div>
                    <span className="motorista-viagem-card__route-label">Destino</span>
                    <strong>{reserva.destino}</strong>
                  </div>
                </div>
              </div>

              <div className="motorista-viagem-card__vehicle">
                <strong>{reserva.modeloVeiculo || 'Veículo não informado'}</strong>
                <span className="motorista-viagem-card__plate">{reserva.placaVeiculo || '—'}</span>
              </div>

              <p className="motorista-viagem-card__driver">
                <Icon name="users" />
                <span>{driverName}</span>
              </p>

              {checklistDone && !isEmUso && !isConcluida ? (
                <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
                  <Icon name="check" />
                  <span>Checklist de saída registrado — você pode iniciar a corrida quando quiser.</span>
                </div>
              ) : null}

              {windowMessage ? (
                <div className="motorista-viagem-card__alert">
                  <Icon name="alert" />
                  <span>{windowMessage}</span>
                </div>
              ) : null}

              <dl className="motorista-viagem-card__meta">
                <div>
                  <dt>Solicitante</dt>
                  <dd>{reserva.nomeSolicitante || '—'}</dd>
                </div>
                <div>
                  <dt>Saída prevista</dt>
                  <dd>{formatDateTime(reserva.dataHoraInicioPrevista)}</dd>
                </div>
                <div>
                  <dt>Chegada prevista</dt>
                  <dd>{formatDateTime(reserva.dataHoraFimEstimada)}</dd>
                </div>
                <div>
                  <dt>KM inicial (saída)</dt>
                  <dd>{formatKm(kmSaida)}</dd>
                </div>
                <div>
                  <dt>KM no checklist</dt>
                  <dd>{formatKm(kmSaida)}</dd>
                </div>
                <div>
                  <dt>KM final (retorno)</dt>
                  <dd>{formatKm(kmRetorno)}</dd>
                </div>
                <div>
                  <dt>KM percorrida</dt>
                  <dd>{formatKm(kmPercorrida)}</dd>
                </div>
              </dl>
            </div>

            <footer className="motorista-viagem-card__actions">
              <Link
                className="motorista-viagem-card__action motorista-viagem-card__action--primary"
                state={{ reserva }}
                to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}`}
              >
                Ver detalhes
              </Link>

              {secondaryAction.type === 'link' ? (
                <Link
                  className="motorista-viagem-card__action motorista-viagem-card__action--secondary"
                  state={secondaryAction.state ?? { reserva }}
                  to={secondaryAction.to}
                >
                  <Icon name={secondaryAction.icon} />
                  <span>{secondaryAction.label}</span>
                </Link>
              ) : (
                <span className="motorista-viagem-card__action motorista-viagem-card__action--muted">
                  <Icon name={secondaryAction.icon} />
                  <span>{secondaryAction.label}</span>
                </span>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
