export const adminNavigationItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
  { badge: 4, icon: 'users', label: 'Usuarios', to: '/admin/usuarios' },
  { icon: 'shield', label: 'Perfis e permissoes', to: '/admin/perfis' },
  { icon: 'reports', label: 'Auditoria', to: '/admin/auditoria' },
  { icon: 'maintenance', label: 'Configuracoes', to: '/admin/configuracoes' },
];

export const userStatusTabs = ['Todos', 'Ativo', 'Pendente', 'Bloqueado', 'Inativo'];

export const userRoleOptions = [
  'Perfil (Todos)',
  'Administrador',
  'Gestor de Frota',
  'Motorista',
  'Servidor Solicitante',
];

export const adminSecretariats = ['Gabinete', 'Saude', 'Educacao', 'Obras', 'Administracao'];

export const permissionGroups = [
  {
    description: 'Gerencia usuarios, perfis, auditoria e parametros gerais.',
    modules: 'Todos os modulos',
    name: 'Administrador',
    users: 0,
  },
  {
    description: 'Mantem veiculos, documentos, reservas e manutencoes.',
    modules: 'Frota, reservas e manutencao',
    name: 'Gestor de Frota',
    users: 0,
  },
  {
    description: 'Consulta viagens atribuidas e solicita manutencao.',
    modules: 'Viagens e manutencao',
    name: 'Motorista',
    users: 0,
  },
  {
    description: 'Solicita reservas e acompanha o historico de solicitacoes.',
    modules: 'Reservas',
    name: 'Servidor Solicitante',
    users: 0,
  },
];
