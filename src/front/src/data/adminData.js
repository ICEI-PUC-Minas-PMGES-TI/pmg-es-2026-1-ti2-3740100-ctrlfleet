export const adminNavigationItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
  { badge: 4, icon: 'users', label: 'Usuários', to: '/admin/usuarios' },
  { icon: 'shield', label: 'Perfis e permissões', to: '/admin/perfis' },
  { icon: 'reports', label: 'Auditoria', to: '/admin/auditoria' },
  { icon: 'maintenance', label: 'Configurações', to: '/admin/configuracoes' },
];

export const userStatusTabs = ['Todos', 'Ativo', 'Pendente', 'Bloqueado', 'Inativo'];

export const userRoleOptions = [
  'Perfil (Todos)',
  'Administrador',
  'Gestor de Frota',
  'Motorista',
  'Servidor Solicitante',
];

export const adminSecretariats = ['Gabinete', 'Saúde', 'Educação', 'Obras', 'Administração'];

export const adminUsers = [
  {
    cpf: '123.456.789-10',
    email: 'ana.costa@ctrlfleet.gov.br',
    id: 'ana-costa',
    lastAccess: 'Hoje, 09:42',
    name: 'Ana Costa',
    role: 'Administrador',
    secretariat: 'Administração',
    status: 'Ativo',
  },
  {
    cpf: '234.567.890-21',
    email: 'joao.duarte@ctrlfleet.gov.br',
    id: 'joao-duarte',
    lastAccess: 'Ontem, 17:15',
    name: 'João Duarte',
    role: 'Gestor de Frota',
    secretariat: 'Gabinete',
    status: 'Ativo',
  },
  {
    cpf: '345.678.901-32',
    email: 'marina.silva@ctrlfleet.gov.br',
    id: 'marina-silva',
    lastAccess: 'Aguardando primeiro acesso',
    name: 'Marina Silva',
    role: 'Servidor Solicitante',
    secretariat: 'Saúde',
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
    secretariat: 'Obras',
    status: 'Bloqueado',
  },
  {
    cpf: '612.443.981-02',
    cnh: '04567891234',
    cnhExpiry: '09/08/2028',
    email: 'patricia.melo@ctrlfleet.gov.br',
    id: 'patricia-melo',
    lastAccess: 'Hoje, 08:14',
    name: 'Patrícia Melo',
    role: 'Motorista',
    secretariat: 'Saúde',
    status: 'Ativo',
  },
  {
    cpf: '703.554.192-14',
    cnh: '05891234765',
    cnhExpiry: '21/02/2029',
    email: 'leandro.sousa@ctrlfleet.gov.br',
    id: 'leandro-sousa',
    lastAccess: 'Hoje, 07:41',
    name: 'Leandro Sousa',
    role: 'Motorista',
    secretariat: 'Gabinete',
    status: 'Ativo',
  },
  {
    cpf: '567.890.123-54',
    email: 'beatriz.lima@ctrlfleet.gov.br',
    id: 'beatriz-lima',
    lastAccess: '18/04/2026, 08:21',
    name: 'Beatriz Lima',
    role: 'Gestor de Frota',
    secretariat: 'Educação',
    status: 'Inativo',
  },
];

export const adminStats = [
  { caption: 'Usuários cadastrados', icon: 'users', title: 'Contas', value: '128' },
  { caption: 'Aguardando validação', icon: 'alert', title: 'Pendências', value: '04' },
  { caption: 'Perfis de acesso ativos', icon: 'shield', title: 'Perfis', value: '05' },
  { caption: 'Ações registradas hoje', icon: 'reports', title: 'Auditoria', value: '76' },
];

export const adminAlerts = [
  {
    id: 'ad1',
    status: 'Pendente',
    text: '4 novos usuários aguardam aprovação de perfil e secretaria.',
  },
  {
    id: 'ad2',
    status: 'Bloqueado',
    text: '1 conta foi bloqueada após tentativas de acesso sem sucesso.',
  },
  {
    id: 'ad3',
    status: 'Ativo',
    text: 'Permissões do perfil Gestor de Frota foram revisadas hoje.',
  },
];

