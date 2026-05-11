export const fleetNavigationItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/gestor/dashboard' },
  { icon: 'fleet', label: 'Frota', to: '/gestor/frota' },
  { badge: 1, icon: 'reservations', label: 'Reservas', to: '/gestor/reservas' },
  { badge: 5, icon: 'maintenance', label: 'Manutenção', to: '/gestor/manutencao' },
  { icon: 'preventive', label: 'Prog. Preventiva', to: '/gestor/programacao-preventiva' },
  { icon: 'reports', label: 'Relatórios', to: '/gestor/relatorios' },
];

export const dashboardStats = [
  { caption: 'veículos ativos hoje', icon: 'fleet', title: 'Disponíveis', value: '42' },
  { caption: 'precisam de atenção', icon: 'alert', title: 'Alertas', value: '07' },
  { caption: 'programadas na semana', icon: 'maintenance', title: 'Manutenções', value: '05' },
  { caption: 'aprovações pendentes', icon: 'reservations', title: 'Reservas', value: '03' },
];

export const dashboardAlerts = [
  {
    id: 'a1',
    status: 'Bloqueado',
    text: 'KMS-8812 está com licenciamento vencido e segue indisponível.',
  },
  {
    id: 'a2',
    status: 'Manutenção',
    text: 'RVA-3021 retorna da oficina amanhã às 14h.',
  },
  {
    id: 'a3',
    status: 'Ativo',
    text: '3 cadastros novos aguardam validação documental.',
  },
];

export const statusTabs = ['Todos', 'Ativo', 'Manutenção', 'Inativo', 'Bloqueado'];

export const fleetVehicles = [
  {
    documents: [
      { dueDate: '12/05/2026', label: 'IPVA', shortLabel: 'IP', state: 'ok' },
      { dueDate: '28/11/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '17/09/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'ok' },
    ],
    driver: {
      cnh: '05891234765',
      cnhExpiry: '21/02/2029',
      cpf: '703.554.192-14',
      email: 'leandro.sousa@ctrlfleet.gov.br',
      id: 'leandro-sousa',
      name: 'Leandro Sousa',
      status: 'Ativo',
    },
    history: [
      { date: '28/04/2026', label: 'Reserva concluída para agenda institucional.' },
      { date: '20/04/2026', label: 'Checklist revisado e documento validado.' },
    ],
    id: '1',
    licenseCategory: 'B',
    mileage: '48.230 km',
    model: 'Toyota Hilux SW4',
    plate: 'RBC-4E21',
    status: 'Ativo',
    year: '2024',
  },
  {
    documents: [
      { dueDate: '10/02/2026', label: 'IPVA', shortLabel: 'IP', state: 'warning' },
      { dueDate: '22/08/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '15/01/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'expired' },
    ],
    driver: {
      cnh: '03124567890',
      cnhExpiry: '18/11/2027',
      cpf: '456.789.012-43',
      email: 'carlos.rocha@ctrlfleet.gov.br',
      id: 'carlos-rocha',
      name: 'Carlos Rocha',
      status: 'Bloqueado',
    },
    history: [
      { date: '27/04/2026', label: 'Bloqueado automaticamente por documento vencido.' },
      { date: '11/04/2026', label: 'Solicitada atualização de licenciamento.' },
    ],
    id: '2',
    licenseCategory: 'D',
    mileage: '126.100 km',
    model: 'Fiat Ducato Maxxi',
    plate: 'KMS-8812',
    status: 'Bloqueado',
    year: '2021',
  },
  {
    documents: [
      { dueDate: '18/08/2026', label: 'IPVA', shortLabel: 'IP', state: 'ok' },
      { dueDate: '18/08/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '30/08/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'ok' },
    ],
    driver: {
      cnh: '03124567890',
      cnhExpiry: '18/11/2027',
      cpf: '456.789.012-43',
      email: 'carlos.rocha@ctrlfleet.gov.br',
      id: 'carlos-rocha',
      name: 'Carlos Rocha',
      status: 'Bloqueado',
    },
    history: [
      { date: '26/04/2026', label: 'Retorno da manutenção preventiva concluído.' },
      { date: '17/04/2026', label: 'Troca de pneus dianteiros.' },
    ],
    id: '5',
    licenseCategory: 'B',
    mileage: '62.455 km',
    model: 'Renault Oroch',
    plate: 'RVA-3021',
    status: 'Manutenção',
    year: '2023',
  },
  {
    documents: [
      { dueDate: '12/10/2026', label: 'IPVA', shortLabel: 'IP', state: 'ok' },
      { dueDate: '03/12/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '22/10/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'ok' },
    ],
    driver: {
      cnh: '04567891234',
      cnhExpiry: '09/08/2028',
      cpf: '612.443.981-02',
      email: 'patricia.melo@ctrlfleet.gov.br',
      id: 'patricia-melo',
      name: 'Patrícia Melo',
      status: 'Ativo',
    },
    history: [
      { date: '24/04/2026', label: 'Veículo alocado para rota da educação.' },
      { date: '05/04/2026', label: 'Cadastro revisado pelo gestor.' },
    ],
    id: '4',
    licenseCategory: 'D',
    mileage: '84.020 km',
    model: 'Mercedes Sprinter',
    plate: 'MTA-9011',
    status: 'Ativo',
    year: '2022',
  },
];

export const vehicleFormOptions = {
  licenseCategories: ['A', 'B', 'C', 'D', 'E'],
  statuses: ['Ativo', 'Manutenção', 'Reservado', 'Inativo'],
};
