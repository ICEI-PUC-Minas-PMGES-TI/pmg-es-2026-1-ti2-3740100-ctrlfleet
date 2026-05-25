import { apiFetch, parseApiResponse } from './apiBase';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
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

export async function excluirReservaDoHistorico(reservaId, options = {}) {
  const params = new URLSearchParams();
  if (options.idUsuario != null) params.set('idUsuario', String(options.idUsuario));
  const query = params.toString() ? `?${params}` : '';
  return request(`/reservas/${reservaId}${query}`, { method: 'DELETE' });
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
