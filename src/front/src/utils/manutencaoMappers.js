const STATUS_LABELS = {
  PENDENTE: 'Pendente',
  AGENDADA: 'Agendada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  REPROVADA: 'Reprovada',
};

const TIPO_LABELS = {
  PREVENTIVA: 'Preventiva',
  CORRETIVA: 'Corretiva',
};

const PRIORIDADE_LABELS = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

function formatDateBr(value) {
  if (!value) return '—';
  const date = new Date(String(value).includes('T') ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatDateTimeBr(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatKm(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(Number(value))} km`;
}

const FINALIZED_STATUSES = new Set(['CONCLUIDA', 'CANCELADA', 'REPROVADA']);

function computePreventivaAtrasada(dto) {
  if (dto.atrasada) return true;
  if (dto.tipoManutencao !== 'PREVENTIVA' || !dto.dataAgendada) return false;
  if (FINALIZED_STATUSES.has(dto.status)) return false;
  const scheduled = new Date(`${dto.dataAgendada}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  scheduled.setHours(0, 0, 0, 0);
  return scheduled < today;
}

export function mapManutencaoToView(dto) {
  const atrasada = computePreventivaAtrasada(dto);
  return {
    id: dto.id,
    idVeiculo: dto.idVeiculo,
    placa: dto.placa || '—',
    marca: dto.marca || '',
    modelo: dto.modelo || '',
    vehicleLabel: [dto.marca, dto.modelo].filter(Boolean).join(' ') || 'Veículo',
    tipo: dto.tipoManutencao,
    tipoLabel: TIPO_LABELS[dto.tipoManutencao] || dto.tipoManutencao,
    descricao: dto.descricaoProblema || '',
    dataAgendada: dto.dataAgendada,
    dataAgendadaLabel: formatDateBr(dto.dataAgendada),
    dataAgendamentoLabel: formatDateBr(dto.dataAgendada),
    dataIdentificacao: dto.dataIdentificacao,
    dataIdentificacaoLabel: formatDateTimeBr(dto.dataIdentificacao),
    dataAberturaLabel: formatDateTimeBr(dto.dataIdentificacao),
    quilometragemRegistro: dto.quilometragemRegistro,
    quilometragemRegistroLabel: formatKm(dto.quilometragemRegistro),
    quilometragemAtual: dto.quilometragemAtual,
    quilometragemAtualLabel: formatKm(dto.quilometragemAtual),
    kmRestantes: dto.kmRestantes,
    kmRestantesLabel: dto.kmRestantes == null ? null : formatKm(Math.max(0, dto.kmRestantes)),
    diasRestantes: dto.diasRestantes,
    proximidadeLabel: dto.proximidadeLabel || (atrasada ? 'Atrasada' : 'Próxima da data prevista'),
    atrasada,
    custoTotal: dto.custoTotal,
    oficinaExecutor: dto.oficinaExecutor,
    status: dto.status,
    statusLabel: STATUS_LABELS[dto.status] || dto.status,
    emergencia: Boolean(dto.emergencia),
    prioridade: dto.prioridade,
    prioridadeLabel: PRIORIDADE_LABELS[dto.prioridade] || dto.prioridade,
    nomeMotorista: dto.nomeMotorista || '',
  };
}

export function mapPainelGestorManutencaoToView(dto) {
  return {
    pendentes: (dto.pendentes || []).map(mapManutencaoToView),
    agendadas: (dto.agendadas || []).map(mapManutencaoToView),
    emAndamento: (dto.emAndamento || []).map(mapManutencaoToView),
    historico: (dto.historico || []).map(mapManutencaoToView),
  };
}

export function mapAlertaToView(dto) {
  return {
    id: dto.id,
    idVeiculo: dto.idVeiculo,
    placa: dto.placa || '—',
    prioridade: dto.prioridade,
    prioridadeLabel: PRIORIDADE_LABELS[dto.prioridade] || dto.prioridade,
    mensagem: dto.mensagem || '',
    dataGeracao: dto.dataGeracao,
    dataGeracaoLabel: formatDateTimeBr(dto.dataGeracao),
    lido: Boolean(dto.lido),
    preventivo: Boolean(dto.preventivo),
  };
}

export function mapPainelManutencaoToView(dto) {
  return {
    preventivasProximas: (dto.preventivasProximas || []).map(mapManutencaoToView),
    alertasPreventivos: (dto.alertasPreventivos || []).map(mapAlertaToView),
    solicitacoes: (dto.solicitacoes || []).map(mapManutencaoToView),
    emAndamento: (dto.emAndamento || []).map(mapManutencaoToView),
    historico: (dto.historico || []).map(mapManutencaoToView),
  };
}

export function resolveManutencaoStatusVariant(status) {
  switch (status) {
    case 'PENDENTE':
      return 'warning';
    case 'AGENDADA':
      return 'info';
    case 'EM_ANDAMENTO':
      return 'maintenance';
    case 'CONCLUIDA':
      return 'success';
    case 'REPROVADA':
    case 'CANCELADA':
      return 'blocked';
    default:
      return 'neutral';
  }
}
