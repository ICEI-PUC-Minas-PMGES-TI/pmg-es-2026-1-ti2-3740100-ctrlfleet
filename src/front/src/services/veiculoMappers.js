/**
 * Helpers compartilhados para converter o `VeiculoResponseDTO` retornado pelo
 * backend em estruturas amigáveis para o painel do gestor de frota.
 *
 * Hoje a entidade `Veiculo` no backend ainda é simples (id, placa, modelo,
 * marca, ano, status). Campos que a UI exibe e que ainda não existem no
 * domínio (categoria de CNH, documentos, motorista vinculado, etc.) recebem
 * valores neutros aqui — assim o front continua funcionando enquanto a
 * entidade evolui.
 */

/** Status canônico do enum `StatusVeiculo` (DB) → label exibido na UI. */
export const STATUS_VEICULO_LABELS = {
  DISPONIVEL: 'Ativo',
  EM_USO: 'Ativo',
  MANUTENCAO: 'Manutenção',
  DESATIVADO: 'Bloqueado',
};

/** Zero-padding para 2 dígitos (usado nas KPIs). */
export function pad2(value) {
  return String(value).padStart(2, '0');
}

/**
 * Resolve o label de status exibido na UI a partir do enum vindo do backend.
 * Caso o backend evolua para novos valores, retorna o próprio valor para que
 * o problema fique visível na interface em vez de virar string vazia.
 */
export function resolveStatusVeiculo(dto) {
  if (!dto?.status) return 'Ativo';
  return STATUS_VEICULO_LABELS[dto.status] || dto.status;
}

/**
 * Combina marca + modelo em uma única string ("Chevrolet Onix") usada na
 * coluna "Modelo" da tabela de frota e em buscas por texto. Ignora campos
 * vazios para evitar espaços duplicados.
 */
export function buildModelLabel(dto) {
  const parts = [dto?.marca, dto?.modelo].map((p) => (p ? String(p).trim() : '')).filter(Boolean);
  return parts.join(' ') || (dto?.modelo ?? '—');
}

/**
 * Heurística simples para a categoria de CNH com base no nome do modelo.
 * Vans e utilitários grandes (Sprinter, Ducato, Master, Daily, etc.) caem
 * em "D"; o resto em "B". É um placeholder visual enquanto o backend ainda
 * não persiste essa informação.
 */
const HEAVY_VEHICLE_REGEX = /(sprinter|ducato|master|daily|hilux|sw4|ranger|amarok|s10|toro|frontier|strada)/i;

export function inferLicenseCategory(dto) {
  const text = `${dto?.marca || ''} ${dto?.modelo || ''}`;
  if (HEAVY_VEHICLE_REGEX.test(text)) {
    return 'D';
  }
  return 'B';
}

/**
 * Mocka uma lista de documentos (IPVA, Seguro, Licenciamento) com estados
 * variados de forma determinística pelo id do veículo. Mantém a UI atual
 * com pills coloridas funcionando enquanto a entidade `Documentacao`
 * ainda não foi exposta no backend.
 *
 * Mapeamento por (id mod 3):
 *   0 → todos `ok`
 *   1 → IPVA `warning`, demais `ok`
 *   2 → Licenciamento `expired`, demais `ok`
 */
const DOCUMENT_TEMPLATES = [
  { label: 'IPVA', shortLabel: 'IP', dueDate: '12/05/2026' },
  { label: 'Seguro', shortLabel: 'SG', dueDate: '28/11/2026' },
  { label: 'Licenciamento', shortLabel: 'LC', dueDate: '17/09/2026' },
];

export function buildMockDocuments(dto) {
  const id = Number(dto?.id) || 0;
  const variant = id % 3;
  return DOCUMENT_TEMPLATES.map((doc, index) => {
    let state = 'ok';
    if (variant === 1 && index === 0) state = 'warning';
    if (variant === 2 && index === 2) state = 'expired';
    return { ...doc, state };
  });
}

/**
 * Converte o `VeiculoResponseDTO` para o formato esperado pelos componentes
 * `FleetPage`, `FleetFilters`, `VehicleTable` e `FleetDashboardPage`.
 * Mantém o mesmo "shape" que antes era servido pelo mock `fleetVehicles`,
 * para minimizar mudanças nos componentes de UI.
 */
export function mapBackendVehicleToView(dto) {
  return {
    id: String(dto.id),
    plate: dto.placa || '—',
    model: buildModelLabel(dto),
    year: dto.ano ? String(dto.ano) : '—',
    status: resolveStatusVeiculo(dto),
    licenseCategory: inferLicenseCategory(dto),
    documents: buildMockDocuments(dto),
  };
}
