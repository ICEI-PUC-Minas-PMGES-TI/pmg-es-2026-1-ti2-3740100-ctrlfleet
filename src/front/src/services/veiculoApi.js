import { apiFetch, parseApiResponse } from './apiBase';

/**
 * Busca todos os veículos cadastrados, ordenados por id ascendente (definido
 * no backend pelo `VeiculoService.listarTodos`).
 *
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Array<{
 *   id: number,
 *   placa: string,
 *   modelo: string,
 *   marca: string,
 *   ano: number,
 *   status: 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO' | 'DESATIVADO',
 * }>>}
 */
export async function listarVeiculos({ signal } = {}) {
  const res = await apiFetch('/veiculos', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = await parseApiResponse(res);
  return Array.isArray(data) ? data : [];
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