export const permissionGroups = [
  {
    description: 'Gerencia usuários, perfis, auditoria e parâmetros gerais.',
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

export const adminPendingApprovals = [
  {
    cpf: '345.678.901-32',
    email: 'marina.silva@ctrlfleet.gov.br',
    id: 'pend-marina',
    name: 'Marina Silva',
    requestedAt: 'Hoje, 09:14',
    requestedBy: 'Ana Costa',
    role: 'Servidor Solicitante',
    secretariat: 'Saúde',
    type: 'Novo cadastro',
  },
  {
    cpf: '871.234.665-09',
    email: 'rafael.menezes@ctrlfleet.gov.br',
    id: 'pend-rafael',
    name: 'Rafael Menezes',
    requestedAt: 'Hoje, 08:42',
    requestedBy: 'Sistema',
    role: 'Motorista',
    secretariat: 'Obras',
    type: 'Novo cadastro',
  },
  {
    cpf: '459.812.330-71',
    email: 'lucia.albuquerque@ctrlfleet.gov.br',
    id: 'pend-lucia',
    name: 'Lúcia Albuquerque',
    requestedAt: 'Ontem, 17:08',
    requestedBy: 'Joana Pires',
    role: 'Gestor de Frota',
    secretariat: 'Educação',
    type: 'Mudança de perfil',
  },
  {
    cpf: '224.119.054-88',
    email: 'fernando.tavares@ctrlfleet.gov.br',
    id: 'pend-fernando',
    name: 'Fernando Tavares',
    requestedAt: 'Ontem, 14:32',
    requestedBy: 'Ana Costa',
    role: 'Servidor Solicitante',
    secretariat: 'Gabinete',
    type: 'Reativação de conta',
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
      'Acesso ao módulo de Configurações revogado para o perfil Gestor de Frota após revisão trimestral.',
    id: 'act-5',
    ip: '192.168.10.42',
    severity: 'warning',
    target: 'Perfil Gestor de Frota',
    timestamp: '03/05/2026, 11:02',
  },
];

export const adminSystemHealth = [
  { id: 'sh1', label: 'Disponibilidade da API', tone: 'success', value: 99 },
  { id: 'sh2', label: 'Sessões simultâneas', tone: 'info', value: 64 },
  { id: 'sh3', label: 'Uso da base de dados', tone: 'warning', value: 73 },
  { id: 'sh4', label: 'Tentativas bloqueadas (24h)', tone: 'danger', value: 12 },
];

export const adminLoginsByHour = [
  { hour: '00h', value: 2 },
  { hour: '04h', value: 1 },
  { hour: '08h', value: 18 },
  { hour: '10h', value: 26 },
  { hour: '12h', value: 14 },
  { hour: '14h', value: 22 },
  { hour: '16h', value: 19 },
  { hour: '18h', value: 9 },
  { hour: '20h', value: 4 },
];

export const adminRecentLogins = [
  {
    device: 'Chrome • Windows 11',
    id: 'log-1',
    ip: '192.168.10.42',
    name: 'Ana Costa',
    role: 'Administrador',
    status: 'success',
    when: 'Hoje, 10:42',
  },
  {
    device: 'Edge • Windows 10',
    id: 'log-2',
    ip: '177.92.118.4',
    name: 'Patrícia Melo',
    role: 'Motorista',
    status: 'success',
    when: 'Hoje, 09:21',
  },
  {
    device: 'Safari • iOS 18',
    id: 'log-3',
    ip: '189.45.23.118',
    name: 'Carlos Rocha',
    role: 'Motorista',
    status: 'blocked',
    when: 'Hoje, 08:06',
  },
  {
    device: 'Chrome • macOS',
    id: 'log-4',
    ip: '200.123.55.22',
    name: 'João Duarte',
    role: 'Gestor de Frota',
    status: 'success',
    when: 'Hoje, 07:58',
  },
];
