import { apiFetch, parseApiResponse } from './apiBase';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
}

export async function listarReservasAprovadasMotorista(motoristaId, options = {}) {
  return request(`/motoristas/${motoristaId}/reservas/aprovadas`, {
    signal: options.signal,
  });
}

export async function listarReservasEmUsoMotorista(motoristaId, options = {}) {
  return request(`/motoristas/${motoristaId}/reservas/em-uso`, {
    signal: options.signal,
  });
}

export async function listarHistoricoMotorista(motoristaId, options = {}) {
  return request(`/motoristas/${motoristaId}/historico`, {
    signal: options.signal,
  });
}

export async function listarChecklistSaida(options = {}) {
  return request('/motoristas/checklists/saida', {
    signal: options.signal,
  });
}

export async function iniciarTrajeto(reservaId, payload) {
  return request(`/motoristas/reservas/${reservaId}/iniciar-trajeto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function finalizarTrajeto(reservaId, payload) {
  return request(`/motoristas/reservas/${reservaId}/finalizar-trajeto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
