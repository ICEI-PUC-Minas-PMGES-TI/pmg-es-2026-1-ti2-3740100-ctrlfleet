const STORAGE_KEY = 'ctrlfleet:active-fleet-trips';
const SIMULATION_MS_KEY_PREFIX = 'ctrlfleet:simulation-ms:';
const CHANGE_EVENT = 'ctrlfleet:active-trips-changed';
const STALE_MS = 24 * 60 * 60 * 1000;

export const FLEET_SIMULATION_DURATION_OPTIONS = [
  { id: '30s', label: '30 s', ms: 30_000 },
  { id: '1m', label: '1 min', ms: 60_000 },
  { id: '2m', label: '2 min', ms: 120_000 },
  { id: '3m', label: '3 min', ms: 180_000 },
  { id: '4m', label: '4 min', ms: 240_000 },
  { id: '5m', label: '5 min', ms: 300_000 },
];

export const DEFAULT_FLEET_SIMULATION_MS = FLEET_SIMULATION_DURATION_OPTIONS[1].ms;

export function formatSimulationDurationLabel(ms) {
  return (
    FLEET_SIMULATION_DURATION_OPTIONS.find((option) => option.ms === ms)?.label ||
    `${Math.round(ms / 1000)} s`
  );
}

export function readSimulationDurationMs(reservaId, fallback = DEFAULT_FLEET_SIMULATION_MS) {
  if (typeof window === 'undefined' || !reservaId) return fallback;
  try {
    const raw = window.sessionStorage.getItem(`${SIMULATION_MS_KEY_PREFIX}${reservaId}`);
    if (!raw) return fallback;
    const ms = Number(raw);
    return FLEET_SIMULATION_DURATION_OPTIONS.some((option) => option.ms === ms) ? ms : fallback;
  } catch {
    return fallback;
  }
}

export function writeSimulationDurationMs(reservaId, ms) {
  if (typeof window === 'undefined' || !reservaId) return;
  try {
    window.sessionStorage.setItem(`${SIMULATION_MS_KEY_PREFIX}${reservaId}`, String(ms));
  } catch {
    // sessionStorage indisponível
  }
}

function readStore() {
  if (typeof window === 'undefined') return { trips: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { trips: {} };
    const parsed = JSON.parse(raw);
    return parsed?.trips ? parsed : { trips: {} };
  } catch {
    return { trips: {} };
  }
}

function writeStore(store) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: store }));
}

function pruneStaleTrips(trips) {
  const now = Date.now();
  const next = { ...trips };
  Object.entries(next).forEach(([key, trip]) => {
    const updatedAt = trip?.updatedAt ?? trip?.simulationStartedAt ?? trip?.tripStartedAt ?? 0;
    if (now - updatedAt > STALE_MS) {
      delete next[key];
    }
  });
  return next;
}

const TERMINAL_TRIP_STATUSES = new Set(['finished']);

export function resolveLiveTripProgress(trip) {
  if (!trip) return 0;
  if (trip.status === 'finished') return 1;
  if (trip.status === 'arrived') return 1;
  if (trip.status === 'returned' || trip.status === 'awaiting_checklist') return 1;

  const stored = Math.min(1, Math.max(0, trip.progress ?? 0));
  const startedAt = trip.simulationStartedAt ?? trip.tripStartedAt;
  const durationMs = trip.simulationDurationMs ?? DEFAULT_FLEET_SIMULATION_MS;
  const isAnimating = trip.status === 'running' || trip.status === 'returning';

  if (!startedAt || !durationMs || !isAnimating) {
    return stored;
  }

  const computed = Math.min(1, Math.max(0, (Date.now() - startedAt) / durationMs));
  return Math.max(stored, computed);
}

export function resolveLiveFleetTrip(trip) {
  if (!trip) return trip;
  const progress = resolveLiveTripProgress(trip);
  let status = trip.status;
  if (trip.status === 'running' && progress >= 1) status = 'arrived';
  if (trip.status === 'returning' && progress >= 1) status = 'returned';
  const tripLeg =
    status === 'returning' || status === 'returned' || status === 'awaiting_checklist'
      ? 'return'
      : trip.tripLeg || 'outbound';
  return { ...trip, progress, status, tripLeg };
}

export function getActiveFleetTrip(reservaId) {
  if (!reservaId) return null;
  const store = readStore();
  const trip = store.trips[String(reservaId)];
  if (!trip || TERMINAL_TRIP_STATUSES.has(trip.status)) return null;
  return resolveLiveFleetTrip(trip);
}

export function getActiveFleetTrips() {
  const store = readStore();
  const trips = pruneStaleTrips(store.trips);
  return Object.values(trips)
    .filter((trip) => trip?.status && !TERMINAL_TRIP_STATUSES.has(trip.status))
    .map(resolveLiveFleetTrip);
}

export function upsertActiveFleetTrip(trip) {
  if (!trip?.reservaId) return;
  const store = readStore();
  const key = String(trip.reservaId);
  const existing = store.trips[key] || {};

  store.trips = pruneStaleTrips({
    ...store.trips,
    [key]: {
      ...existing,
      ...trip,
      reservaId: trip.reservaId,
      updatedAt: Date.now(),
    },
  });

  writeStore(store);
}

export function removeActiveFleetTrip(reservaId) {
  if (!reservaId) return;
  const store = readStore();
  delete store.trips[String(reservaId)];
  writeStore(store);
}

export function subscribeActiveFleetTrips(callback) {
  if (typeof window === 'undefined') return () => {};

  const onCustom = () => callback(getActiveFleetTrips());
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) onCustom();
  };

  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

export function buildActiveFleetTripPayload({
  reserva,
  reservaId,
  routePositions = [],
  progress = 0,
  simulationDurationMs = DEFAULT_FLEET_SIMULATION_MS,
  tripStartedAt,
  simulationStartedAt,
  status = 'running',
  tripLeg = 'outbound',
  origemCoords,
  destinoCoords,
  motoristaNome,
}) {
  const resolvedReservaId = reserva?.idReserva ?? reservaId;

  return {
    reservaId: resolvedReservaId,
    vehicleId: reserva?.idVeiculo ?? null,
    placaVeiculo: reserva?.placaVeiculo ?? null,
    modeloVeiculo: reserva?.modeloVeiculo ?? null,
    origem: reserva?.origem ?? null,
    destino: reserva?.destino ?? null,
    origemCoords: origemCoords ?? null,
    destinoCoords: destinoCoords ?? null,
    routePositions: Array.isArray(routePositions) ? routePositions : [],
    progress,
    simulationDurationMs,
    tripStartedAt: tripStartedAt ?? Date.now(),
    simulationStartedAt: simulationStartedAt ?? null,
    status,
    tripLeg,
    motoristaNome: motoristaNome || null,
  };
}
