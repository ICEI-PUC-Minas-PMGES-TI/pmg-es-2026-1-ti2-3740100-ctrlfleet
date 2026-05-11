/**
 * Helpers compartilhados para converter o `UsuarioResponseDTO` retornado pelo
 * backend em estruturas amigáveis para a UI (labels traduzidos, fallbacks,
 * formatação de datas, etc.).
 *
 * Centralizar esses utilitários aqui evita duplicação entre dashboard, lista
 * de usuários e tela de perfis.
 */

/** Status canônico (DB) → label exibido na UI. */
export const STATUS_LABELS = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  BLOQUEADO: 'Bloqueado',
  PENDENTE: 'Pendente',
};

/** ROLE_* (canônico) → rótulo amigável de perfil. */
export const TIPO_CONTA_LABELS = {
  ROLE_ADMINISTRADOR: 'Administrador',
  ROLE_GESTOR_FROTA: 'Gestor de Frota',
  ROLE_MOTORISTA: 'Motorista',
  ROLE_SOLICITANTE: 'Servidor Solicitante',
};

/**
 * Normalização de rótulos antigos/curtos persistidos no banco para o nome
 * canônico exibido na UI. Mantém compatibilidade com usuários cujo
 * `perfilAcesso` foi gravado como "Solicitante" (formato enviado pelo
 * formulário de cadastro), traduzindo para o label "Servidor Solicitante"
 * usado nos filtros e cards de perfil.
 */
const PERFIL_ALIASES = {
  Solicitante: 'Servidor Solicitante',
};

/** Zero-padding para 2 dígitos (usado nas KPIs). */
export function pad2(value) {
  return String(value).padStart(2, '0');
}

/** Converte `yyyy-MM-dd` para `dd/MM/yyyy`. Retorna `—` quando inválido. */
export function formatBrDate(iso) {
  if (!iso || typeof iso !== 'string') return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '—';
  return `${d}/${m}/${y}`;
}

/** Resolve o melhor label de perfil disponível para um DTO. */
export function resolvePerfil(dto) {
  const raw = dto?.perfilAcesso || TIPO_CONTA_LABELS[dto?.tipoConta] || null;
  if (!raw) return null;
  return PERFIL_ALIASES[raw] || raw;
}

/** Resolve o label de status, com fallback para "Pendente". */
export function resolveStatus(dto) {
  return STATUS_LABELS[dto?.status] || dto?.status || 'Pendente';
}

/**
 * Converte o `UsuarioResponseDTO` retornado pelo backend para o formato
 * esperado pelas listas e modais do módulo administrativo.
 */
export function mapBackendUserToView(dto) {
  return {
    id: dto.id,
    name: dto.nome,
    email: dto.email,
    matricula: dto.matricula || '—',
    role: resolvePerfil(dto) || '—',
    status: resolveStatus(dto),
    cargo: dto.cargo || null,
    cnh: dto.numeroCnh || null,
    cnhExpiry: dto.validadeCnh || null,
    lastAccess: '—',
    dataAdmissao: dto.dataAdmissao || null,
  };
}
