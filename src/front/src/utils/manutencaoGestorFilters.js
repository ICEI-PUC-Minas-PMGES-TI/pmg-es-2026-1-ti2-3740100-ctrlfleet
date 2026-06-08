const STATUS_TABS = ['Todas', 'Pendente', 'Agendada', 'Em andamento', 'Concluída', 'Reprovada', 'Cancelada'];

const STATUS_TAB_TO_API = {
  Pendente: 'PENDENTE',
  Agendada: 'AGENDADA',
  'Em andamento': 'EM_ANDAMENTO',
  Concluída: 'CONCLUIDA',
  Reprovada: 'REPROVADA',
  Cancelada: 'CANCELADA',
};

const TIPO_TAB_TO_API = {
  Todos: null,
  Preventiva: 'PREVENTIVA',
  Corretiva: 'CORRETIVA',
};

const PRIORIDADE_TAB_TO_API = {
  Todas: null,
  Baixa: 'BAIXA',
  Média: 'MEDIA',
  Alta: 'ALTA',
  Crítica: 'CRITICA',
};

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function flattenPainelGestor(painel) {
  if (!painel) return [];
  return dedupeById([
    ...(painel.pendentes || []),
    ...(painel.agendadas || []),
    ...(painel.emAndamento || []),
    ...(painel.historico || []),
  ]);
}

export function buildManutencaoStatusTabs(items, tabs = STATUS_TABS) {
  const counts = items.reduce((acc, item) => {
    if (item.status) acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return tabs.filter((tab) => {
    if (tab === 'Todas') return items.length > 0;
    const apiStatus = STATUS_TAB_TO_API[tab];
    return apiStatus ? (counts[apiStatus] || 0) > 0 : false;
  });
}

export function buildManutencaoPrioridadeOptions(items) {
  const options = ['Todas', 'Baixa', 'Média', 'Alta', 'Crítica'];
  const used = new Set(items.map((item) => item.prioridade).filter(Boolean));
  if (!used.size) return options;
  return options.filter((label) => label === 'Todas' || used.has(PRIORIDADE_TAB_TO_API[label]));
}

export function buildManutencaoTipoOptions(items) {
  const options = ['Todos', 'Preventiva', 'Corretiva'];
  const used = new Set(items.map((item) => item.tipo).filter(Boolean));
  if (!used.size) return options;
  return options.filter((label) => label === 'Todos' || used.has(TIPO_TAB_TO_API[label]));
}

export function buildManutencaoVeiculoOptions(items) {
  const map = new Map();
  for (const item of items) {
    if (!item.idVeiculo) continue;
    const label = item.placa ? `${item.placa} · ${item.vehicleLabel}` : item.vehicleLabel;
    map.set(String(item.idVeiculo), label || `Veículo #${item.idVeiculo}`);
  }
  return [
    { value: 'todos', label: 'Todos os veículos' },
    ...[...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
      .map(([value, label]) => ({ value, label })),
  ];
}

export function filterManutencoes(items, { search, status, prioridade, tipo, veiculoId }) {
  const term = search.trim().toLowerCase();
  const apiStatus = status && status !== 'Todas' ? STATUS_TAB_TO_API[status] : null;
  const apiPrioridade = prioridade && prioridade !== 'Todas' ? PRIORIDADE_TAB_TO_API[prioridade] : null;
  const apiTipo = tipo && tipo !== 'Todos' ? TIPO_TAB_TO_API[tipo] : null;
  const veiculoFilter = veiculoId && veiculoId !== 'todos' ? String(veiculoId) : null;

  return items.filter((item) => {
    if (apiStatus && item.status !== apiStatus) return false;
    if (apiPrioridade && item.prioridade !== apiPrioridade) return false;
    if (apiTipo && item.tipo !== apiTipo) return false;
    if (veiculoFilter && String(item.idVeiculo) !== veiculoFilter) return false;

    if (!term) return true;

    return (
      String(item.id).includes(term) ||
      (item.placa || '').toLowerCase().includes(term) ||
      (item.vehicleLabel || '').toLowerCase().includes(term) ||
      (item.descricao || '').toLowerCase().includes(term) ||
      (item.nomeMotorista || '').toLowerCase().includes(term) ||
      (item.tipoLabel || '').toLowerCase().includes(term) ||
      (item.prioridadeLabel || '').toLowerCase().includes(term)
    );
  });
}

export function hasActiveManutencaoFilters({ search, status, prioridade, tipo, veiculoId }) {
  return (
    Boolean(search.trim()) ||
    (status && status !== 'Todas') ||
    (prioridade && prioridade !== 'Todas') ||
    (tipo && tipo !== 'Todos') ||
    (veiculoId && veiculoId !== 'todos')
  );
}

export function formatManutencaoFilterSummary(filters) {
  const parts = [];
  if (filters.status && filters.status !== 'Todas') parts.push(`Status: ${filters.status}`);
  if (filters.prioridade && filters.prioridade !== 'Todas') parts.push(`Prioridade: ${filters.prioridade}`);
  if (filters.tipo && filters.tipo !== 'Todos') parts.push(`Tipo: ${filters.tipo}`);
  if (filters.veiculoLabel) parts.push(filters.veiculoLabel);
  return parts.length ? parts.join(' · ') : '';
}

export function coerceSelectValue(value, options, fallback) {
  if (!options?.length) return fallback;
  return options.includes(value) ? value : fallback;
}
