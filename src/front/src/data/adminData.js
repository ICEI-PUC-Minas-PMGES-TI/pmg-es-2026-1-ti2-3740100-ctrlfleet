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
