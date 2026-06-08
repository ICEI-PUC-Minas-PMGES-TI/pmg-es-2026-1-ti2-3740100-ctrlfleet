const PREFIX = 'ctrlfleet:tripSummary:';

export function saveTripSummary(reservaId, summary) {
  if (!reservaId || !summary) return;
  try {
    sessionStorage.setItem(`${PREFIX}${reservaId}`, JSON.stringify(summary));
  } catch {
    /* ignore quota errors */
  }
}

export function loadTripSummary(reservaId) {
  if (!reservaId) return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${reservaId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearTripSummary(reservaId) {
  if (!reservaId) return;
  sessionStorage.removeItem(`${PREFIX}${reservaId}`);
  clearCorridaPhase(reservaId);
}

const PHASE_PREFIX = 'ctrlfleet:corrida-phase:';

/** running | arrived | awaiting_checklist */
export function saveCorridaPhase(reservaId, phase) {
  if (!reservaId || !phase) return;
  try {
    sessionStorage.setItem(`${PHASE_PREFIX}${reservaId}`, phase);
  } catch {
    /* ignore */
  }
}

export function loadCorridaPhase(reservaId) {
  if (!reservaId) return null;
  try {
    return sessionStorage.getItem(`${PHASE_PREFIX}${reservaId}`);
  } catch {
    return null;
  }
}

export function clearCorridaPhase(reservaId) {
  if (!reservaId) return;
  sessionStorage.removeItem(`${PHASE_PREFIX}${reservaId}`);
}

export function isCorridaFinalizada(reservaId) {
  return Boolean(loadTripSummary(reservaId));
}
