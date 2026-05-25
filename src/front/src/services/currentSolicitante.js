const FALLBACK_SOLICITANTE_ID = 10;
const FALLBACK_MATRICULA = 'MAT-0010';
const ID_STORAGE_KEY = 'ctrlfleet:solicitanteId';
const MATRICULA_STORAGE_KEY = 'ctrlfleet:solicitanteMatricula';

export function getCurrentSolicitanteId() {
  if (typeof window === 'undefined') return FALLBACK_SOLICITANTE_ID;

  const storedId = Number(window.localStorage.getItem(ID_STORAGE_KEY));
  return Number.isFinite(storedId) && storedId > 0 ? storedId : FALLBACK_SOLICITANTE_ID;
}

export function getCurrentSolicitanteMatricula() {
  if (typeof window === 'undefined') return FALLBACK_MATRICULA;

  const stored = window.localStorage.getItem(MATRICULA_STORAGE_KEY);
  return stored && stored.trim() !== '' ? stored.trim() : FALLBACK_MATRICULA;
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
