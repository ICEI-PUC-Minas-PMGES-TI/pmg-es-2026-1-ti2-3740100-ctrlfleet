import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { ReservationRouteMapPanel } from '../../../components/motorista/ReservationRouteMapPanel';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { buscarReservaMotorista, obterHistoricoViagemReserva } from '../../../services/motoristaApi';
import {
  formatDateTime,
  formatKm,
  parseReservaDateTime,
} from '../../../utils/motoristaReservaUtils';
import {
  formatDurationMinutes,
  formatDurationMs,
  reservationPlannedDurationMin,
} from '../../../utils/routeSimulationUtils';
import { loadTripSummary } from '../../../utils/tripSummaryStorage';

function formatTripDuration(dataSaida, dataRetorno) {
  const start = parseReservaDateTime(dataSaida)?.getTime();
  const end = parseReservaDateTime(dataRetorno)?.getTime();
  if (start == null || end == null || end <= start) return '—';
  return formatDurationMs(end - start);
}

export function MotoristaReservaHistoricoPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();

  const [reserva, setReserva] = useState(location.state?.reserva ?? null);
  const [historico, setHistorico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tripSummary = location.state?.tripSummary ?? loadTripSummary(reservaId);
  const flashMessage = location.state?.flashMessage;
  const basePath = `/motorista/${motoristaId}/reservas/${reservaId}`;

  const load = useCallback(async () => {
    if (!motoristaId || !reservaId) return;
    setLoading(true);
    setError(null);
    try {
      const [hist, res] = await Promise.all([
        obterHistoricoViagemReserva(reservaId, motoristaId),
        buscarReservaMotorista(motoristaId, reservaId),
      ]);
      setHistorico(hist);
      setReserva(
        res
          ? {
              ...res,
              origem: hist.origem ?? res.origem,
              destino: hist.destino ?? res.destino,
              origemLat: hist.origemLat ?? res.origemLat,
              origemLng: hist.origemLng ?? res.origemLng,
              destinoLat: hist.destinoLat ?? res.destinoLat,
              destinoLng: hist.destinoLng ?? res.destinoLng,
              placaVeiculo: hist.placaVeiculo ?? res.placaVeiculo,
              modeloVeiculo: hist.modeloVeiculo ?? res.modeloVeiculo,
            }
          : {
              idReserva: Number(reservaId),
              origem: hist.origem,
              destino: hist.destino,
              origemLat: hist.origemLat,
              origemLng: hist.origemLng,
              destinoLat: hist.destinoLat,
              destinoLng: hist.destinoLng,
              placaVeiculo: hist.placaVeiculo,
              modeloVeiculo: hist.modeloVeiculo,
              dataHoraInicioPrevista: hist.dataHoraInicioPrevista,
              dataHoraFimEstimada: hist.dataHoraFimEstimada,
            },
      );
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o histórico da viagem.');
    } finally {
      setLoading(false);
    }
  }, [motoristaId, reservaId]);

  useEffect(() => {
    load();
  }, [load]);

  const mapReserva = reserva || historico;
  const plannedMin = reservationPlannedDurationMin({
    dataHoraInicioPrevista: historico?.dataHoraInicioPrevista,
    dataHoraFimEstimada: historico?.dataHoraFimEstimada,
  });

  return (
    <div className="page-stack motorista-page motorista-viagem-historico-page">
      <PageHeader
        eyebrow="Histórico da viagem"
        subtitle="Resumo da corrida concluída — rota, quilometragem e tempos."
        title={`Reserva #${reservaId}`}
      />

      <Link className="motorista-viagem-detail__back" to={`/motorista/${motoristaId}`}>
        <Icon name="fleet" />
        <span>Voltar às minhas viagens</span>
      </Link>

      {flashMessage ? (
        <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
          <Icon name="check" />
          <span>{flashMessage}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando histórico...</p>
        </div>
      ) : error ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <p>{error}</p>
          <Link className="action-button action-button--secondary" to={basePath}>
            Voltar ao detalhe
          </Link>
        </div>
      ) : (
        <>
          <div className="motorista-viagem-detail__layout">
            <article className="motorista-viagem-detail__main">
              <SectionCard title="Trajeto">
                <dl className="motorista-viagem-detail__facts">
                  <div>
                    <dt>Origem</dt>
                    <dd>{historico?.origem || '—'}</dd>
                  </div>
                  <div>
                    <dt>Destino</dt>
                    <dd>{historico?.destino || '—'}</dd>
                  </div>
                  <div>
                    <dt>Veículo</dt>
                    <dd>
                      {historico?.modeloVeiculo || '—'} · {historico?.placaVeiculo || '—'}
                    </dd>
                  </div>
                </dl>
              </SectionCard>

              <SectionCard title="Quilometragem">
                <div className="motorista-corrida-page__meta motorista-viagem-historico-page__km">
                  <div>
                    <span>Saída</span>
                    <strong>{formatKm(historico?.quilometragemSaida)}</strong>
                  </div>
                  <div>
                    <span>Retorno</span>
                    <strong>{formatKm(historico?.quilometragemRetorno)}</strong>
                  </div>
                  <div>
                    <span>Percorrida</span>
                    <strong>{formatKm(historico?.quilometragemPercorrida)}</strong>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Tempos">
                <dl className="trip-summary-modal motorista-viagem-historico-page__times">
                  <div>
                    <dt>Saída real</dt>
                    <dd>{formatDateTime(historico?.dataSaida)}</dd>
                  </div>
                  <div>
                    <dt>Retorno real</dt>
                    <dd>{formatDateTime(historico?.dataRetorno)}</dd>
                  </div>
                  <div>
                    <dt>Duração da viagem</dt>
                    <dd>{formatTripDuration(historico?.dataSaida, historico?.dataRetorno)}</dd>
                  </div>
                  <div>
                    <dt>Janela prevista (reserva)</dt>
                    <dd>
                      {formatDateTime(historico?.dataHoraInicioPrevista)} →{' '}
                      {formatDateTime(historico?.dataHoraFimEstimada)}
                      {plannedMin != null ? ` (${plannedMin} min)` : ''}
                    </dd>
                  </div>
                  {tripSummary ? (
                    <>
                      <div>
                        <dt>Tempo estimado (rota)</dt>
                        <dd>{tripSummary.tempoEstimadoLabel}</dd>
                      </div>
                      <div>
                        <dt>Tempo da simulação</dt>
                        <dd>{tripSummary.tempoRealLabel}</dd>
                      </div>
                      <div>
                        <dt>Comparativo</dt>
                        <dd className="trip-summary-modal__delta">{tripSummary.deltaLabel}</dd>
                      </div>
                      {tripSummary.distanceKm != null ? (
                        <div>
                          <dt>Distância (mapa)</dt>
                          <dd>{formatKm(tripSummary.distanceKm)}</dd>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </dl>
              </SectionCard>

              {historico?.observacoesVeiculo ? (
                <SectionCard title="Observações">
                  <p>{historico.observacoesVeiculo}</p>
                </SectionCard>
              ) : null}
            </article>

            <aside className="motorista-viagem-detail__aside">
              <div className="motorista-viagem-detail__map-card">
                <h2>Rota percorrida</h2>
                <ReservationRouteMapPanel reserva={mapReserva} />
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
