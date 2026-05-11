/**
 * Cliente HTTP para o recurso `/veiculos` do backend.
 *
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
  const res = await fetch(requestUrl('/veiculos'), {
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
