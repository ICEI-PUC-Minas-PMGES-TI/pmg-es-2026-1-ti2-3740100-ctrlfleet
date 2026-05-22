export const fleetNavigationItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/gestor/dashboard' },
  { icon: 'fleet', label: 'Frota', to: '/gestor/frota' },
  { badge: 1, icon: 'reservations', label: 'Reservas', to: '/gestor/reservas' },
  { icon: 'users', label: 'Solicitante', to: '/solicitante/reservas' },
  { badge: 5, icon: 'maintenance', label: 'Manutenção', to: '/gestor/manutencao' },
  { icon: 'preventive', label: 'Prog. Preventiva', to: '/gestor/programacao-preventiva' },
  { icon: 'reports', label: 'Relatórios', to: '/gestor/relatorios' },
];

export const driverNavigationItems = [
  { end: true, icon: 'check', label: 'Minhas viagens', to: '/motorista/:motoristaId' },
  { icon: 'reports', label: 'Histórico', to: '/motorista/:motoristaId/historico' },
];

export const statusTabs = ['Todos', 'Ativo', 'Manutenção', 'Inativo', 'Bloqueado'];

export const vehicleFormOptions = {
  licenseCategories: ['A', 'B', 'C', 'D', 'E'],
  statuses: ['Ativo', 'Manutenção', 'Reservado', 'Inativo'],
};
