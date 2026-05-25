const FALLBACK_MOTORISTA_ID = 5;
const STORAGE_KEY = 'ctrlfleet:motoristaId';

export function getCurrentMotoristaId() {
  if (typeof window === 'undefined') return FALLBACK_MOTORISTA_ID;

  const storedId = Number(window.localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(storedId) && storedId > 0 ? storedId : FALLBACK_MOTORISTA_ID;
}

export function setCurrentMotoristaId(motoristaId) {
  if (typeof window === 'undefined') return;

  const normalizedId = Number(motoristaId);
  if (Number.isFinite(normalizedId) && normalizedId > 0) {
    window.localStorage.setItem(STORAGE_KEY, String(normalizedId));
  }
}

export function getMotoristaHomePath() {
  return `/motorista/${getCurrentMotoristaId()}`;
}
