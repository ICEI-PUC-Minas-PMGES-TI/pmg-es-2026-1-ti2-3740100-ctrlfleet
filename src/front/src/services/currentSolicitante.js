import { getAuthSession } from './authSession';

const ID_STORAGE_KEY = 'ctrlfleet:solicitanteId';
const MATRICULA_STORAGE_KEY = 'ctrlfleet:solicitanteMatricula';

export function getCurrentSolicitanteId() {
  const session = getAuthSession();
  if (session?.role === 'ROLE_SOLICITANTE' && session.id) {
    return Number(session.id);
  }

  if (typeof window === 'undefined') return null;

  const storedId = Number(window.localStorage.getItem(ID_STORAGE_KEY));
  return Number.isFinite(storedId) && storedId > 0 ? storedId : null;
}

export function getCurrentSolicitanteMatricula() {
  const session = getAuthSession();
  if (session?.role === 'ROLE_SOLICITANTE' && session.matricula) {
    return session.matricula;
  }

  if (typeof window === 'undefined') return null;

  const stored = window.localStorage.getItem(MATRICULA_STORAGE_KEY);
  return stored && stored.trim() !== '' ? stored.trim() : null;
}

export function setCurrentSolicitanteId(solicitanteId) {
  if (typeof window === 'undefined') return;

  const normalizedId = Number(solicitanteId);
  if (Number.isFinite(normalizedId) && normalizedId > 0) {
    window.localStorage.setItem(ID_STORAGE_KEY, String(normalizedId));
  }
}

export function setCurrentSolicitanteMatricula(matricula) {
  if (typeof window === 'undefined') return;
  if (matricula && String(matricula).trim() !== '') {
    window.localStorage.setItem(MATRICULA_STORAGE_KEY, String(matricula).trim());
  }
}

export function setCurrentSolicitante({ id, matricula }) {
  if (id != null) setCurrentSolicitanteId(id);
  if (matricula) setCurrentSolicitanteMatricula(matricula);
}
