export const STATUS_LABELS = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  BLOQUEADO: 'Bloqueado',
  PENDENTE: 'Pendente',
};

export const TIPO_CONTA_LABELS = {
  ROLE_ADMINISTRADOR: 'Administrador',
  ROLE_GESTOR_FROTA: 'Gestor de Frota',
  ROLE_MOTORISTA: 'Motorista',
  ROLE_SOLICITANTE: 'Servidor Solicitante',
};

const PERFIL_ALIASES = {
  Solicitante: 'Servidor Solicitante',
};

export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function formatBrDate(iso) {
  if (!iso || typeof iso !== 'string') return '-';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '-';
  return `${d}/${m}/${y}`;
}

export function formatBrDateInput(iso) {
  const formatted = formatBrDate(iso);
  return formatted === '-' ? '' : formatted;
}

export function resolvePerfil(dto) {
  const raw = dto?.perfilAcesso || TIPO_CONTA_LABELS[dto?.tipoConta] || null;
  if (!raw) return null;
  return PERFIL_ALIASES[raw] || raw;
}

export function resolveStatus(dto) {
  return STATUS_LABELS[dto?.status] || dto?.status || 'Pendente';
}

export function mapBackendUserToView(dto) {
  return {
    id: dto.id,
    name: dto.nome,
    email: dto.email,
    matricula: dto.matricula || '-',
    role: resolvePerfil(dto) || '-',
    status: resolveStatus(dto),
    cargo: dto.cargo || null,
    cnh: dto.numeroCnh || null,
    cnhExpiry: formatBrDateInput(dto.validadeCnh),
    lastAccess: '-',
    dataAdmissao: dto.dataAdmissao || null,
    tipoCadastro: dto.tipoCadastro || null,
  };
}
