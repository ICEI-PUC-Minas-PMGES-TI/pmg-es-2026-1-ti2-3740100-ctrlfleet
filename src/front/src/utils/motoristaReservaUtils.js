export const STATUS_RESERVA_LABELS = {
  APROVADA: 'Aprovada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
  EM_USO: 'Em uso',
  REPROVADA: 'Reprovada',
  SOLICITADA: 'Solicitada',
};

/** Datas da API vêm sem fuso (horário de Brasília) — evita interpretar como UTC no navegador. */
export function parseReservaDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const text = String(value).trim();
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(text)) {
    return new Date(text);
  }
  const normalized = text.includes('T') ? text : text.replace(' ', 'T');
  const [datePart, timePart = '00:00:00'] = normalized.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map((part) => Number(part));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, hour, minute, second);
}

export function formatDateTime(value) {
  const parsed = parseReservaDateTime(value);
  if (!parsed) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

export function formatKm(value) {
  if (value == null) return 'Sem registro';
  return `${Number(value).toLocaleString('pt-BR')} km`;
}

export function formatStatusReserva(status) {
  return STATUS_RESERVA_LABELS[status] || status || '—';
}

export const CHECKLIST_WINDOW_MINUTES = 15;

export function getChecklistStartWindow(value) {
  const startsAt = parseReservaDateTime(value);
  if (!startsAt) return null;
  return new Date(startsAt.getTime() - CHECKLIST_WINDOW_MINUTES * 60 * 1000);
}

export function isReservationExpired(reserva) {
  const endsAt = parseReservaDateTime(reserva?.dataHoraFimEstimada);
  if (!endsAt) return false;
  return Date.now() > endsAt.getTime();
}

export function canOpenChecklistSaida(reserva) {
  if (!reserva?.dataHoraInicioPrevista) return false;
  if (Boolean(reserva.checklistSaidaConcluido)) return false;
  if (isReservationExpired(reserva)) return false;

  const now = new Date();
  const windowStart = getChecklistStartWindow(reserva.dataHoraInicioPrevista);
  if (!windowStart) return false;
  return now >= windowStart;
}

export function canStartTrip(reserva) {
  if (!Boolean(reserva?.checklistSaidaConcluido)) return false;
  if (reserva.statusReserva !== 'APROVADA') return false;
  if (isReservationExpired(reserva)) return false;
  return true;
}

export function getChecklistWindowMessage(reserva) {
  if (!reserva?.dataHoraInicioPrevista) return null;
  if (reserva.statusReserva === 'CONCLUIDA' || reserva.statusReserva === 'EM_USO') {
    return null;
  }
  const now = new Date();
  const windowStart = getChecklistStartWindow(reserva.dataHoraInicioPrevista);

  if (Boolean(reserva.checklistSaidaConcluido)) {
    return null;
  }

  if (isReservationExpired(reserva)) {
    return 'Horário previsto encerrado — fale com a frota.';
  }

  if (now < windowStart) {
    return `Checklist liberado a partir de ${formatDateTime(windowStart)} (15 min antes da saída prevista).`;
  }
  return null;
}

export const DATE_RANGE_FILTERS = [
  { id: 'all', label: 'Todas as datas' },
  { id: '7d', label: 'Última semana', days: 7 },
  { id: '30d', label: 'Último mês', days: 30 },
  { id: '90d', label: 'Últimos 3 meses', days: 90 },
  { id: '180d', label: 'Últimos 6 meses', days: 180 },
];

export const MOTORISTA_RESERVA_SORT_KEY = 'motorista.reservaSortOrder';
export const MOTORISTA_REGISTRO_SORT_KEY = 'motorista.registroSortOrder';
export const MOTORISTA_REGISTRO_VIEW_KEY = 'motorista.registroViewMode';

export const RESERVA_SORT_FILTERS = [
  { id: 'newest', label: 'Mais recentes' },
  { id: 'oldest', label: 'Mais antigas' },
  { id: 'destino-asc', label: 'Destino (A–Z)' },
  { id: 'km-desc', label: 'Maior KM percorrida' },
];

export const REGISTRO_SORT_FILTERS = [
  { id: 'newest', label: 'Mais recentes' },
  { id: 'oldest', label: 'Mais antigas' },
];

export const REGISTRO_VIEW_FILTERS = [
  { id: 'registros', label: 'Por registro' },
  { id: 'completo', label: 'Histórico completo' },
];

/** @deprecated Use RESERVA_SORT_FILTERS ou REGISTRO_SORT_FILTERS */
export const CHRONOLOGICAL_SORT_FILTERS = REGISTRO_SORT_FILTERS;

function getReservaSortTime(reserva) {
  return (
    parseReservaDateTime(reserva?.dataHoraInicioPrevista)?.getTime() ??
    parseReservaDateTime(reserva?.dataHoraSolicitacao)?.getTime() ??
    0
  );
}

function getReservaReferenceDate(reserva) {
  return (
    parseReservaDateTime(reserva?.dataHoraFimEstimada) ??
    parseReservaDateTime(reserva?.dataHoraInicioPrevista) ??
    parseReservaDateTime(reserva?.dataHoraSolicitacao)
  );
}

function getRegistroSortTime(registro) {
  return (
    parseReservaDateTime(registro?.dataSaida)?.getTime() ??
    parseReservaDateTime(registro?.dataRetorno)?.getTime() ??
    0
  );
}

export function getReservaKmPercorrida(reserva) {
  if (reserva?.quilometragemPercorridaTrajeto != null) {
    return Number(reserva.quilometragemPercorridaTrajeto);
  }
  const saida = reserva?.quilometragemSaidaTrajeto;
  const retorno = reserva?.quilometragemRetornoTrajeto;
  if (saida != null && retorno != null) {
    return Math.max(0, Number(retorno) - Number(saida));
  }
  return null;
}

export function readStoredSortOrder(storageKey, filters, fallback) {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored && filters.some((item) => item.id === stored)) {
      return stored;
    }
  } catch {
    // sessionStorage indisponível
  }
  return fallback;
}

