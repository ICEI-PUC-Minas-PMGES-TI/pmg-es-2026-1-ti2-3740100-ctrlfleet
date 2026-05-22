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
