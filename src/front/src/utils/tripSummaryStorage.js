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
}
