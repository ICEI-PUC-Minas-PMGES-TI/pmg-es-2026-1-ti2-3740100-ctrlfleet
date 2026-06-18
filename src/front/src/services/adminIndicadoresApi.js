import { apiFetch, parseApiResponse } from './apiBase';

export async function obterTodosIndicadores({ signal, inicio, fim } = {}) {
  const params = new URLSearchParams();
  if (inicio) params.set('inicio', inicio);
  if (fim) params.set('fim', fim);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiFetch(`/admin/indicadores${query}`, { signal });
  return parseApiResponse(res);
}
