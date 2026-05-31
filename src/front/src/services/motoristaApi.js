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

export async function obterStatusChecklistSaida(reservaId, motoristaId, options = {}) {
  const params = new URLSearchParams({ idMotorista: String(motoristaId) });
  return request(`/motoristas/reservas/${reservaId}/checklist-saida/status?${params}`, {
    signal: options.signal,
  });
}

export async function obterStatusChecklistRetorno(reservaId, motoristaId, options = {}) {
  const params = new URLSearchParams({ idMotorista: String(motoristaId) });
  return request(`/motoristas/reservas/${reservaId}/checklist-retorno/status?${params}`, {
    signal: options.signal,
  });
}

export async function buscarChecklistPorTipo(tipoId, options = {}) {
  return request(`/motoristas/checklists/tipos/${tipoId}`, { signal: options.signal });
}

export async function registrarChecklistParcialSaida(reservaId, tipoId, payload) {
  return request(`/motoristas/reservas/${reservaId}/checklist-saida/tipos/${tipoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function registrarChecklistParcialRetorno(reservaId, tipoId, payload) {
  return request(`/motoristas/reservas/${reservaId}/checklist-retorno/tipos/${tipoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function registrarQuilometragemSaida(reservaId, payload) {
  return request(`/motoristas/reservas/${reservaId}/checklist-saida/quilometragem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function registrarChecklistSaidaFinal(reservaId, motoristaId) {
  const params = new URLSearchParams({ idMotorista: String(motoristaId) });
  return request(`/motoristas/reservas/${reservaId}/checklist-saida/registrar?${params}`, {
    method: 'POST',
  });
}

export async function registrarQuilometragemRetorno(reservaId, payload) {
  return request(`/motoristas/reservas/${reservaId}/checklist-retorno/quilometragem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function registrarQuilometragemRetornoAutomatica(reservaId, payload) {
  return request(`/motoristas/reservas/${reservaId}/checklist-retorno/quilometragem-automatica`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function registrarChecklistRetornoFinal(reservaId, motoristaId) {
  const params = new URLSearchParams({ idMotorista: String(motoristaId) });
  return request(`/motoristas/reservas/${reservaId}/checklist-retorno/registrar?${params}`, {
    method: 'POST',
  });
}

export async function concluirViagemChecklistRetorno(reservaId, payload) {
  return request(`/motoristas/reservas/${reservaId}/checklist-retorno/concluir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function obterHistoricoViagemReserva(reservaId, motoristaId, options = {}) {
  const params = new URLSearchParams({ idMotorista: String(motoristaId) });
  return request(`/motoristas/reservas/${reservaId}/viagem-historico?${params}`, {
    signal: options.signal,
  });
}

/** @deprecated Use registrarChecklistParcialSaida por tipo */
export async function registrarChecklistSaida(reservaId, payload) {
  return registrarChecklistParcialSaida(reservaId, payload.tipoId, payload);
}

export async function listarHistoricoMotorista(motoristaId, options = {}) {
  return request(`/motoristas/${motoristaId}/historico`, {
    signal: options.signal,
  });
}

/** @deprecated Use buscarChecklistPorTipo */
export async function listarChecklistSaida(options = {}) {
  return request('/motoristas/checklists/tipos/4', { signal: options.signal });
}

/** @deprecated Use buscarChecklistPorTipo */
export async function listarChecklistRetorno(options = {}) {
  return request('/motoristas/checklists/tipos/8', { signal: options.signal });
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
