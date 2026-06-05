import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { StatusBadge } from '../common/StatusBadge';
import { formatKm } from '../../utils/registroUsoFormatters';
import { resolveRegistrosUsoForReserva } from '../../utils/mockRegistroUso';
import {
  formatDateTime,
  formatStatusReserva,
} from '../../utils/motoristaReservaUtils';

function statusHeaderModifier(status) {
  return (status || 'SOLICITADA').toLowerCase().replace(/_/g, '-');
}

export function ReservationCardGrid({ onApprove, onReject, registrosPorReserva = {}, reservas }) {
  if (!reservas.length) {
    return (
      <div className="motorista-viagens-empty">
        <Icon name="reservations" />
        <p>Nenhuma reserva encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="motorista-viagens-grid">
      {reservas.map((reserva) => {
        const isPending = reserva.statusReserva === 'SOLICITADA';
        const isCompleted = reserva.statusReserva === 'CONCLUIDA';
        const registroUso = isCompleted
          ? resolveRegistrosUsoForReserva(reserva, registrosPorReserva[reserva.idReserva] || [])[0]
          : null;

        const kmSaida =
          registroUso?.quilometragemSaida ??
          reserva.quilometragemSaidaTrajeto;
        const kmRetorno =
          registroUso?.quilometragemRetorno ??
          reserva.quilometragemRetornoTrajeto;
        const kmPercorrida =
          registroUso?.quilometragemPercorrida ??
          reserva.quilometragemPercorridaTrajeto ??
          (kmSaida != null && kmRetorno != null ? kmRetorno - kmSaida : null);

        const statusLabel = formatStatusReserva(reserva.statusReserva);
        const actionsClassName = isPending
          ? 'motorista-viagem-card__actions motorista-viagem-card__actions--gestor-pending'
          : 'motorista-viagem-card__actions';

        return (
          <article className="motorista-viagem-card" key={reserva.idReserva}>
            <header
              className={`motorista-viagem-card__header motorista-viagem-card__header--${statusHeaderModifier(reserva.statusReserva)}`}
            >
              <span className="motorista-viagem-card__trip-label">
                RESERVA #{reserva.idReserva}
              </span>
              <StatusBadge label={statusLabel} />
            </header>

            <div className="motorista-viagem-card__body">
              <div
                aria-label={`Trajeto de ${reserva.origem} para ${reserva.destino}`}
                className="motorista-viagem-card__route"
              >
                <div className="motorista-viagem-card__route-point">
                  <span
                    aria-hidden="true"
                    className="motorista-viagem-card__route-badge motorista-viagem-card__route-badge--origem"
                  >
                    A
                  </span>
                  <div>
                    <span className="motorista-viagem-card__route-label">Origem</span>
                    <strong>{reserva.origem}</strong>
                  </div>
                </div>

                <div className="motorista-viagem-card__route-point">
                  <span
                    aria-hidden="true"
                    className="motorista-viagem-card__route-badge motorista-viagem-card__route-badge--destino"
                  >
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
                <span>{reserva.nomeSolicitante || '—'}</span>
              </p>

              {isPending ? (
                <div className="motorista-viagem-card__alert">
                  <Icon name="alert" />
                  <span>Aguardando sua aprovação ou reprovação.</span>
                </div>
              ) : null}

              {registroUso?.nomeMotorista ? (
                <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
                  <Icon name="check" />
                  <span>Motorista: {registroUso.nomeMotorista}</span>
                </div>
              ) : null}

              <dl className="motorista-viagem-card__meta">
                <div>
                  <dt>Solicitação</dt>
                  <dd>{formatDateTime(reserva.dataHoraSolicitacao)}</dd>
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
                  <dt>KM final (retorno)</dt>
                  <dd>{formatKm(kmRetorno)}</dd>
                </div>
                <div>
                  <dt>KM percorrida</dt>
                  <dd>{formatKm(kmPercorrida)}</dd>
                </div>
              </dl>
            </div>

            <footer className={actionsClassName}>
              <Link
                className="motorista-viagem-card__action motorista-viagem-card__action--primary"
                to={`/gestor/reservas/${reserva.idReserva}/historico`}
              >
                {isCompleted ? 'Ver uso' : 'Ver histórico'}
              </Link>

              {isPending ? (
                <>
                  <button
                    className="motorista-viagem-card__action motorista-viagem-card__action--secondary"
                    onClick={() => onApprove?.(reserva)}
                    type="button"
                  >
                    <Icon name="check" />
                    <span>Aprovar</span>
                  </button>
                  <button
                    className="motorista-viagem-card__action motorista-viagem-card__action--danger"
                    onClick={() => onReject?.(reserva)}
                    type="button"
                  >
                    <Icon name="close" />
                    <span>Reprovar</span>
                  </button>
                </>
              ) : (
                <span className="motorista-viagem-card__action motorista-viagem-card__action--muted">
                  <Icon name="reservations" />
                  <span>{isCompleted ? 'Encerrada' : 'Decidida'}</span>
                </span>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
