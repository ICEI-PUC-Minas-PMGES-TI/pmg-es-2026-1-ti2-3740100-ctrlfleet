import { setCurrentMotoristaId } from './currentMotorista';
import { setCurrentSolicitante } from './currentSolicitante';

const SESSION_KEY = 'ctrlfleet:session';

const AREA_ROLES = {
  admin: ['ROLE_ADMINISTRADOR'],
  gestor: ['ROLE_GESTOR_FROTA'],
  motorista: ['ROLE_MOTORISTA'],
  solicitante: ['ROLE_SOLICITANTE'],
};

/**
 * @typedef {{
 *   token: string,
 *   id: number,
 *   nome: string,
 *   email: string,
 *   role: string,
 *   perfilAcesso: string | null,
 *   matricula: string | null,
 *   motoristaId: number | null,
 * }} AuthSession
 */

export function getAuthSession() {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return /** @type {AuthSession} */ (JSON.parse(raw));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const session = getAuthSession();
  return Boolean(session?.token);
}

export function canAccessArea(session, area) {
  if (!session?.role || !area) return false;
  const allowed = AREA_ROLES[area];
  return Array.isArray(allowed) && allowed.includes(session.role);
}

export function getUserInitials(nome) {
  if (!nome || typeof nome !== 'string') return '?';

  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getMotoristaIdFromSession(session = getAuthSession()) {
  if (!session || session.role !== 'ROLE_MOTORISTA') return null;
  const id = session.motoristaId ?? session.id;
  return Number.isFinite(Number(id)) ? Number(id) : null;
}

export function getMotoristaHomePathFromSession() {
  const motoristaId = getMotoristaIdFromSession();
  return motoristaId ? `/motorista/${motoristaId}` : '/login';
}

export function saveAuthSession(session) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem('ctrlfleet:token', session.token);

  if (session.role === 'ROLE_SOLICITANTE') {
    setCurrentSolicitante({ id: session.id, matricula: session.matricula });
  }

  if (session.role === 'ROLE_MOTORISTA') {
    const motoristaId = getMotoristaIdFromSession(session);
    if (motoristaId) setCurrentMotoristaId(motoristaId);
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem('ctrlfleet:token');
  window.localStorage.removeItem('ctrlfleet:solicitanteId');
  window.localStorage.removeItem('ctrlfleet:solicitanteMatricula');
  window.localStorage.removeItem('ctrlfleet:motoristaId');
}

export function getHomePathForSession(session) {
  switch (session.role) {
    case 'ROLE_ADMINISTRADOR':
      return '/admin/dashboard';
    case 'ROLE_GESTOR_FROTA':
      return '/gestor/dashboard';
    case 'ROLE_MOTORISTA':
      return getMotoristaHomePathFromSession();
    case 'ROLE_SOLICITANTE':
      return '/solicitante/dashboard';
    default:
      return '/login';
  }
}

export function getAreaForRole(role) {
  switch (role) {
    case 'ROLE_ADMINISTRADOR':
      return 'admin';
    case 'ROLE_GESTOR_FROTA':
      return 'gestor';
    case 'ROLE_MOTORISTA':
      return 'motorista';
    case 'ROLE_SOLICITANTE':
      return 'solicitante';
    default:
      return null;
  }
}

export function getAreaLabel(area) {
  switch (area) {
    case 'admin':
      return 'Administração';
    case 'gestor':
      return 'Gestor de Frotas';
    case 'motorista':
      return 'Motorista';
    case 'solicitante':
      return 'Solicitante';
    default:
      return 'CtrlFleet';
  }
}
