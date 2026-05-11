import { formatBrDate } from './usuarioMappers';

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

function formatTimestamp(value) {
  if (!value) return '-';
  const [datePart, timePart = ''] = value.split('T');
  const date = formatBrDate(datePart);
  const time = timePart.slice(0, 5);
  return time ? `${date}, ${time}` : date;
}

export async function listarAuditoria({ signal } = {}) {
  const res = await fetch(requestUrl('/auditoria'), {
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
