export const STATUS_VEICULO_LABELS = {
  DISPONIVEL: 'Ativo',
  EM_USO: 'Ativo',
  MANUTENCAO: 'Manuten\u00e7\u00e3o',
  DESATIVADO: 'Inativo',
};

export const STATUS_VEICULO_VALUES = {
  Ativo: 'DISPONIVEL',
  Manutencao: 'MANUTENCAO',
  'Manuten\u00e7\u00e3o': 'MANUTENCAO',
  Reservado: 'EM_USO',
  Inativo: 'DESATIVADO',
};

export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function resolveStatusVeiculo(dto) {
  if (!dto?.status) return 'Ativo';
  return STATUS_VEICULO_LABELS[dto.status] || dto.status;
}

function hasExpiredDocument(documents) {
  return documents.some((documento) => documento.state === 'expired');
}

export function buildModelLabel(dto) {
  const parts = [dto?.marca, dto?.modelo].map((p) => (p ? String(p).trim() : '')).filter(Boolean);
  return parts.join(' ') || (dto?.modelo ?? '-');
}

const HEAVY_VEHICLE_REGEX = /(sprinter|ducato|master|daily|hilux|sw4|ranger|amarok|s10|toro|frontier|strada)/i;

export function inferLicenseCategory(dto) {
  const text = `${dto?.marca || ''} ${dto?.modelo || ''}`;
  return HEAVY_VEHICLE_REGEX.test(text) ? 'D' : 'B';
}

const DOCUMENT_LABELS = {
  IPVA: { label: 'IPVA', shortLabel: 'IP' },
  SEGURO: { label: 'Seguro', shortLabel: 'SG' },
  LICENCIAMENTO: { label: 'Licenciamento', shortLabel: 'LC' },
};

function formatDateBr(value) {
  if (!value) return 'Pendente';
  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function resolveDocumentState(documento) {
  if (documento?.statusPagamento === 'ATRASADO') return 'expired';
  if (documento?.statusPagamento === 'PENDENTE') return 'warning';
  if (!documento?.dataVencimento) return 'warning';

  const dueDate = new Date(`${documento.dataVencimento}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dueDate < today) return 'expired';

  const days = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
  return days <= 30 ? 'warning' : 'ok';
}

export function mapBackendDocumentToView(documento) {
  const key = String(documento?.tipoDocumento || '').toUpperCase();
  const labelInfo = DOCUMENT_LABELS[key] || {
    label: documento?.tipoDocumento || 'Documento',
    shortLabel: key.slice(0, 2) || 'DC',
  };

  return {
    id: documento.id,
    tipoDocumento: key,
    dataVencimento: documento.dataVencimento || '',
    dueDate: formatDateBr(documento.dataVencimento),
    label: labelInfo.label,
    shortLabel: labelInfo.shortLabel,
    state: resolveDocumentState(documento),
    statusPagamento: documento.statusPagamento || 'PENDENTE',
    valorPago: documento.valorPago ?? null,
  };
}

export function buildMockDocuments(dto) {
  const id = Number(dto?.id) || 0;
  const variant = id % 3;
  return Object.entries(DOCUMENT_LABELS).map(([tipoDocumento, doc], index) => {
    let state = 'ok';
    if (variant === 1 && index === 0) state = 'warning';
    if (variant === 2 && index === 2) state = 'expired';
    return { ...doc, id: `mock-${tipoDocumento}`, tipoDocumento, dataVencimento: '', dueDate: 'Pendente', state };
  });
}

export function mapBackendVehicleToView(dto) {
  const documents =
    Array.isArray(dto.documentos) && dto.documentos.length > 0
      ? dto.documentos.map(mapBackendDocumentToView)
      : buildMockDocuments(dto);
  const persistedStatus = resolveStatusVeiculo(dto);
  const status = persistedStatus === 'Inativo' ? 'Inativo' : hasExpiredDocument(documents) ? 'Bloqueado' : persistedStatus;

  return {
    id: String(dto.id),
    plate: dto.placa || '-',
    marca: dto.marca || '-',
    model: dto.modelo || buildModelLabel(dto),
    year: dto.ano ? String(dto.ano) : '-',
    status,
    licenseCategory: inferLicenseCategory(dto),
    documents,
  };
}
