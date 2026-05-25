import { buildApiUrl } from './apiBase';

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

async function request(path, options = {}) {
  const res = await fetch(buildApiUrl(path), options);
  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Falha na requisição (${res.status})`;
    throw new Error(msg);
  }

  return data;
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
