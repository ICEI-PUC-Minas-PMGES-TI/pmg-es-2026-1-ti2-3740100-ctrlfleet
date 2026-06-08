import { getMotoristaHomePathFromSession, getMotoristaIdFromSession } from './authSession';

const STORAGE_KEY = 'ctrlfleet:motoristaId';

export function getCurrentMotoristaId() {
  const fromSession = getMotoristaIdFromSession();
  if (fromSession) return fromSession;

  if (typeof window === 'undefined') return null;

  const storedId = Number(window.localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(storedId) && storedId > 0 ? storedId : null;
}

export function setCurrentMotoristaId(motoristaId) {
  if (typeof window === 'undefined') return;

  const normalizedId = Number(motoristaId);
  if (Number.isFinite(normalizedId) && normalizedId > 0) {
    window.localStorage.setItem(STORAGE_KEY, String(normalizedId));
  }
}

export function getMotoristaHomePath() {
  return getMotoristaHomePathFromSession();
}
