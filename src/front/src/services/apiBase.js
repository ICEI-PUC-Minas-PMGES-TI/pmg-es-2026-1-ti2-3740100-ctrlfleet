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
