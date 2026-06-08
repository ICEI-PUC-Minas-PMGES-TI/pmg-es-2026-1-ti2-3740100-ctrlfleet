export const STATUS_VEICULO_LABELS = {
  DISPONIVEL: 'Ativo',
  EM_USO: 'Ativo',
  MANUTENCAO: 'Manuten\u00e7\u00e3o',
  DESATIVADO: 'Inativo',
};

export const TIPO_VEICULO_LABELS = {
  SEDAN: 'Sedan',
  HATCH: 'Hatch',
  SUV: 'SUV',
  VAN: 'Van',
  ONIBUS: 'Ônibus',
  CAMINHONETE: 'Caminhonete',
};

export const AVAILABILITY_STATUS_LABELS = {
  DISPONIVEL: 'Disponível',
  EM_USO: 'Em uso',
  MANUTENCAO: 'Em manutenção',
  DESATIVADO: 'Indisponível',
};

export function resolveAvailabilityLabel(availabilityStatus) {
  const key = String(availabilityStatus || 'DISPONIVEL').toUpperCase();
  return AVAILABILITY_STATUS_LABELS[key] || key;
}

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

const HEAVY_VEHICLE_REGEX = /(sprinter|ducato|master|daily|hilux|sw4|ranger|amarok|s10|toro|frontier|strada|of-1519|volare|apache|paradiso|torino|busscar)/i;

export function resolveTipoVeiculoLabel(dto) {
  const key = String(dto?.tipoVeiculo || '').toUpperCase();
  return TIPO_VEICULO_LABELS[key] || null;
}

export function inferLicenseCategory(dto) {
  const tipo = String(dto?.tipoVeiculo || '').toUpperCase();
  if (tipo === 'ONIBUS' || tipo === 'VAN') return 'D';
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
  return Object.entries(DOCUMENT_LABELS).map(([tipoDocumento, doc]) => ({
    ...doc,
    id: `mock-${dto?.id || 'new'}-${tipoDocumento}`,
    tipoDocumento,
    dataVencimento: '',
    dueDate: 'Sem registro',
    state: 'warning',
    statusPagamento: 'PENDENTE',
  }));
}

const FLEET_MAP_CENTER = { lat: -19.9167, lng: -43.9345 };

export function resolveVehicleLocation(dto) {
  const lat = dto?.latitude ?? dto?.lat ?? dto?.localizacao?.latitude;
  const lng = dto?.longitude ?? dto?.lng ?? dto?.localizacao?.longitude;

  if (lat != null && lng != null) {
    return {
      lat: Number(lat),
      lng: Number(lng),
      source: 'api',
    };
  }

  const id = Number(dto?.id) || 1;
  const angle = ((id * 47) % 360) * (Math.PI / 180);
  const radius = 0.006 + (id % 6) * 0.0018;

  return {
    lat: FLEET_MAP_CENTER.lat + radius * Math.cos(angle),
    lng: FLEET_MAP_CENTER.lng + radius * Math.sin(angle),
    source: 'mock',
  };
}

export function mapBackendVehicleToView(dto) {
  const documents =
    Array.isArray(dto.documentos) && dto.documentos.length > 0
      ? dto.documentos.map(mapBackendDocumentToView)
      : buildMockDocuments(dto);
  const persistedStatus = resolveStatusVeiculo(dto);
  const status = persistedStatus === 'Inativo' ? 'Inativo' : hasExpiredDocument(documents) ? 'Bloqueado' : persistedStatus;

  const tipoVeiculo = dto.tipoVeiculo ? String(dto.tipoVeiculo).toUpperCase() : null;

  const availabilityStatus = dto.status ? String(dto.status).toUpperCase() : 'DISPONIVEL';

  return {
    id: String(dto.id),
    plate: dto.placa || '-',
    marca: dto.marca || '-',
    model: dto.modelo || buildModelLabel(dto),
    year: dto.ano ? String(dto.ano) : '-',
    secretaria: dto.secretaria || '-',
    status,
    availabilityStatus,
    availabilityLabel: resolveAvailabilityLabel(availabilityStatus),
    isDisponivel: availabilityStatus === 'DISPONIVEL' && status !== 'Bloqueado' && status !== 'Inativo',
    tipoVeiculo,
    vehicleTypeLabel: resolveTipoVeiculoLabel(dto) || 'Outros',
    licenseCategory: inferLicenseCategory(dto),
    quilometragemAtual: dto.quilometragemAtual ?? null,
    documents,
    motoristaResponsavel: dto.motorista
      ? {
          id: dto.motorista.id != null ? String(dto.motorista.id) : null,
          nome: dto.motorista.nome || null,
          email: dto.motorista.email || null,
          matricula: dto.motorista.matricula || null,
        }
      : null,
    location: resolveVehicleLocation(dto),
  };
}
