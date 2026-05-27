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

export async function listarReservasConcluidasMotorista(motoristaId, options = {}) {
  return request(`/motoristas/${motoristaId}/reservas/concluidas`, {
    signal: options.signal,
  });
}

export const listarReservasAprovadas = listarReservasAprovadasMotorista;
export const listarReservasEmUso = listarReservasEmUsoMotorista;

export const listarReservasConcluidas = listarReservasConcluidasMotorista;

export async function buscarReservaMotorista(motoristaId, reservaId, options = {}) {
  const [aprovadas, emUso, concluidas] = await Promise.all([
    listarReservasAprovadasMotorista(motoristaId, options),
    listarReservasEmUsoMotorista(motoristaId, options),
    listarReservasConcluidasMotorista(motoristaId, options),
  ]);
  return [...(emUso || []), ...(aprovadas || []), ...(concluidas || [])].find(
    (item) => String(item.idReserva) === String(reservaId),
  ) ?? null;
}

export async function registrarChecklistSaida(reservaId, payload) {
  return request(`/motoristas/reservas/${reservaId}/registrar-checklist-saida`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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

export async function listarChecklistRetorno(options = {}) {
  return request('/motoristas/checklists/retorno', {
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
