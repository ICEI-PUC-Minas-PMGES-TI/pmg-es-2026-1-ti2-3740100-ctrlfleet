import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { formatKm } from '../../utils/registroUsoFormatters';
import { resolveRegistrosUsoForReserva } from '../../utils/mockRegistroUso';
import { ReservationCardThumbnail } from './ReservationCardThumbnail';

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ReservationCardGrid({ onApprove, onReject, registrosPorReserva = {}, reservas }) {
  if (!reservas.length) {
    return (
      <div className="reservation-grid-empty">
        <Icon name="reservations" />
        <p>Nenhuma reserva encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="reservation-grid">
      {reservas.map((reserva) => {
        const isPending = reserva.statusReserva === 'SOLICITADA';
        const isCompleted = reserva.statusReserva === 'CONCLUIDA';
        const registroUso = isCompleted
          ? resolveRegistrosUsoForReserva(reserva, registrosPorReserva[reserva.idReserva] || [])[0]
          : null;

        return (
          <article className="reservation-card" key={reserva.idReserva}>
            <ReservationCardThumbnail reserva={reserva} />

            <div className="reservation-card__body">
              <div className="reservation-card__headline">
                <h3 className="reservation-card__title">{reserva.modeloVeiculo}</h3>
              </div>

              <p className="reservation-card__requester">
                <Icon name="users" />
                <span>{reserva.nomeSolicitante}</span>
              </p>

              {registroUso ? (
                <div className="reservation-card__uso">
                  <div className="reservation-card__uso-head">
                    <Icon name="history" />
                    <strong>Registro de uso vinculado</strong>
                  </div>
                  <dl className="reservation-card__uso-meta">
                    <div>
                      <dt>Motorista</dt>
                      <dd>{registroUso.nomeMotorista || '—'}</dd>
                    </div>
                    <div>
                      <dt>KM percorridos</dt>
                      <dd>{formatKm(registroUso.quilometragemPercorrida)}</dd>
                    </div>
                    <div>
                      <dt>Saída</dt>
                      <dd>{formatDateTime(registroUso.dataSaida)}</dd>
                    </div>
                    <div>
                      <dt>Retorno</dt>
                      <dd>{formatDateTime(registroUso.dataRetorno)}</dd>
                    </div>
                  </dl>
                  {registroUso.observacoesVeiculo ? (
                    <p className="reservation-card__uso-obs">{registroUso.observacoesVeiculo}</p>
                  ) : null}
                </div>
              ) : null}

              <dl className="reservation-card__meta">
                <div>
                  <dt>Solicitação</dt>
                  <dd>{formatDateTime(reserva.dataHoraSolicitacao)}</dd>
                </div>
                <div>
                  <dt>Início previsto</dt>
                  <dd>{formatDateTime(reserva.dataHoraInicioPrevista)}</dd>
                </div>
                <div>
                  <dt>Fim estimado</dt>
                  <dd>{formatDateTime(reserva.dataHoraFimEstimada)}</dd>
                </div>
                <div>
                  <dt>Veículo</dt>
                  <dd>{reserva.placaVeiculo}</dd>
                </div>
              </dl>
            </div>

            <footer className="reservation-card__actions">
              <Link
                aria-label={`Ver histórico da reserva ${reserva.idReserva}`}
                className="reservation-card__action reservation-card__action--primary"
                to={`/gestor/reservas/${reserva.idReserva}/historico`}
              >
                <Icon name="history" />
                <span>{isCompleted ? 'Ver uso' : 'Histórico'}</span>
              </Link>

              {isPending ? (
                <>
                  <button
                    className="reservation-card__action reservation-card__action--success"
                    onClick={() => onApprove?.(reserva)}
                    type="button"
                  >
                    <Icon name="check" />
                    <span>Aprovar</span>
                  </button>
                  <button
                    className="reservation-card__action reservation-card__action--danger"
                    onClick={() => onReject?.(reserva)}
                    type="button"
                  >
                    <Icon name="close" />
                    <span>Reprovar</span>
                  </button>
                </>
              ) : (
                <span className="reservation-card__action reservation-card__action--muted" aria-hidden="true">
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
