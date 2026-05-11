/**
 * Em desenvolvimento usa URL direta do Spring Boot (evita 502 do proxy quando o
 * backend não está acessível via `localhost` ou está desligado).
 * Em produção: defina `VITE_API_BASE_URL` no build ou use `/api` com reverse proxy.
 */
function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8080';
  }
  return '';
}

function requestUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  if (base) {
    return `${base}${p}`;
  }
  return `/api${p}`;
}

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

/**
 * @param {Record<string, unknown>} payload corpo alinhado ao `UsuarioRequestDTO` do backend
 * @returns {Promise<{ id: number, nome: string, email: string }>}
 */
export async function criarUsuario(payload) {
  const res = await fetch(requestUrl('/usuarios'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível cadastrar (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export async function buscarUsuario(id, { signal } = {}) {
  const res = await fetch(requestUrl(`/usuarios/${id}`), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível carregar o usuário (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export async function atualizarUsuario(id, payload) {
  const res = await fetch(requestUrl(`/usuarios/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível atualizar o usuário (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export async function desativarUsuario(id) {
  const res = await fetch(requestUrl(`/usuarios/${id}/desativar`), {
    method: 'PATCH',
    headers: { Accept: 'application/json' },
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível inativar o usuário (${res.status})`;
    throw new Error(msg);
  }

  return data;
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
  const res = await fetch(requestUrl('/usuarios'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível carregar a lista de usuários (${res.status})`;
    throw new Error(msg);
  }

  return Array.isArray(data) ? data : [];
}

async function acaoUsuario(id, path, method = 'PATCH') {
  const res = await fetch(requestUrl(`/usuarios/${id}${path}`), {
    method,
    headers: { Accept: 'application/json' },
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível concluir a ação (${res.status})`;
    throw new Error(msg);
  }

  return data;
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
