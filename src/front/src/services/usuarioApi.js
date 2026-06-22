import { apiFetch, parseApiResponse } from './apiBase';

/**
 * @param {Record<string, unknown>} payload corpo alinhado ao `UsuarioRequestDTO` do backend
 * @returns {Promise<{ id: number, nome: string, email: string }>}
 */
export async function criarUsuario(payload) {
  const res = await apiFetch('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(res);
}

export async function buscarUsuario(id, { signal } = {}) {
  const res = await apiFetch(`/usuarios/${id}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  return parseApiResponse(res);
}

export async function atualizarUsuario(id, payload) {
  const res = await apiFetch(`/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(res);
}

export async function desativarUsuario(id) {
  const res = await apiFetch(`/usuarios/${id}/desativar`, {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });

  return parseApiResponse(res);
}

/**
 * Busca uma página de usuários cadastrados.
 * @param {{ page?: number, pageSize?: number, signal?: AbortSignal }} [options] `page` é 1-indexado.
 * @returns {Promise<{ items: Array<object>, totalItems: number, page: number, totalPages: number }>}
 */
export async function listarUsuarios({ page = 1, pageSize = 20, signal } = {}) {
  const params = new URLSearchParams({ page: String(page - 1), size: String(pageSize) });
  const res = await apiFetch(`/usuarios?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  let data;
  try {
    data = await parseApiResponse(res);
  } catch (error) {
    error.status = res.status;
    throw error;
  }
  return {
    items: Array.isArray(data?.content) ? data.content : [],
    totalItems: data?.totalElements ?? 0,
    page: (data?.page ?? 0) + 1,
    totalPages: data?.totalPages ?? 1,
  };
}

async function acaoUsuario(id, path, method = 'PATCH') {
  const res = await apiFetch(`/usuarios/${id}${path}`, {
    method,
    headers: { Accept: 'application/json' },
  });

  return parseApiResponse(res);
}

export function aprovarUsuario(id) {
  return acaoUsuario(id, '/aprovar');
}

export function recusarUsuario(id) {
  return acaoUsuario(id, '/recusar');
}

export function bloquearUsuario(id) {
  return acaoUsuario(id, '/bloquear');
}

export function reativarUsuario(id) {
  return acaoUsuario(id, '/reativar');
}

export function reenviarConviteUsuario(id) {
  return acaoUsuario(id, '/reenviar-convite', 'POST');
}

export function redefinirSenhaUsuario(id) {
  return acaoUsuario(id, '/redefinir-senha', 'POST');
}
