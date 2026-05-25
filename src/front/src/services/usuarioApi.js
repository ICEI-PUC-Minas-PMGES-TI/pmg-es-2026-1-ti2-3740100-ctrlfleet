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
 * Busca todos os usuários cadastrados.
 * @returns {Promise<Array<{
 *   id: number,
 *   nome: string,
 *   email: string,
 *   matricula: string | null,
 *   cargo: string | null,
 *   perfilAcesso: string | null,
 *   tipoConta: string | null,
 *   status: string | null,
 *   dataAdmissao: string | null,
 *   dataDesligamento: string | null,
 * }>>}
 */
export async function listarUsuarios({ signal } = {}) {
  const res = await apiFetch('/usuarios', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = await parseApiResponse(res);
  return Array.isArray(data) ? data : [];
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
