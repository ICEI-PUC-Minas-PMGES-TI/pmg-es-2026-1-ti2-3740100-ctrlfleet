import { formatBrDate } from './usuarioMappers';

import { apiFetch, parseApiResponse } from './apiBase';

function formatTimestamp(value) {
  if (!value) return '-';
  const [datePart, timePart = ''] = value.split('T');
  const date = formatBrDate(datePart);
  const time = timePart.slice(0, 5);
  return time ? `${date}, ${time}` : date;
}

/**
 * @param {{ page?: number, pageSize?: number, signal?: AbortSignal }} [options] `page` é 1-indexado.
 * @returns {Promise<{ items: Array<object>, totalItems: number, page: number, totalPages: number }>}
 */
export async function listarAuditoria({ page = 1, pageSize = 5, signal } = {}) {
  const params = new URLSearchParams({ page: String(page - 1), size: String(pageSize) });
  const res = await apiFetch(`/auditoria?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = await parseApiResponse(res);
  const content = Array.isArray(data?.content) ? data.content : [];

  return {
    items: content.map((event) => ({
      id: event.id,
      action: event.acao,
      actor: event.ator,
      date: formatTimestamp(event.criadoEm),
      detail: event.detalhe,
      ip: event.ip || '-',
      severity: event.severidade || 'info',
      status: event.status || 'Ativo',
      target: event.alvo || '-',
    })),
    totalItems: data?.totalElements ?? 0,
    page: (data?.page ?? 0) + 1,
    totalPages: data?.totalPages ?? 1,
  };
}
