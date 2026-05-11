export const adminNavigationItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
  { icon: 'users', label: 'Usuários', to: '/admin/usuarios' },
  { icon: 'shield', label: 'Perfis e permissões', to: '/admin/perfis' },
  { icon: 'reports', label: 'Auditoria', to: '/admin/auditoria' },
];

export const userStatusTabs = ['Todos', 'Ativo', 'Pendente', 'Bloqueado', 'Inativo'];

export const userRoleOptions = [
  'Perfil (Todos)',
  'Administrador',
  'Gestor de Frota',
  'Motorista',
  'Servidor Solicitante',
];

export const adminUsers = [
  {
    cpf: '123.456.789-10',
    email: 'ana.costa@ctrlfleet.gov.br',
    id: 'ana-costa',
    lastAccess: 'Hoje, 09:42',
    name: 'Ana Costa',
    role: 'Administrador',
    status: 'Ativo',
  },
  {
    cpf: '234.567.890-21',
    email: 'joao.duarte@ctrlfleet.gov.br',
    id: 'joao-duarte',
    lastAccess: 'Ontem, 17:15',
    name: 'João Duarte',
    role: 'Gestor de Frota',
    status: 'Ativo',
  },
  {
    cpf: '345.678.901-32',
    email: 'marina.silva@ctrlfleet.gov.br',
    id: 'marina-silva',
    lastAccess: 'Aguardando primeiro acesso',
    name: 'Marina Silva',
    role: 'Servidor Solicitante',
    status: 'Pendente',
  },
  {
    cpf: '456.789.012-43',
    cnh: '03124567890',
    cnhExpiry: '18/11/2027',
    email: 'carlos.rocha@ctrlfleet.gov.br',
    id: 'carlos-rocha',
    lastAccess: '25/04/2026, 11:03',
    name: 'Carlos Rocha',
    role: 'Motorista',
    status: 'Bloqueado',
  },
];

export const permissionGroups = [
  {
    description: 'Gerencia usuários, perfis e auditoria.',
    modules: 'Todos os módulos',
    name: 'Administrador',
    users: 3,
  },
  {
    description: 'Mantém veículos, documentos, reservas e manutenções.',
    modules: 'Frota, reservas e manutenção',
    name: 'Gestor de Frota',
    users: 12,
  },
  {
    description: 'Consulta viagens atribuídas e solicita manutenção.',
    modules: 'Viagens e manutenção',
    name: 'Motorista',
    users: 48,
  },
  {
    description: 'Solicita reservas e acompanha o histórico de solicitações.',
    modules: 'Reservas',
    name: 'Servidor Solicitante',
    users: 65,
  },
];

export const adminRecentActivity = [
  {
    action: 'Perfil alterado',
    actor: 'Ana Costa',
    detail:
      'Permissões de João Duarte atualizadas para Gestor de Frota com acesso aos módulos de manutenção, reservas e relatórios.',
    id: 'act-1',
    ip: '192.168.10.42',
    severity: 'info',
    target: 'João Duarte',
    timestamp: 'Hoje, 10:18',
  },
  {
    action: 'Usuário bloqueado',
    actor: 'Sistema automatizado',
    detail:
      'Carlos Rocha bloqueado após 5 tentativas inválidas de acesso em menos de 2 minutos. Bloqueio preventivo aplicado.',
    id: 'act-2',
    ip: '189.45.23.118',
    severity: 'critical',
    target: 'Carlos Rocha',
    timestamp: 'Hoje, 08:06',
  },
  {
    action: 'Convite enviado',
    actor: 'Ana Costa',
    detail:
      'Marina Silva recebeu convite para primeiro acesso. E-mail enviado para marina.silva@ctrlfleet.gov.br com instruções de cadastro.',
    id: 'act-3',
    ip: '192.168.10.42',
    severity: 'info',
    target: 'Marina Silva',
    timestamp: 'Ontem, 16:44',
  },
  {
    action: 'Senha redefinida',
    actor: 'Patrícia Melo',
    detail: 'Solicitação de redefinição de senha concluída via fluxo de recuperação por e-mail.',
    id: 'act-4',
    ip: '177.92.118.4',
    severity: 'warning',
    target: 'Patrícia Melo',
    timestamp: 'Ontem, 14:11',
  },
  {
    action: 'Permissão revogada',
    actor: 'Ana Costa',
    detail:
      'Acesso ao módulo de auditoria revogado para o perfil Gestor de Frota após revisão trimestral.',
    id: 'act-5',
    ip: '192.168.10.42',
    severity: 'warning',
    target: 'Perfil Gestor de Frota',
    timestamp: '03/05/2026, 11:02',
  },
];
