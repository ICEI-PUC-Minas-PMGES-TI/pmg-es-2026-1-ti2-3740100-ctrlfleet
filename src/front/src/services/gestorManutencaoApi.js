import { apiFetch, parseApiResponse } from './apiBase';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
}

export async function listarPainelManutencaoGestor(options = {}) {
  return request('/gestor/manutencoes', { signal: options.signal });
}

export async function contarManutencoesPendentes(options = {}) {
  const data = await request('/gestor/manutencoes/contagem', { signal: options.signal });
  return data?.pendentes ?? 0;
}

export async function aprovarManutencao(manutencaoId, payload = {}) {
  return request(`/gestor/manutencoes/${manutencaoId}/aprovar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function reprovarManutencao(manutencaoId, payload = {}) {
  return request(`/gestor/manutencoes/${manutencaoId}/reprovar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function definirPrioridadeManutencao(manutencaoId, payload = {}) {
  return request(`/gestor/manutencoes/${manutencaoId}/prioridade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
