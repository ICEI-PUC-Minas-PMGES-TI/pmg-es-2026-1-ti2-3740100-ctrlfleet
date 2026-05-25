import { coordsFromReservation } from '../utils/resolveReservationCoords';

export const REQUESTER_STATUS_LABELS = {
  SOLICITADA: 'Solicitada',
  APROVADA: 'Aprovada',
  EM_USO: 'Em uso',
  CONCLUIDA: 'Concluída',
  REPROVADA: 'Reprovada',
  CANCELADA: 'Cancelada',
};

export function formatRequesterDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function mapRequesterReservation(reservation) {
  const statusKey = reservation.statusReserva ?? 'SOLICITADA';
  const { origemCoords, destinoCoords } = coordsFromReservation(reservation);

  return {
    rawId: reservation.idReserva,
    dataHoraFimEstimada: formatRequesterDateTime(reservation.dataHoraFimEstimada),
    dataHoraInicioPrevista: formatRequesterDateTime(reservation.dataHoraInicioPrevista),
    dataHoraSolicitacao: formatRequesterDateTime(reservation.dataHoraSolicitacao),
    inicioPrevistoRaw: reservation.dataHoraInicioPrevista,
    solicitacaoRaw: reservation.dataHoraSolicitacao,
    destino: reservation.destino,
    destinoLat: reservation.destinoLat,
    destinoLng: reservation.destinoLng,
    destinoCoords,
    idReserva: reservation.idReserva,
    justificativa: reservation.justificativa,
    origem: reservation.origem,
    origemLat: reservation.origemLat,
    origemLng: reservation.origemLng,
    origemCoords,
    statusKey,
    statusLabel: REQUESTER_STATUS_LABELS[statusKey] ?? statusKey,
    veiculo: `${reservation.placaVeiculo} — ${reservation.modeloVeiculo}`,
  };
}

export function parseReservationDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
