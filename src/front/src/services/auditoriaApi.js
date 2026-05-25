import { formatBrDate } from './usuarioMappers';

import { buildApiUrl } from './apiBase';

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

function formatTimestamp(value) {
  if (!value) return '-';
  const [datePart, timePart = ''] = value.split('T');
  const date = formatBrDate(datePart);
  const time = timePart.slice(0, 5);
  return time ? `${date}, ${time}` : date;
}

export async function listarAuditoria({ acao, severidade, ator, signal } = {}) {
  const params = new URLSearchParams();
  if (acao)      params.set('acao', acao);
  if (severidade) params.set('severidade', severidade);
  if (ator)      params.set('ator', ator);
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(buildApiUrl('/auditoria') + query, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível carregar a auditoria (${res.status})`;
    throw new Error(msg);
  }

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
