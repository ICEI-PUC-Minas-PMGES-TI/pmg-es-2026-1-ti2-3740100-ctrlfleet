import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { Icon } from '../../../components/common/Icon';
import { RouteSimulationMap } from '../../../components/motorista/RouteSimulationMap';
import { TripSummaryModal } from '../../../components/motorista/TripSummaryModal';
import { getAuthSession } from '../../../services/authSession';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';
import { fetchDrivingRoute } from '../../../services/geocodingApi';
import { buscarReservaMotorista, registrarQuilometragemRetornoAutomatica } from '../../../services/motoristaApi';
import {
  buildActiveFleetTripPayload,
  DEFAULT_FLEET_SIMULATION_MS,
  formatSimulationDurationLabel,
  getActiveFleetTrip,
  readSimulationDurationMs,
  removeActiveFleetTrip,
  upsertActiveFleetTrip,
  writeSimulationDurationMs,
} from '../../../utils/fleetActiveTripsStorage';
import { formatKm, hasReservationCoords } from '../../../utils/motoristaReservaUtils';
import {
  loadCorridaPhase,
  loadTripSummary,
  saveCorridaPhase,
  saveTripSummary,
} from '../../../utils/tripSummaryStorage';
import { coordsFromReservation, resolveReservationCoords } from '../../../utils/resolveReservationCoords';
import {
  buildTripSummary,
  resolveRouteDistanceKm,
  roundTripDistanceKm,
} from '../../../utils/routeSimulationUtils';

const ANIMATING_STATES = new Set(['running', 'returning']);

