export const STATUS_RESERVA_LABELS = {
  APROVADA: 'Aprovada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
  EM_USO: 'Em uso',
  REPROVADA: 'Reprovada',
  SOLICITADA: 'Solicitada',
};

export function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatKm(value) {
  if (value == null) return 'Sem registro';
  return `${Number(value).toLocaleString('pt-BR')} km`;
}

export function formatStatusReserva(status) {
  return STATUS_RESERVA_LABELS[status] || status || '—';
}

export function getChecklistStartWindow(value) {
  if (!value) return null;
  const startsAt = new Date(value);
  return new Date(startsAt.getTime() - 10 * 60 * 1000);
}

export function canOpenChecklistSaida(reserva) {
  if (!reserva?.dataHoraInicioPrevista) return false;
  const now = new Date();
  const windowStart = getChecklistStartWindow(reserva.dataHoraInicioPrevista);
  const endsAt = reserva.dataHoraFimEstimada ? new Date(reserva.dataHoraFimEstimada) : null;
  if (!windowStart) return false;
  if (endsAt && now > endsAt) return false;
  return now >= windowStart;
}

export function getChecklistWindowMessage(reserva) {
  if (!reserva?.dataHoraInicioPrevista) return null;
  const now = new Date();
  const windowStart = getChecklistStartWindow(reserva.dataHoraInicioPrevista);
  const endsAt = reserva.dataHoraFimEstimada ? new Date(reserva.dataHoraFimEstimada) : null;

  if (now < windowStart) {
    return `Checklist liberado a partir de ${formatDateTime(windowStart)}`;
  }
  if (endsAt && now > endsAt) {
    return 'Horário previsto encerrado — fale com a frota.';
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
