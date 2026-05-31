import { parseReservaDateTime } from './motoristaReservaUtils';

function buildChronologicalUserNumbers(items, getKey, getSortTime) {
  const sorted = [...items].sort((a, b) => {
    const timeA = getSortTime(a) ?? 0;
    const timeB = getSortTime(b) ?? 0;
    if (timeA !== timeB) return timeA - timeB;
    return Number(getKey(a) || 0) - Number(getKey(b) || 0);
  });

  return new Map(sorted.map((item, index) => [getKey(item), index + 1]));
}

export function getMotoristaViagemSortTime(item) {
  return (
    parseReservaDateTime(item?.dataSaida)?.getTime() ??
    parseReservaDateTime(item?.dataHoraInicioPrevista)?.getTime() ??
    parseReservaDateTime(item?.dataHoraSolicitacao)?.getTime() ??
    0
  );
}

export function getSolicitanteReservaSortTime(item) {
  return (
    parseReservaDateTime(item?.solicitacaoRaw)?.getTime() ??
    parseReservaDateTime(item?.dataHoraSolicitacao)?.getTime() ??
    parseReservaDateTime(item?.inicioPrevistoRaw)?.getTime() ??
    parseReservaDateTime(item?.dataHoraInicioPrevista)?.getTime() ??
    0
  );
}

/** Numera viagens do motorista (1 = mais antiga entre as vinculadas a ele). */
export function buildMotoristaViagemNumbers(items) {
  return buildChronologicalUserNumbers(
    (items || []).filter((item) => item?.idReserva != null),
    (item) => item.idReserva,
    getMotoristaViagemSortTime,
  );
}

/** Numera reservas do solicitante (1 = primeira solicitação). */
export function buildSolicitanteReservaNumbers(items) {
  return buildChronologicalUserNumbers(
    (items || []).filter((item) => item?.idReserva != null),
    (item) => item.idReserva,
    getSolicitanteReservaSortTime,
  );
}

export function getUserReservaNumber(numbers, idReserva) {
  if (idReserva == null || !numbers?.size) return null;
  return numbers.get(idReserva) ?? numbers.get(Number(idReserva)) ?? null;
}

export function formatViagemLabel(number) {
  if (number == null) return 'Viagem';
  return `Viagem ${number}`;
}

export function formatReservaUsuarioLabel(number) {
  if (number == null) return 'Reserva';
  return `Reserva ${number}`;
}

export function attachSolicitanteReservaNumbers(items) {
  const numbers = buildSolicitanteReservaNumbers(items);
  return items.map((item) => ({
    ...item,
    reservaNumber: getUserReservaNumber(numbers, item.idReserva),
  }));
}
