import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ReservationRouteMapPanel } from '../../../components/motorista/ReservationRouteMapPanel';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { useMotoristaViagemNumber } from '../../../hooks/useMotoristaViagemNumbers';
import {
  buscarReservaMotorista,
  listarReservasAprovadas,
  listarReservasEmUso,
} from '../../../services/motoristaApi';
import {
  canOpenChecklistSaida,
  canStartTrip,
  formatDateTime,
  formatStatusReserva,
  getChecklistWindowMessage,
} from '../../../utils/motoristaReservaUtils';
import { formatViagemLabel } from '../../../utils/userReservaNumbers';
import { resolveVehicleImageUrl } from '../../../utils/vehicleImage';
import { isCorridaFinalizada, loadTripSummary } from '../../../utils/tripSummaryStorage';

function normalizeReserva(reserva) {
  return {
    ...reserva,
    statusReserva: reserva.statusReserva || reserva.status,
  };
}

export function MotoristaReservaDetalhePage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();
  const viagemNumber = useMotoristaViagemNumber(motoristaId, reservaId);

  const [reserva, setReserva] = useState(() =>
    location.state?.reserva ? normalizeReserva(location.state.reserva) : null,
  );
  const [loading, setLoading] = useState(!location.state?.reserva);
  const [error, setError] = useState(null);

  const loadReserva = useCallback(async () => {
    if (!motoristaId || !reservaId) return;

    setLoading(true);
    setError(null);

    try {
      const detail = await buscarReservaMotorista(motoristaId, reservaId);
      if (detail) {
        setReserva(normalizeReserva(detail));
        return;
      }

      const [aprovadas, emUso] = await Promise.all([
        listarReservasAprovadas(motoristaId),
        listarReservasEmUso(motoristaId),
      ]);
      const found = [...(emUso || []), ...(aprovadas || [])].find(
        (item) => String(item.idReserva) === String(reservaId),
      );

      if (found) {
        setReserva(normalizeReserva(found));
      } else {
        setError('Viagem não encontrada ou não disponível para este motorista.');
      }
    } catch (err) {
      setError(err.message || 'Não foi possível carregar a viagem.');
    } finally {
      setLoading(false);
    }
  }, [motoristaId, reservaId]);

  useEffect(() => {
    loadReserva();
  }, [loadReserva]);

  const vehicleImageUrl = useMemo(
    () =>
      resolveVehicleImageUrl({
        tipoVeiculo: reserva?.tipoVeiculo,
        model: reserva?.modeloVeiculo,
      }),
    [reserva?.modeloVeiculo, reserva?.tipoVeiculo],
  );

  const isEmUso = reserva?.statusReserva === 'EM_USO';
  const isConcluida = reserva?.statusReserva === 'CONCLUIDA';
  const checklistDone = Boolean(reserva?.checklistSaidaConcluido);
  const canFillChecklist = canOpenChecklistSaida(reserva);
  const canStart = canStartTrip(reserva);
  const windowMessage = getChecklistWindowMessage(reserva);
  const flashMessage = location.state?.flashMessage;
  const detailBasePath = `/motorista/${motoristaId}/reservas/${reserva?.idReserva}`;
  const corridaFinalizada = isCorridaFinalizada(reserva?.idReserva);

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p className="motorista-dashboard__invalid">Sessão inválida.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-stack motorista-page">
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando detalhes da viagem…</p>
        </div>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="page-stack motorista-page">
        <Link className="motorista-viagem-detail__back" to={`/motorista/${motoristaId}`}>
          <Icon name="fleet" />
          <span>Voltar às viagens</span>
        </Link>
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <div>
            <strong>Viagem indisponível</strong>
            <p>{error || 'Não foi possível carregar os detalhes.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack motorista-page motorista-viagem-detail">
      <Link className="motorista-viagem-detail__back" to={`/motorista/${motoristaId}`}>
        <Icon name="fleet" />
        <span>Voltar às viagens</span>
      </Link>

      <div className="motorista-viagem-detail__layout">
        <article className="motorista-viagem-detail__card">
          <header className="motorista-viagem-detail__header">
            <div className="motorista-viagem-detail__vehicle">
              <img
                alt=""
                className="motorista-viagem-detail__vehicle-img"
                src={vehicleImageUrl}
              />
              <div>
                <span className="motorista-veiculo-detail__eyebrow">{formatViagemLabel(viagemNumber)}</span>
                <StatusBadge label={formatStatusReserva(reserva.statusReserva)} />
                <h1>{reserva.modeloVeiculo || 'Veículo não informado'}</h1>
                <p>{reserva.placaVeiculo || '—'}</p>
              </div>
            </div>
          </header>

          <dl className="motorista-viagem-detail__info">
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
              <dt>Origem</dt>
              <dd>{reserva.origem || '—'}</dd>
            </div>
            <div>
              <dt>Destino</dt>
              <dd>{reserva.destino || '—'}</dd>
            </div>
          </dl>

          {flashMessage ? (
            <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
              <Icon name="check" />
              <span>{flashMessage}</span>
            </div>
          ) : null}

          {windowMessage ? (
            <div className="motorista-viagem-card__alert">
              <Icon name="alert" />
              <span>{windowMessage}</span>
            </div>
          ) : null}

          {checklistDone && !isEmUso && !isConcluida ? (
            <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
              <Icon name="check" />
              <span>Checklist de saída registrado. Você já pode iniciar a corrida.</span>
            </div>
          ) : null}

          <div className="motorista-viagem-detail__actions">
            {!isConcluida && !isEmUso && canFillChecklist ? (
              <Link
                className="motorista-viagem-card__action motorista-viagem-card__action--secondary"
                state={{ reserva }}
                to={`${detailBasePath}/checklist-saida`}
              >
                <Icon name="check" />
                <span>Preencher checklist</span>
              </Link>
            ) : null}

            {!isConcluida && !isEmUso && canStart ? (
              <Link
                className="motorista-viagem-card__action motorista-viagem-card__action--secondary"
                state={{ reserva }}
                to={`${detailBasePath}/iniciar-corrida`}
              >
                <Icon name="fleet" />
                <span>Iniciar corrida</span>
              </Link>
            ) : null}

            {isEmUso ? (
              <>
                <Link
                  className="motorista-viagem-card__action motorista-viagem-card__action--primary"
                  state={{ reserva, tripStartedAt: Date.now() }}
                  to={`${detailBasePath}/corrida`}
                >
                  <Icon name="fleet" />
                  <span>{corridaFinalizada ? 'Ver corrida finalizada' : 'Ver corrida no mapa'}</span>
                </Link>
                {corridaFinalizada ? (
                  <Link
                    className="motorista-viagem-card__action motorista-viagem-card__action--secondary"
                    state={{ reserva, tripSummary: loadTripSummary(reserva.idReserva) }}
                    to={`${detailBasePath}/checklist-retorno`}
                  >
                    <Icon name="check" />
                    <span>Preencher checklist de retorno</span>
                  </Link>
                ) : (
                  <div className="motorista-viagem-card__alert">
                    <Icon name="alert" />
                    <span>Finalize a corrida no mapa antes do checklist de retorno.</span>
                  </div>
                )}
              </>
            ) : null}

            {isConcluida ? (
              <Link
                className="motorista-viagem-card__action motorista-viagem-card__action--primary"
                state={{ reserva }}
                to={`${detailBasePath}/historico`}
              >
                <Icon name="history" />
                <span>Ver histórico da viagem</span>
              </Link>
            ) : null}
          </div>
        </article>

        <aside className="motorista-viagem-detail__aside">
          <div className="motorista-viagem-detail__map-card">
            <h2>Trajeto no mapa</h2>
            <ReservationRouteMapPanel reserva={reserva} />
          </div>
        </aside>
      </div>
    </div>
  );
}
