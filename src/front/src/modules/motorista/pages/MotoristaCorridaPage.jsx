import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { RouteSimulationMap } from '../../../components/motorista/RouteSimulationMap';
import { TripSummaryModal } from '../../../components/motorista/TripSummaryModal';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { fetchDrivingRoute } from '../../../services/geocodingApi';
import { buscarReservaMotorista } from '../../../services/motoristaApi';
import { formatKm, hasReservationCoords } from '../../../utils/motoristaReservaUtils';
import { saveTripSummary } from '../../../utils/tripSummaryStorage';
import { coordsFromReservation, resolveReservationCoords } from '../../../utils/resolveReservationCoords';
import {
  buildTripSummary,
  resolveRouteDistanceKm,
  simulationDurationMs,
} from '../../../utils/routeSimulationUtils';

export function MotoristaCorridaPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();

  const tripStartedAtRef = useRef(
    location.state?.tripStartedAt ?? Date.now(),
  );

  const [reserva, setReserva] = useState(location.state?.reserva ?? null);
  const [loadingReserva, setLoadingReserva] = useState(!location.state?.reserva);
  const [coords, setCoords] = useState({ origem: null, destino: null, ready: false, loading: true });
  const [routePositions, setRoutePositions] = useState([]);
  const [routeMeta, setRouteMeta] = useState({ distanceKm: null, durationMin: null });
  const [routeLoading, setRouteLoading] = useState(true);

  const [progress, setProgress] = useState(0);
  const [simulationState, setSimulationState] = useState('running');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState(null);

  const rafRef = useRef(null);
  const simStartRef = useRef(null);
  const durationMsRef = useRef(45000);

  const basePath = `/motorista/${motoristaId}/reservas/${reservaId}`;
  const retornoPath = `${basePath}/checklist-retorno`;
  const historicoPath = `${basePath}/historico`;

  const loadReserva = useCallback(async () => {
    if (!motoristaId || !reservaId) return;
    setLoadingReserva(true);
    try {
      const data = await buscarReservaMotorista(motoristaId, reservaId);
      if (data) setReserva(data);
    } finally {
      setLoadingReserva(false);
    }
  }, [motoristaId, reservaId]);

  useEffect(() => {
    if (!reserva) loadReserva();
  }, [loadReserva, reserva]);

  useEffect(() => {
    if (reserva?.statusReserva === 'CONCLUIDA') {
      navigate(historicoPath, { replace: true, state: { reserva } });
    }
  }, [historicoPath, navigate, reserva]);

  useEffect(() => {
    if (!reserva) return undefined;
    const fromApi = coordsFromReservation(reserva);

    if (hasReservationCoords(reserva)) {
      setCoords({
        origem: fromApi.origemCoords,
        destino: fromApi.destinoCoords,
        ready: true,
        loading: false,
      });
      return undefined;
    }

    const controller = new AbortController();
    resolveReservationCoords(
      {
        origem: reserva.origem,
        destino: reserva.destino,
        origemCoords: fromApi.origemCoords,
        destinoCoords: fromApi.destinoCoords,
      },
      { signal: controller.signal },
    )
      .then((resolved) => {
        if (resolved.origemCoords?.lat != null && resolved.destinoCoords?.lat != null) {
          setCoords({
            origem: resolved.origemCoords,
            destino: resolved.destinoCoords,
            ready: true,
            loading: false,
          });
        } else {
          setCoords({ origem: null, destino: null, ready: false, loading: false });
        }
      })
      .catch(() => setCoords({ origem: null, destino: null, ready: false, loading: false }));

    return () => controller.abort();
  }, [reserva]);

  useEffect(() => {
    if (!coords.ready || !coords.origem || !coords.destino) {
      setRouteLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setRouteLoading(true);

    fetchDrivingRoute(coords.origem, coords.destino, { signal: controller.signal })
      .then((route) => {
        setRoutePositions(route.positions?.length >= 2 ? route.positions : []);
        setRouteMeta({ distanceKm: route.distanceKm, durationMin: route.durationMin });
        durationMsRef.current = simulationDurationMs(route.durationMin);
      })
      .catch(() => {
        setRoutePositions([
          [coords.origem.lat, coords.origem.lng],
          [coords.destino.lat, coords.destino.lng],
        ]);
        durationMsRef.current = 45000;
      })
      .finally(() => setRouteLoading(false));

    return () => controller.abort();
  }, [coords.destino, coords.origem, coords.ready]);

  const stopSimulation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startSimulation = useCallback(() => {
    if (!routePositions.length || simulationState !== 'running') return;
    stopSimulation();
    simStartRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - simStartRef.current;
      const t = Math.min(1, elapsed / durationMsRef.current);
      setProgress(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setSimulationState('arrived');
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [routePositions.length, simulationState, stopSimulation]);

  useEffect(() => {
    if (!routeLoading && routePositions.length >= 2 && simulationState === 'running') {
      startSimulation();
    }
    return stopSimulation;
  }, [routeLoading, routePositions, simulationState, startSimulation, stopSimulation]);

  function handleTerminarCorrida() {
    stopSimulation();
    setProgress(1);
    setSimulationState('finished');

    const distanceKm = resolveRouteDistanceKm(routeMeta.distanceKm, routePositions);
    const tripSummary = buildTripSummary({
      reserva,
      routeDistanceKm: distanceKm,
      routeDurationMin: routeMeta.durationMin,
      tripStartedAt: tripStartedAtRef.current,
      tripEndedAt: Date.now(),
    });

    setSummary(tripSummary);
    setSummaryOpen(true);
  }

  function handleContinueToRetorno() {
    if (summary) {
      saveTripSummary(reservaId, summary);
    }
    setSummaryOpen(false);
    navigate(retornoPath, { state: { reserva, tripSummary: summary } });
  }

  if (!motoristaId) {
    return (
      <div className="page-stack motorista-page">
        <p>Sessão inválida.</p>
      </div>
    );
  }

  if (loadingReserva && !reserva) {
    return (
      <div className="page-stack motorista-page">
        <div className="admin-dashboard__loading">
          <span aria-hidden="true" className="admin-dashboard__spinner" />
          <p>Carregando corrida…</p>
        </div>
      </div>
    );
  }

  const isEmUso = reserva?.statusReserva === 'EM_USO';
  const progressPct = Math.round(progress * 100);

  return (
    <div
      className={`page-stack motorista-page motorista-corrida-page ${summaryOpen ? 'motorista-corrida-page--modal-open' : ''}`.trim()}
    >
      <header className="motorista-corrida-page__header">
        <div>
          <span className="motorista-corrida-page__eyebrow">Corrida em andamento</span>
          <h1>{reserva?.modeloVeiculo || 'Veículo'} · {reserva?.placaVeiculo || '—'}</h1>
          <p>
            {reserva?.origem} → {reserva?.destino}
          </p>
        </div>
        <div className="motorista-corrida-page__status">
          <span className={`motorista-corrida-page__badge motorista-corrida-page__badge--${simulationState}`}>
            {simulationState === 'running' && 'Em deslocamento'}
            {simulationState === 'arrived' && 'No destino'}
            {simulationState === 'finished' && 'Encerrada'}
          </span>
          <span className="motorista-corrida-page__progress">{progressPct}% do trajeto</span>
        </div>
      </header>

      {!isEmUso ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <p>Esta reserva não está em uso. Inicie a corrida pelo detalhe da viagem.</p>
          <Link className="action-button action-button--secondary" to={basePath}>
            Voltar ao detalhe
          </Link>
        </div>
      ) : null}

      <div className="motorista-corrida-page__map-wrap">
        <RouteSimulationMap
          className="motorista-corrida-page__map"
          destinoCoords={coords.destino}
          loading={coords.loading || routeLoading}
          origemCoords={coords.origem}
          progress={progress}
          routePositions={routePositions}
        />
      </div>

      {simulationState === 'arrived' ? (
        <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
          <Icon name="check" />
          <span>Veículo chegou ao destino. Clique em &quot;Terminar corrida&quot; para ver o resumo.</span>
        </div>
      ) : null}

      <div className="motorista-corrida-page__meta">
        <div>
          <span>Distância estimada</span>
          <strong>{formatKm(routeMeta.distanceKm)}</strong>
        </div>
        <div>
          <span>Tempo da rota (mapa)</span>
          <strong>
            {routeMeta.durationMin != null ? `${routeMeta.durationMin} min` : '—'}
          </strong>
        </div>
      </div>

      <div className="motorista-corrida-page__actions">
        <Link className="action-button action-button--secondary" state={{ reserva }} to={basePath}>
          Detalhe da viagem
        </Link>
        {isEmUso ? (
          <ActionButton icon="check" onClick={handleTerminarCorrida}>
            Terminar corrida
          </ActionButton>
        ) : null}
      </div>

      <TripSummaryModal
        onClose={() => setSummaryOpen(false)}
        onContinue={handleContinueToRetorno}
        open={summaryOpen}
        summary={summary}
      />
    </div>
  );
}