export function writeStoredSortOrder(storageKey, order) {
  try {
    sessionStorage.setItem(storageKey, order);
  } catch {
    // sessionStorage indisponível
  }
}

export function filterReservasByDateRange(reservas, rangeId) {
  const range = DATE_RANGE_FILTERS.find((item) => item.id === rangeId);
  if (!range?.days) return reservas;

  const cutoff = Date.now() - range.days * 24 * 60 * 60 * 1000;
  return reservas.filter((reserva) => {
    const status = reserva?.statusReserva || reserva?.status;
    if (status === 'APROVADA' || status === 'EM_USO') return true;

    const tripDate = getReservaReferenceDate(reserva)?.getTime();
    return tripDate != null && tripDate >= cutoff;
  });
}

export function sortReservasNewestFirst(reservas) {
  return [...reservas].sort((a, b) => {
    const dateA = getReservaSortTime(a);
    const dateB = getReservaSortTime(b);
    if (dateB !== dateA) return dateB - dateA;
    return Number(b.idReserva || 0) - Number(a.idReserva || 0);
  });
}

export function sortReservasOldestFirst(reservas) {
  return [...reservas].sort((a, b) => {
    const dateA = getReservaSortTime(a);
    const dateB = getReservaSortTime(b);
    if (dateA !== dateB) return dateA - dateB;
    return Number(a.idReserva || 0) - Number(b.idReserva || 0);
  });
}

function sortReservasByDestino(reservas) {
  return [...reservas].sort((a, b) => {
    const destA = (a.destino || '').localeCompare(b.destino || '', 'pt-BR', { sensitivity: 'base' });
    if (destA !== 0) return destA;
    return getReservaSortTime(b) - getReservaSortTime(a);
  });
}

function sortReservasByKmDesc(reservas) {
  return [...reservas].sort((a, b) => {
    const kmA = getReservaKmPercorrida(a) ?? -1;
    const kmB = getReservaKmPercorrida(b) ?? -1;
    if (kmB !== kmA) return kmB - kmA;
    return getReservaSortTime(b) - getReservaSortTime(a);
  });
}

export function sortRegistrosOldestFirst(registros) {
  return [...registros].sort((a, b) => {
    const dateA = getRegistroSortTime(a);
    const dateB = getRegistroSortTime(b);
    if (dateA !== dateB) return dateA - dateB;
    return Number(a.idUso || a.id || 0) - Number(b.idUso || b.id || 0);
  });
}

export function sortRegistrosNewestFirst(registros) {
  return [...registros].sort((a, b) => {
    const dateA = getRegistroSortTime(a);
    const dateB = getRegistroSortTime(b);
    if (dateB !== dateA) return dateB - dateA;
    return Number(b.idUso || b.id || 0) - Number(a.idUso || a.id || 0);
  });
}

export function sortReservasByOrder(reservas, order = 'newest') {
  switch (order) {
    case 'oldest':
      return sortReservasOldestFirst(reservas);
    case 'destino-asc':
      return sortReservasByDestino(reservas);
    case 'km-desc':
      return sortReservasByKmDesc(reservas);
    case 'newest':
    default:
      return sortReservasNewestFirst(reservas);
  }
}

export function sortRegistrosByOrder(registros, order = 'newest') {
  return order === 'oldest' ? sortRegistrosOldestFirst(registros) : sortRegistrosNewestFirst(registros);
}

export function buildChronologicalNumbers(items, getKey, sortOldestFirst) {
  return new Map(sortOldestFirst(items).map((item, index) => [getKey(item), index + 1]));
}

export function getSortOrderLabel(order, filters = RESERVA_SORT_FILTERS) {
  return filters.find((item) => item.id === order)?.label ?? filters[0]?.label ?? '';
}

/** @deprecated Use getSortOrderLabel */
export function getChronologicalSortLabel(order) {
  return getSortOrderLabel(order, REGISTRO_SORT_FILTERS);
}

export function hasReservationCoords(reserva) {
  const latOk = (v) => v != null && v !== '' && Number.isFinite(Number(v));
  return (
    latOk(reserva?.origemLat) &&
    latOk(reserva?.origemLng) &&
    latOk(reserva?.destinoLat) &&
    latOk(reserva?.destinoLng)
  );
}
