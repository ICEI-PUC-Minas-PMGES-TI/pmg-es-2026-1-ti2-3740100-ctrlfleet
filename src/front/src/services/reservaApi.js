function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://127.0.0.1:8080';
  return '';
}

function requestUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : `/api${p}`;
}

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

async function request(path, options = {}) {
  const res = await fetch(requestUrl(path), options);
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

export async function listarReservas(status, options = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (options.idUsuario != null) params.set('idUsuario', String(options.idUsuario));
  const query = params.toString() ? `?${params}` : '';
  return request(`/reservas${query}`, { signal: options.signal });
}

export async function cancelarReserva(reservaId, payload = {}) {
  return request(`/reservas/${reservaId}/cancelar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function criarReserva(payload) {
  return request('/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function aprovarReserva(reservaId, payload = {}) {
  return request(`/reservas/${reservaId}/aprovar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function reprovarReserva(reservaId, payload = {}) {
  return request(`/reservas/${reservaId}/reprovar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
