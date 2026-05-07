export const fleetNavigationItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/gestor/dashboard' },
  { icon: 'fleet', label: 'Frota', to: '/gestor/frota' },
  { badge: 1, icon: 'reservations', label: 'Reservas', to: '/gestor/reservas' },
  { badge: 5, icon: 'maintenance', label: 'Manutencao', to: '/gestor/manutencao' },
  { icon: 'preventive', label: 'Prog. Preventiva', to: '/gestor/programacao-preventiva' },
  { icon: 'reports', label: 'Relatorios', to: '/gestor/relatorios' },
];

export const secretariats = ['Secretaria (Todas)', 'Gabinete', 'Saude', 'Educacao', 'Obras', 'Administracao'];

export const statusTabs = ['Todos', 'Ativo', 'Manutencao', 'Bloqueado'];

export const vehicleFormOptions = {
  licenseCategories: ['A', 'B', 'C', 'D', 'E'],
  secretariats: ['Gabinete', 'Saude', 'Educacao', 'Obras', 'Administracao'],
  statuses: ['Ativo', 'Manutencao', 'Reservado', 'Inativo'],
};
