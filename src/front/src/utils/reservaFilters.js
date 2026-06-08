export const RESERVA_STATUS_TABS = [
  'Todas',
  'Solicitada',
  'Aprovada',
  'Em uso',
  'Concluída',
  'Reprovada',
  'Cancelada',
];

export const RESERVA_STATUS_FILTER_MAP = {
  Solicitada: 'SOLICITADA',
  Aprovada: 'APROVADA',
  'Em uso': 'EM_USO',
  Concluída: 'CONCLUIDA',
  Reprovada: 'REPROVADA',
  Cancelada: 'CANCELADA',
};

export function resolveReservaStatus(reserva) {
  return reserva?.statusReserva || reserva?.status || '';
}

export function buildReservaStatusTabs(reservas, preferredOrder = RESERVA_STATUS_TABS) {
  const present = new Set((reservas || []).map(resolveReservaStatus).filter(Boolean));
  return preferredOrder.filter(
    (tab) => tab === 'Todas' || (RESERVA_STATUS_FILTER_MAP[tab] && present.has(RESERVA_STATUS_FILTER_MAP[tab])),
  );
}

export function resolveReservaFilterSelection({ status, statusTabs }) {
  return {
    status: statusTabs.includes(status) ? status : 'Todas',
  };
}

export function matchesReservaSearch(reserva, searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (term.length === 0) return true;

  const plate = (reserva.placaVeiculo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const termPlate = term.replace(/[^a-z0-9]/g, '');

  return (
    String(reserva.idReserva || '').includes(term) ||
    (reserva.destino || '').toLowerCase().includes(term) ||
    (reserva.origem || '').toLowerCase().includes(term) ||
    (reserva.placaVeiculo || '').toLowerCase().includes(term) ||
    (termPlate.length > 0 && plate.includes(termPlate)) ||
    (reserva.modeloVeiculo || '').toLowerCase().includes(term) ||
    (reserva.nomeSolicitante || '').toLowerCase().includes(term) ||
    (reserva.matriculaSolicitante || '').toLowerCase().includes(term) ||
    (reserva.justificativa || '').toLowerCase().includes(term)
  );
}

export function filterReservas(reservas, { search = '', status = 'Todas' } = {}) {
  const statusFilter = RESERVA_STATUS_FILTER_MAP[status];

  return (reservas || []).filter((reserva) => {
    const matchesStatus = !statusFilter || resolveReservaStatus(reserva) === statusFilter;
    return matchesStatus && matchesReservaSearch(reserva, search);
  });
}

export function hasActiveReservaFilters({ search = '', status = 'Todas' } = {}) {
  return search.trim().length > 0 || status !== 'Todas';
}
