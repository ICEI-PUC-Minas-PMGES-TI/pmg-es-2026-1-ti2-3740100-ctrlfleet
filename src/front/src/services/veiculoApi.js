import { buildApiUrl } from './apiBase';

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

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
  const res = await fetch(buildApiUrl('/veiculos'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível carregar a lista de veículos (${res.status})`;
    throw new Error(msg);
  }

  return Array.isArray(data) ? data : [];
}

async function requestJson(path, options) {
  const res = await fetch(buildApiUrl(path), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `OperaÃ§Ã£o nÃ£o concluÃ­da (${res.status})`;
    throw new Error(msg);
  }

  return data;
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