export function MotoristaCorridaPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const motoristaId = getCurrentMotoristaId();

  const tripStartedAtRef = useRef(location.state?.tripStartedAt ?? Date.now());
  const simulationStartedAtRef = useRef(null);
  const restoredRef = useRef(false);
  const [simulationDurationMs, setSimulationDurationMs] = useState(() =>
    readSimulationDurationMs(
      reservaId,
      location.state?.simulationDurationMs ?? DEFAULT_FLEET_SIMULATION_MS,
    ),
  );
  const session = getAuthSession();

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
  const [terminating, setTerminating] = useState(false);
  const [terminateError, setTerminateError] = useState(null);

  const rafRef = useRef(null);
  const simStartRef = useRef(null);
  const routePositionsRef = useRef([]);
  const coordsRef = useRef({ origem: null, destino: null });
  const progressRef = useRef(0);
  const simulationStateRef = useRef('running');

  const oneWayDistanceKm = useMemo(
    () => resolveRouteDistanceKm(routeMeta.distanceKm, routePositions),
    [routeMeta.distanceKm, routePositions],
  );
  const roundTripKm = useMemo(() => roundTripDistanceKm(oneWayDistanceKm), [oneWayDistanceKm]);

  const tripLeg = simulationState === 'returning' || simulationState === 'returned' ? 'return' : 'outbound';

  useEffect(() => {
    routePositionsRef.current = routePositions;
  }, [routePositions]);

  useEffect(() => {
    coordsRef.current = { origem: coords.origem, destino: coords.destino };
  }, [coords.destino, coords.origem]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    simulationStateRef.current = simulationState;
  }, [simulationState]);

  useEffect(() => {
    if (location.state?.simulationDurationMs) {
      setSimulationDurationMs(location.state.simulationDurationMs);
      writeSimulationDurationMs(reservaId, location.state.simulationDurationMs);
    }
  }, [location.state?.simulationDurationMs, reservaId]);

  const publishActiveTrip = useCallback(
    (patch = {}) => {
      const activeReservaId = reserva?.idReserva ?? Number(reservaId);
      if (!activeReservaId) return;

      const leg =
        patch.tripLeg ??
        (simulationStateRef.current === 'returning' || simulationStateRef.current === 'returned'
          ? 'return'
          : 'outbound');

      upsertActiveFleetTrip(
        buildActiveFleetTripPayload({
          reserva,
          reservaId: activeReservaId,
          routePositions: routePositionsRef.current,
          progress: progressRef.current,
          simulationDurationMs,
          tripStartedAt: tripStartedAtRef.current,
          simulationStartedAt: simulationStartedAtRef.current,
          status: simulationStateRef.current,
          tripLeg: leg,
          origemCoords: coordsRef.current.origem,
          destinoCoords: coordsRef.current.destino,
          motoristaNome: session?.nome,
          ...patch,
        }),
      );
    },
    [reserva, reservaId, session?.nome, simulationDurationMs],
  );

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
      if (reserva?.idReserva) removeActiveFleetTrip(reserva.idReserva);
      navigate(historicoPath, { replace: true, state: { reserva } });
    }
  }, [historicoPath, navigate, reserva]);

  useEffect(() => {
    if (restoredRef.current || !reservaId) return;

    const savedSummary = loadTripSummary(reservaId);
    const savedPhase = loadCorridaPhase(reservaId);
    const activeTrip = getActiveFleetTrip(reservaId);

    if (savedSummary || savedPhase === 'awaiting_checklist') {
      restoredRef.current = true;
      setSimulationState('awaiting_checklist');
      setProgress(1);
      if (savedSummary) setSummary(savedSummary);
      return;
    }

    if (savedPhase === 'returned') {
      restoredRef.current = true;
      setSimulationState('returned');
      setProgress(1);
      return;
    }

    if (savedPhase === 'returning') {
      restoredRef.current = true;
      setSimulationState('returning');
      setProgress(0);
      return;
    }

    if (savedPhase === 'arrived') {
      restoredRef.current = true;
      setSimulationState('arrived');
      setProgress(1);
      return;
    }

    if (activeTrip) {
      restoredRef.current = true;
      if (activeTrip.simulationStartedAt) {
        simulationStartedAtRef.current = activeTrip.simulationStartedAt;
      }
      if (activeTrip.tripStartedAt) {
        tripStartedAtRef.current = activeTrip.tripStartedAt;
      }

      if (activeTrip.status === 'awaiting_checklist') {
        setSimulationState('awaiting_checklist');
        setProgress(1);
      } else if (activeTrip.status === 'returned') {
        setSimulationState('returned');
        setProgress(1);
      } else if (activeTrip.status === 'returning') {
        setSimulationState('returning');
        setProgress(activeTrip.progress ?? 0);
      } else if (activeTrip.status === 'arrived') {
        setSimulationState('arrived');
        setProgress(1);
      } else if (activeTrip.status === 'running') {
        setSimulationState('running');
        setProgress(activeTrip.progress ?? 0);
      }
    }
  }, [reservaId]);

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
      })
      .catch(() => {
        setRoutePositions([
          [coords.origem.lat, coords.origem.lng],
          [coords.destino.lat, coords.destino.lng],
        ]);
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
    const isReturn = simulationState === 'returning';
    if (!routePositionsRef.current.length || !ANIMATING_STATES.has(simulationState)) return;
    stopSimulation();

    if (!simulationStartedAtRef.current) {
      const startedAt = Date.now();
      simulationStartedAtRef.current = startedAt;
      simStartRef.current = performance.now();
    } else {
      const elapsed = Date.now() - simulationStartedAtRef.current;
      simStartRef.current = performance.now() - elapsed;
    }

    publishActiveTrip({
      progress: progressRef.current,
      status: simulationState,
      tripLeg: isReturn ? 'return' : 'outbound',
      simulationStartedAt: simulationStartedAtRef.current,
      routePositions: routePositionsRef.current,
    });

    const tick = (now) => {
      const elapsed = now - simStartRef.current;
      const t = Math.min(1, elapsed / simulationDurationMs);
      setProgress(t);
      progressRef.current = t;

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (isReturn) {
        setSimulationState('returned');
        saveCorridaPhase(reservaId, 'returned');
        publishActiveTrip({
          progress: 1,
          status: 'returned',
          tripLeg: 'return',
          routePositions: routePositionsRef.current,
          simulationStartedAt: simulationStartedAtRef.current,
        });
      } else {
        setSimulationState('arrived');
        saveCorridaPhase(reservaId, 'arrived');
        publishActiveTrip({
          progress: 1,
          status: 'arrived',
          tripLeg: 'outbound',
          routePositions: routePositionsRef.current,
          simulationStartedAt: simulationStartedAtRef.current,
        });
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [publishActiveTrip, reservaId, simulationDurationMs, simulationState, stopSimulation]);

  useEffect(() => {
    if (!routeLoading && routePositions.length >= 2 && ANIMATING_STATES.has(simulationState)) {
      startSimulation();
    }
    return stopSimulation;
  }, [routeLoading, routePositions.length, simulationState, startSimulation, stopSimulation]);

  useEffect(() => {
    if (!reserva || reserva.statusReserva !== 'EM_USO') return undefined;
    if (simulationStateRef.current === 'running') {
      publishActiveTrip({ status: 'running', tripLeg: 'outbound' });
    }
    return undefined;
  }, [publishActiveTrip, reserva]);

  useEffect(() => {
    if (!reserva || routeLoading || routePositions.length < 2) return;
    publishActiveTrip({ routePositions });
  }, [publishActiveTrip, reserva, routeLoading, routePositions]);

  function handleVoltarParaOrigem() {
    if (simulationState !== 'arrived') return;
    stopSimulation();
    simulationStartedAtRef.current = null;
    setProgress(0);
    progressRef.current = 0;
    setSimulationState('returning');
    saveCorridaPhase(reservaId, 'returning');
    publishActiveTrip({
      progress: 0,
      status: 'returning',
      tripLeg: 'return',
      simulationStartedAt: null,
    });
  }

  async function handleTerminarCorrida() {
    if (simulationState !== 'returned' || terminating) return;

    stopSimulation();
    setProgress(1);
    setTerminating(true);
    setTerminateError(null);

    const tripSummary = buildTripSummary({
      reserva,
      routeDistanceKm: roundTripKm,
      oneWayDistanceKm: oneWayDistanceKm,
      routeDurationMin: routeMeta.durationMin != null ? routeMeta.durationMin * 2 : null,
      tripStartedAt: tripStartedAtRef.current,
      tripEndedAt: Date.now(),
    });

    try {
      await registrarQuilometragemRetornoAutomatica(reservaId, {
        idMotorista: motoristaId,
        distanciaPercorridaKm: roundTripKm,
      });
    } catch (error) {
      setTerminateError(
        error.message || 'Não foi possível registrar a quilometragem. Tente novamente.',
      );
      setTerminating(false);
      return;
    }

    saveTripSummary(reservaId, tripSummary);
    saveCorridaPhase(reservaId, 'awaiting_checklist');
    setSimulationState('awaiting_checklist');
    publishActiveTrip({ progress: 1, status: 'awaiting_checklist', tripLeg: 'return' });

    setSummary(tripSummary);
    setSummaryOpen(true);
    setTerminating(false);
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
  const selectedDurationLabel = formatSimulationDurationLabel(simulationDurationMs);
  const awaitingChecklist = simulationState === 'awaiting_checklist';

  const progressLabel = (() => {
    if (simulationState === 'running') return `${progressPct}% — ida para B`;
    if (simulationState === 'arrived') return 'No destino B';
    if (simulationState === 'returning') return `${progressPct}% — volta para A`;
    if (simulationState === 'returned') return 'Na origem A';
    if (awaitingChecklist) return 'Corrida encerrada';
    return `${progressPct}% do trajeto`;
  })();

  const statusLabel = (() => {
    if (simulationState === 'running') return 'Indo para B';
    if (simulationState === 'arrived') return 'No destino B';
    if (simulationState === 'returning') return 'Voltando para A';
    if (simulationState === 'returned') return 'Na origem A';
    if (awaitingChecklist) return 'Aguardando checklist';
    return simulationState;
  })();

  return (
    <div
      className={`page-stack motorista-page motorista-corrida-page ${summaryOpen ? 'motorista-corrida-page--modal-open' : ''}`.trim()}
    >
      <header className="motorista-corrida-page__header">
        <div>
          <span className="motorista-corrida-page__eyebrow">Corrida em andamento · ida e volta</span>
          <h1>{reserva?.modeloVeiculo || 'Veículo'} · {reserva?.placaVeiculo || '—'}</h1>
          <p>
            {reserva?.origem} → {reserva?.destino} → {reserva?.origem}
          </p>
        </div>
        <div className="motorista-corrida-page__status">
          <span className={`motorista-corrida-page__badge motorista-corrida-page__badge--${simulationState}`}>
            {statusLabel}
          </span>
          <span className="motorista-corrida-page__progress">{progressLabel}</span>
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
          tripLeg={tripLeg}
        />
      </div>

      {simulationState === 'arrived' ? (
        <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
          <Icon name="check" />
          <span>Chegou ao destino B. Inicie a volta para a origem A antes de encerrar a corrida.</span>
        </div>
      ) : null}

      {simulationState === 'returned' ? (
        <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
          <Icon name="check" />
          <span>Volta concluída na origem A. Termine a corrida para ver o resumo e preencher o checklist.</span>
        </div>
      ) : null}

      {awaitingChecklist ? (
        <div className="motorista-viagem-card__alert motorista-viagem-card__alert--ok">
          <Icon name="check" />
          <span>Corrida finalizada. Preencha o checklist de retorno para encerrar a viagem e ver o histórico.</span>
        </div>
      ) : null}

      {terminateError ? (
        <div className="admin-dashboard__error">
          <Icon name="alert" />
          <p>{terminateError}</p>
        </div>
      ) : null}

      <div className="motorista-corrida-page__meta">
        <div>
          <span>Distância ida (A→B)</span>
          <strong>{formatKm(oneWayDistanceKm)}</strong>
        </div>
        <div>
          <span>Distância total (ida + volta)</span>
          <strong>{formatKm(roundTripKm)}</strong>
        </div>
        <div>
          <span>Tempo da simulação (por trecho)</span>
          <strong>{selectedDurationLabel}</strong>
        </div>
      </div>

      <div className="motorista-corrida-page__actions">
        <Link className="action-button action-button--secondary" state={{ reserva }} to={basePath}>
          Detalhe da viagem
        </Link>
        {isEmUso && simulationState === 'arrived' ? (
          <ActionButton icon="fleet" onClick={handleVoltarParaOrigem}>
            Voltar para origem (A)
          </ActionButton>
        ) : null}
        {isEmUso && simulationState === 'returned' ? (
          <ActionButton disabled={terminating} icon="check" onClick={handleTerminarCorrida}>
            {terminating ? 'Finalizando…' : 'Terminar corrida'}
          </ActionButton>
        ) : null}
        {isEmUso && awaitingChecklist ? (
          <Link
            className="action-button action-button--primary"
            state={{ reserva, tripSummary: summary ?? loadTripSummary(reservaId) }}
            to={retornoPath}
          >
            Preencher checklist de retorno
          </Link>
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
