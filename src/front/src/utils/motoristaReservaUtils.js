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

export function sortReservasNewestFirst(reservas) {
  return [...reservas].sort((a, b) => {
    const dateA = new Date(a.dataHoraInicioPrevista || a.dataHoraSolicitacao || 0).getTime();
    const dateB = new Date(b.dataHoraInicioPrevista || b.dataHoraSolicitacao || 0).getTime();
    if (dateB !== dateA) return dateB - dateA;
    return Number(b.idReserva || 0) - Number(a.idReserva || 0);
  });
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
