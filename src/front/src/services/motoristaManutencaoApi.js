import { apiFetch, parseApiResponse } from './apiBase';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
}

export async function listarPainelManutencaoMotorista(motoristaId, options = {}) {
  return request(`/motoristas/${motoristaId}/manutencoes`, { signal: options.signal });
}

export async function solicitarManutencaoMotorista(motoristaId, payload, options = {}) {
  return request(`/motoristas/${motoristaId}/manutencoes/solicitar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: options.signal,
  });
}
