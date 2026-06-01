const STATUS_TABS = ['Todas', 'Pendente', 'Agendada', 'Em andamento', 'Concluída', 'Reprovada', 'Cancelada'];

const STATUS_TAB_TO_API = {
  Pendente: 'PENDENTE',
  Agendada: 'AGENDADA',
  'Em andamento': 'EM_ANDAMENTO',
  Concluída: 'CONCLUIDA',
  Reprovada: 'REPROVADA',
  Cancelada: 'CANCELADA',
};

export function flattenPainelGestor(painel) {
  if (!painel) return [];
  return [
    ...(painel.pendentes || []),
    ...(painel.agendadas || []),
    ...(painel.emAndamento || []),
    ...(painel.historico || []),
  ];
}

export function buildManutencaoStatusTabs(items, tabs = STATUS_TABS) {
  const counts = items.reduce((acc, item) => {
    const key = item.status;
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return tabs.filter((tab) => {
    if (tab === 'Todas') return items.length > 0;
    const apiStatus = STATUS_TAB_TO_API[tab];
    return apiStatus ? (counts[apiStatus] || 0) > 0 : false;
  });
}

export function resolveManutencaoFilterSelection({ status, statusTabs }) {
  const normalizedTabs = statusTabs?.length ? statusTabs : STATUS_TABS;
  const safeStatus = normalizedTabs.includes(status) ? status : normalizedTabs[0] || 'Todas';
  return { status: safeStatus };
}

export function filterManutencoes(items, { search, status }) {
  const term = search.trim().toLowerCase();
  const apiStatus = status === 'Todas' ? null : STATUS_TAB_TO_API[status];

  return items.filter((item) => {
    const matchesStatus = !apiStatus || item.status === apiStatus;
    if (!matchesStatus) return false;
    if (!term) return true;

    return (
      String(item.id).includes(term) ||
      (item.placa || '').toLowerCase().includes(term) ||
      (item.vehicleLabel || '').toLowerCase().includes(term) ||
      (item.descricao || '').toLowerCase().includes(term) ||
      (item.nomeMotorista || '').toLowerCase().includes(term)
    );
  });
}

export function hasActiveManutencaoFilters({ search, status }) {
  return Boolean(search.trim()) || (status && status !== 'Todas');
}
