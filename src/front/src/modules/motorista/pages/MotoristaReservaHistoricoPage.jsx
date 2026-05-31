import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Icon } from '../../../components/common/Icon';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ReservationRouteMapPanel } from '../../../components/motorista/ReservationRouteMapPanel';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { buscarReservaMotorista, obterHistoricoViagemReserva } from '../../../services/motoristaApi';
import { useMotoristaViagemNumber } from '../../../hooks/useMotoristaViagemNumbers';
import {
  formatDateTime,
  formatKm,
  parseReservaDateTime,
} from '../../../utils/motoristaReservaUtils';
import {
  formatDurationHours,
  reservationPlannedDurationMin,
} from '../../../utils/routeSimulationUtils';
import { loadTripSummary } from '../../../utils/tripSummaryStorage';
import { formatViagemLabel } from '../../../utils/userReservaNumbers';

function formatTripDuration(dataSaida, dataRetorno) {
  const start = parseReservaDateTime(dataSaida)?.getTime();
  const end = parseReservaDateTime(dataRetorno)?.getTime();
  if (start == null || end == null || end <= start) return '—';
  return formatDurationHours(end - start);
}

export function MotoristaReservaHistoricoPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();
  const viagemNumber = useMotoristaViagemNumber(motoristaId, reservaId);

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
    <div className="page-stack motorista-page motorista-historico-viagem">
      <Link className="motorista-viagem-detail__back" to={`/motorista/${motoristaId}`}>
        <Icon name="chevronLeft" />
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
          <article className="motorista-historico-viagem__hero">
            <div className="motorista-historico-viagem__hero-top">
              <span className="motorista-historico-viagem__chip">{formatViagemLabel(viagemNumber)} · Concluída</span>
              <StatusBadge label="Concluída" />
            </div>

            <h1>Histórico da {formatViagemLabel(viagemNumber).toLowerCase()}</h1>

            <div className="motorista-historico-viagem__route">
              <div className="motorista-historico-viagem__route-point">
                <span aria-hidden="true" className="motorista-viagem-card__route-badge motorista-viagem-card__route-badge--origem">
                  A
                </span>
                <div>
                  <span className="motorista-viagem-card__route-label">Origem</span>
                  <strong>{historico?.origem || '—'}</strong>
                </div>
              </div>
              <div aria-hidden="true" className="motorista-historico-viagem__route-arrow">
                <Icon name="chevronRight" />
              </div>
              <div className="motorista-historico-viagem__route-point">
                <span aria-hidden="true" className="motorista-viagem-card__route-badge motorista-viagem-card__route-badge--destino">
                  B
                </span>
                <div>
                  <span className="motorista-viagem-card__route-label">Destino</span>
                  <strong>{historico?.destino || '—'}</strong>
                </div>
              </div>
            </div>

            <p className="motorista-historico-viagem__vehicle">
              <Icon name="fleet" />
              <span>
                {historico?.modeloVeiculo || 'Veículo'} ·{' '}
                <span className="driver-placa-pill">{historico?.placaVeiculo || '—'}</span>
              </span>
            </p>
          </article>

          <section aria-label="Quilometragem" className="motorista-historico-viagem__kpi">
            <div className="motorista-historico-viagem__kpi-card motorista-historico-viagem__kpi-card--start">
              <Icon name="fleet" />
              <span>KM saída</span>
              <strong>{formatKm(historico?.quilometragemSaida)}</strong>
            </div>
            <div className="motorista-historico-viagem__kpi-card motorista-historico-viagem__kpi-card--distance">
              <Icon name="dashboard" />
              <span>Percorrida</span>
              <strong>{formatKm(historico?.quilometragemPercorrida)}</strong>
            </div>
            <div className="motorista-historico-viagem__kpi-card motorista-historico-viagem__kpi-card--end">
              <Icon name="check" />
              <span>KM retorno</span>
              <strong>{formatKm(historico?.quilometragemRetorno)}</strong>
            </div>
          </section>

          <div className="motorista-historico-viagem__layout">
            <div className="motorista-historico-viagem__main">
              <section className="motorista-historico-viagem__panel">
                <header className="motorista-veiculo-detail__section-head">
                  <div>
                    <span className="motorista-veiculo-detail__eyebrow">Cronologia</span>
                    <h2>Tempos da viagem</h2>
                  </div>
                </header>

                <ol className="motorista-historico-viagem__timeline">
                  <li>
                    <span className="motorista-historico-viagem__timeline-dot motorista-historico-viagem__timeline-dot--start" />
                    <div>
                      <strong>Saída real</strong>
                      <span>{formatDateTime(historico?.dataSaida)}</span>
                    </div>
                  </li>
                  <li>
                    <span className="motorista-historico-viagem__timeline-dot motorista-historico-viagem__timeline-dot--mid" />
                    <div>
                      <strong>Duração total</strong>
                      <span>{formatTripDuration(historico?.dataSaida, historico?.dataRetorno)}</span>
                    </div>
                  </li>
                  <li>
                    <span className="motorista-historico-viagem__timeline-dot motorista-historico-viagem__timeline-dot--end" />
                    <div>
                      <strong>Retorno real</strong>
                      <span>{formatDateTime(historico?.dataRetorno)}</span>
                    </div>
                  </li>
                </ol>

                <div className="motorista-historico-viagem__planned">
                  <Icon name="calendar" />
                  <div>
                    <strong>Janela prevista na reserva</strong>
                    <span>
                      {formatDateTime(historico?.dataHoraInicioPrevista)} →{' '}
                      {formatDateTime(historico?.dataHoraFimEstimada)}
                      {plannedMin != null ? ` · ${formatDurationHours(plannedMin * 60 * 1000)} previstos` : ''}
                    </span>
                  </div>
                </div>

                {tripSummary ? (
                  <div className="motorista-historico-viagem__simulation">
                    <h3>Simulação da corrida</h3>
                    <dl className="motorista-historico-viagem__simulation-grid">
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
                          <dt>Distância no mapa</dt>
                          <dd>{formatKm(tripSummary.distanceKm)}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}
              </section>

              {historico?.observacoesVeiculo ? (
                <section className="motorista-historico-viagem__panel motorista-historico-viagem__panel--notes">
                  <header className="motorista-veiculo-detail__section-head">
                    <div>
                      <span className="motorista-veiculo-detail__eyebrow">Registro</span>
                      <h2>Observações</h2>
                    </div>
                  </header>
                  <p>{historico.observacoesVeiculo}</p>
                </section>
              ) : null}
            </div>

            <aside className="motorista-historico-viagem__aside">
              <div className="motorista-viagem-detail__map-card motorista-historico-viagem__map">
                <header className="motorista-veiculo-detail__section-head">
                  <div>
                    <span className="motorista-veiculo-detail__eyebrow">Mapa</span>
                    <h2>Rota percorrida</h2>
                  </div>
                </header>
                <ReservationRouteMapPanel reserva={mapReserva} />
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
