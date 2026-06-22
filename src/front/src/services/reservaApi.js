import { apiFetch, parseApiResponse } from './apiBase';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
}

/**
 * @param {{ page?: number, pageSize?: number, idUsuario?: number, signal?: AbortSignal }} [options] `page` é 1-indexado.
 * @returns {Promise<{ items: Array<object>, totalItems: number, page: number, totalPages: number }>}
 */
export async function listarReservas(status, options = {}) {
  const { page = 1, pageSize = 20, idUsuario, signal } = options;
  const params = new URLSearchParams({ page: String(page - 1), size: String(pageSize) });
  if (status) params.set('status', status);
  if (idUsuario != null) params.set('idUsuario', String(idUsuario));
  const data = await request(`/reservas?${params}`, { signal });
  return {
    items: Array.isArray(data?.content) ? data.content : [],
    totalItems: data?.totalElements ?? 0,
    page: (data?.page ?? 0) + 1,
    totalPages: data?.totalPages ?? 1,
  };
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
