import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ReservationRouteMapPanel } from '../../../components/motorista/ReservationRouteMapPanel';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import {
  buscarReservaMotorista,
  listarReservasAprovadas,
  listarReservasEmUso,
} from '../../../services/motoristaApi';
import {
  canOpenChecklistSaida,
  formatDateTime,
  formatKm,
  formatStatusReserva,
  getChecklistWindowMessage,
} from '../../../utils/motoristaReservaUtils';
import { resolveVehicleTypeImageUrl } from '../../../utils/vehicleImage';

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
        setError('Reserva não encontrada ou não disponível para este motorista.');
      }
    } catch (err) {
      setError(err.message || 'Não foi possível carregar a reserva.');
    } finally {
      setLoading(false);
    }
  }, [motoristaId, reservaId]);

  useEffect(() => {
    loadReserva();
  }, [loadReserva]);

  const vehicleImageUrl = useMemo(
    () => resolveVehicleTypeImageUrl(reserva?.tipoVeiculo),
    [reserva?.tipoVeiculo],
  );

  const isEmUso = reserva?.statusReserva === 'EM_USO';
  const isConcluida = reserva?.statusReserva === 'CONCLUIDA';
  const checklistDone = Boolean(reserva?.checklistSaidaConcluido);
  const canStart = canOpenChecklistSaida(reserva);
  const windowMessage = getChecklistWindowMessage(reserva);

  if (!motoristaId) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Sessão inválida." title="Detalhe da reserva" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader subtitle="Carregando dados da reserva…" title="Detalhe da reserva" />
        <div className="admin-dashboard__loading">
          <span className="admin-dashboard__spinner" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="page-stack">
        <PageHeader
          actions={
            <Link className="action-button action-button--secondary" to={`/motorista/${motoristaId}`}>
              Voltar
            </Link>
          }
          subtitle={error || 'Reserva indisponível.'}
          title="Detalhe da reserva"
        />
      </div>
    );
  }

  return (
    <div className="page-stack driver-reserva-detail-v2">
      <PageHeader
        actions={
          <Link className="action-button action-button--secondary" to={`/motorista/${motoristaId}`}>
            <Icon name="fleet" />
            <span>Voltar às reservas</span>
          </Link>
        }
        subtitle={`${reserva.placaVeiculo} · ${reserva.modeloVeiculo}`}
        title={`Reserva #${reserva.idReserva}`}
      />

      <div className="driver-reserva-detail-v2__layout">
        <div className="driver-reserva-detail-v2__main">
          <SectionCard>
            <div className="driver-reserva-detail-v2__hero">
              <div className="driver-reserva-detail-v2__vehicle">
                <img alt="" className="driver-reserva-detail-v2__vehicle-img" src={vehicleImageUrl} />
                <div>
                  <StatusBadge label={formatStatusReserva(reserva.statusReserva)} />
                  <h2>{reserva.modeloVeiculo}</h2>
                  <p>
                    {reserva.placaVeiculo}
                    {reserva.tipoVeiculo ? ` · ${reserva.tipoVeiculo}` : ''}
                  </p>
                </div>
              </div>

              <dl className="driver-reserva-detail-v2__meta">
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
                  <dt>Última quilometragem</dt>
                  <dd>{formatKm(reserva.ultimaQuilometragemVeiculo)}</dd>
                </div>
                {isEmUso ? (
                  <div>
                    <dt>KM na saída do trajeto</dt>
                    <dd>{formatKm(reserva.quilometragemSaidaTrajeto)}</dd>
                  </div>
                ) : null}
              </dl>

              {reserva.justificativa ? (
                <div className="driver-reserva-detail-v2__justificativa">
                  <strong>Justificativa da solicitação</strong>
                  <p>{reserva.justificativa}</p>
                </div>
              ) : null}

              {windowMessage ? (
                <p className="driver-reserva-detail-v2__hint">
                  <Icon name="alert" />
                  <span>{windowMessage}</span>
                </p>
              ) : null}

              <div className="driver-reserva-detail-v2__actions">
                {isConcluida ? null : isEmUso ? (
                  <Link
                    className="action-button action-button--primary"
                    state={{ reserva }}
                    to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-retorno`}
                  >
                    <Icon name="check" />
                    <span>Finalizar trajeto</span>
                  </Link>
                ) : checklistDone ? (
                  <Link
                    aria-disabled={!canStart}
                    className={`action-button ${canStart ? 'action-button--primary' : 'action-button--secondary'}`}
                    state={{ reserva }}
                    to={
                      canStart
                        ? `/motorista/${motoristaId}/reservas/${reserva.idReserva}/iniciar-corrida`
                        : '#'
                    }
                  >
                    <Icon name="fleet" />
                    <span>{canStart ? 'Iniciar corrida' : 'Corrida indisponível na janela'}</span>
                  </Link>
                ) : (
                  <Link
                    className="action-button action-button--primary"
                    state={{ reserva }}
                    to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-saida`}
                  >
                    <Icon name="check" />
                    <span>Registrar checklist de saída</span>
                  </Link>
                )}

                {!isConcluida && !isEmUso && !checklistDone ? (
                  <Link
                    className="action-button action-button--secondary"
                    state={{ reserva }}
                    to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-saida`}
                  >
                    Checklist de saída
                  </Link>
                ) : null}
                {isEmUso ? (
                  <Link
                    className="action-button action-button--secondary"
                    state={{ reserva }}
                    to={`/motorista/${motoristaId}/reservas/${reserva.idReserva}/checklist-retorno`}
                  >
                    Checklist de retorno
                  </Link>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Etapas da jornada">
            <ol className="driver-reserva-detail-v2__timeline">
              <li className={checklistDone || isEmUso || isConcluida ? 'is-done' : ''}>
                <span>1</span>
                <div>
                  <strong>Checklist de saída</strong>
                  <p>
                    {checklistDone || isEmUso || isConcluida
                      ? 'Registrado'
                      : 'Pendente — salve antes de iniciar a corrida'}
                  </p>
                </div>
              </li>
              <li className={isEmUso || isConcluida ? 'is-done' : ''}>
                <span>2</span>
                <div>
                  <strong>Corrida em andamento</strong>
                  <p>
                    {isConcluida
                      ? 'Encerrada'
                      : isEmUso
                        ? 'Veículo em uso'
                        : checklistDone
                          ? 'Pronta para iniciar'
                          : 'Aguardando checklist'}
                  </p>
                </div>
              </li>
              <li className={isConcluida ? 'is-done' : ''}>
                <span>3</span>
                <div>
                  <strong>Checklist de retorno</strong>
                  <p>{isConcluida ? 'Concluído' : 'Ao encerrar o trajeto'}</p>
                </div>
              </li>
            </ol>
          </SectionCard>
        </div>

        <aside className="driver-reserva-detail-v2__aside">
          <SectionCard title="Trajeto no mapa">
            <ReservationRouteMapPanel reserva={reserva} />
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
