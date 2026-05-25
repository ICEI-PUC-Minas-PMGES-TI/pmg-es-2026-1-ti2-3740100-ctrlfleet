import { formatBrDate } from './usuarioMappers';

import { apiFetch, parseApiResponse } from './apiBase';

function formatTimestamp(value) {
  if (!value) return '-';
  const [datePart, timePart = ''] = value.split('T');
  const date = formatBrDate(datePart);
  const time = timePart.slice(0, 5);
  return time ? `${date}, ${time}` : date;
}

export async function listarAuditoria({ signal } = {}) {
  const res = await apiFetch('/auditoria', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = await parseApiResponse(res);

  return Array.isArray(data)
    ? data.map((event) => ({
        id: event.id,
        action: event.acao,
        actor: event.ator,
        date: formatTimestamp(event.criadoEm),
        detail: event.detalhe,
        ip: event.ip || '-',
        severity: event.severidade || 'info',
        status: event.status || 'Ativo',
        target: event.alvo || '-',
      }))
    : [];
}
