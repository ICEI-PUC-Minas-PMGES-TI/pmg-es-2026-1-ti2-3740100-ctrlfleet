import { apiFetch, parseApiResponse } from './apiBase';

/**
 * Busca uma página de veículos cadastrados, ordenados por id ascendente.
 *
 * @param {{ page?: number, pageSize?: number, signal?: AbortSignal }} [options] `page` é 1-indexado.
 * @returns {Promise<{ items: Array<object>, totalItems: number, page: number, totalPages: number }>}
 */
export async function listarVeiculos({ page = 1, pageSize = 20, signal } = {}) {
  const params = new URLSearchParams({ page: String(page - 1), size: String(pageSize) });
  const res = await apiFetch(`/veiculos?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = await parseApiResponse(res);
  return {
    items: Array.isArray(data?.content) ? data.content : [],
    totalItems: data?.totalElements ?? 0,
    page: (data?.page ?? 0) + 1,
    totalPages: data?.totalPages ?? 1,
  };
}

async function requestJson(path, options) {
  const res = await apiFetch(path, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  return parseApiResponse(res);
}

export function criarVeiculo(payload) {
  return requestJson('/veiculos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function atualizarVeiculo(id, payload) {
  return requestJson(`/veiculos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function buscarVeiculo(id, { signal } = {}) {
  return requestJson(`/veiculos/${id}`, {
    method: 'GET',
    signal,
  });
}

export function listarManutencoesPorVeiculo(id, { signal } = {}) {
  return requestJson(`/manutencoes/veiculo/${id}`, {
    method: 'GET',
    signal,
  });
}

export function desativarVeiculo(id) {
  return requestJson(`/veiculos/${id}/desativar`, {
    method: 'PATCH',
  });
}

export function cadastrarDocumentacaoVeiculo(id, payload) {
  return requestJson(`/veiculos/${id}/documentacao`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function editarDocumentacaoVeiculo(id, documentoId, payload) {
  return requestJson(`/veiculos/${id}/documentacao/${documentoId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
