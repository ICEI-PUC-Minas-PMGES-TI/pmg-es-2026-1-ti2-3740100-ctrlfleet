import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import {
  canOpenChecklistSaida,
  formatDateTime,
  formatKm,
  getChecklistWindowMessage,
} from '../../utils/motoristaReservaUtils';
import { ReservationCardThumbnail } from '../gestor/ReservationCardThumbnail';

export function MotoristaReservationCardGrid({ motoristaId, reservas }) {
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
        const isEmUso = reserva.statusReserva === 'EM_USO';
        const isConcluida = reserva.statusReserva === 'CONCLUIDA';
        const checklistDone = Boolean(reserva.checklistSaidaConcluido);
        const canStart = canOpenChecklistSaida(reserva);
        const windowMessage = getChecklistWindowMessage(reserva);

        return (
          <article className="reservation-card" key={reserva.idReserva}>
            <ReservationCardThumbnail reserva={reserva} />

            <div className="reservation-card__body">
              <div className="reservation-card__headline">
                <h3 className="reservation-card__title">{reserva.modeloVeiculo}</h3>
              </div>

              <p className="reservation-card__requester">
                <Icon name="users" />
                <span>{reserva.nomeSolicitante || 'Solicitante não informado'}</span>
              </p>

              {checklistDone && !isEmUso && !isConcluida ? (
                <p className="reservation-card__window-hint reservation-card__window-hint--ok">
                  <Icon name="check" />
                  <span>Checklist de saída registrado — você pode iniciar a corrida quando quiser.</span>
                </p>
              ) : null}

              {windowMessage ? (
                <p className="reservation-card__window-hint">
                  <Icon name="alert" />
                  <span>{windowMessage}</span>
                </p>
              ) : null}

              <dl className="reservation-card__meta">
                <div>
                  <dt>Saída prevista</dt>
                  <dd>{formatDateTime(reserva.dataHoraInicioPrevista)}</dd>
                </div>
                <div>
                  <dt>Chegada prevista</dt>
                  <dd>{formatDateTime(reserva.dataHoraFimEstimada)}</dd>
                </div>
                <div>
                  <dt>Última KM</dt>
                  <dd>{formatKm(reserva.ultimaQuilometragemVeiculo)}</dd>
                </div>
                {checklistDone || isEmUso ? (
                  <div>
                    <dt>KM no checklist</dt>
                    <dd>{formatKm(reserva.quilometragemSaidaTrajeto)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <footer className="reservation-card__actions">
              <Link
                className="reservation-card__action reservation-card__action--primary"
                state={{ reserva }}
                to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}`}
              >
                <Icon name="reports" />
                <span>Ver detalhes</span>
              </Link>

              {isConcluida ? (
                <span className="reservation-card__action reservation-card__action--muted" aria-hidden="true">
                  <Icon name="history" />
                  <span>Encerrada</span>
                </span>
              ) : isEmUso ? (
                <Link
                  className="reservation-card__action reservation-card__action--success"
                  state={{ reserva }}
                  to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-retorno`}
                >
                  <Icon name="check" />
                  <span>Finalizar trajeto</span>
                </Link>
              ) : checklistDone ? (
                canStart ? (
                  <Link
                    className="reservation-card__action reservation-card__action--success"
                    state={{ reserva }}
                    to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/iniciar-corrida`}
                  >
                    <Icon name="fleet" />
                    <span>Iniciar corrida</span>
                  </Link>
                ) : (
                  <span className="reservation-card__action reservation-card__action--muted" aria-hidden="true">
                    <Icon name="fleet" />
                    <span>Aguardando janela</span>
                  </span>
                )
              ) : (
                <Link
                  className="reservation-card__action reservation-card__action--success"
                  state={{ reserva }}
                  to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-saida`}
                >
                  <Icon name="check" />
                  <span>Checklist de saída</span>
                </Link>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
