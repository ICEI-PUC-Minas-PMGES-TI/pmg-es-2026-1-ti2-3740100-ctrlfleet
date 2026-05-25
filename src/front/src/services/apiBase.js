/**
 * Monta a URL da API. Sem VITE_API_BASE_URL, usa `/api` (proxy do Vite em dev).
 * No Docker, defina VITE_API_PROXY_TARGET=http://backend:8080 no compose.
 */
export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  return '';
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalizedPath}` : `/api${normalizedPath}`;
}

export function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem('ctrlfleet:token');
  return token && token.trim() !== '' ? token.trim() : null;
}

export function buildAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(path, options = {}) {
  const headers = buildAuthHeaders(options.headers || {});
  return fetch(buildApiUrl(path), { ...options, headers });
}

export async function parseApiResponse(res) {
  const data = parseJsonSafely(await res.text());
  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Falha na requisição (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
