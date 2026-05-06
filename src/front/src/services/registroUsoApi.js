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
 * Lista todos os registros de uso de um veículo, ordenados por data mais recente.
 * @param {number|string} veiculoId
 * @returns {Promise<Array>}
 */
export async function listarRegistrosPorVeiculo(veiculoId) {
  const res = await fetch(requestUrl(`/registros-uso/veiculo/${veiculoId}`));

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível carregar registros de uso (${res.status})`;
    throw new Error(msg);
  }

  return data || [];
}

/**
 * Gera o registro de uso ao finalizar a corrida.
 * @param {Record<string, unknown>} payload corpo alinhado ao `FinalizarCorridaRequestDTO`
 * @returns {Promise<object>}
 */
export async function finalizarCorrida(payload) {
  const res = await fetch(requestUrl('/registros-uso/finalizar'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível finalizar corrida (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
