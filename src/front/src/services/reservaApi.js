/**
 * Cliente HTTP para o recurso `/reservas` do backend.
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

function errorMessage(data, fallback) {
  return (
    (data && typeof data.mensagem === 'string' && data.mensagem) ||
    (data && typeof data.message === 'string' && data.message) ||
    fallback
  );
}

export async function listarReservas({ signal } = {}) {
  const res = await fetch(requestUrl('/reservas'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    throw new Error(errorMessage(data, `Não foi possível carregar reservas (${res.status})`));
  }

  return Array.isArray(data) ? data : [];
}

export async function criarReserva(payload) {
  const res = await fetch(requestUrl('/reservas'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    throw new Error(errorMessage(data, `Não foi possível salvar reserva (${res.status})`));
  }

  return data;
}
