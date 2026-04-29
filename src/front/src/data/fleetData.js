export const navigationItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { icon: 'fleet', label: 'Frota', to: '/frota' },
  { badge: 1, icon: 'reservations', label: 'Reservas', to: '/reservas' },
  { badge: 5, icon: 'maintenance', label: 'Manutenção', to: '/manutencao' },
  { icon: 'preventive', label: 'Prog. Preventiva', to: '/programacao-preventiva' },
  { icon: 'reports', label: 'Relatórios', to: '/relatorios' },
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
    text: '3 cadastros novos aguardam complementação documental.',
  },
];

export const secretariats = [
  'Secretaria (Todas)',
  'Gabinete',
  'Saúde',
  'Educação',
  'Obras',
  'Administração',
];

export const statusTabs = ['Todos', 'Ativo', 'Manutenção', 'Bloqueado'];

export const registrationSteps = [
  { description: 'Placa, modelo, secretaria e perfil operacional.', label: 'Dados do veículo' },
  { description: 'Validades e regularização documental.', label: 'Documentação' },
];

export const fleetVehicles = [
  {
    documents: [
      { dueDate: '12/05/2026', label: 'IPVA', shortLabel: 'IP', state: 'ok' },
      { dueDate: '28/11/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '17/09/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'ok' },
    ],
    history: [
      { date: '28/04/2026', label: 'Reserva concluída para agenda institucional.' },
      { date: '20/04/2026', label: 'Checklist revisado e documento validado.' },
    ],
    id: 'rbc-4e21',
    licenseCategory: 'B',
    mileage: '48.230 km',
    model: 'Toyota Hilux SW4',
    plate: 'RBC-4E21',
    secretariat: 'Gabinete',
    status: 'Ativo',
    year: '2024',
  },
  {
    documents: [
      { dueDate: '10/02/2026', label: 'IPVA', shortLabel: 'IP', state: 'warning' },
      { dueDate: '22/08/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '15/01/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'expired' },
    ],
    history: [
      { date: '27/04/2026', label: 'Bloqueado automaticamente por documento vencido.' },
      { date: '11/04/2026', label: 'Solicitada atualização de licenciamento.' },
    ],
    id: 'kms-8812',
    licenseCategory: 'D',
    mileage: '126.100 km',
    model: 'Fiat Ducato Maxxi',
    plate: 'KMS-8812',
    secretariat: 'Saúde',
    status: 'Bloqueado',
    year: '2021',
  },
  {
    documents: [
      { dueDate: '18/08/2026', label: 'IPVA', shortLabel: 'IP', state: 'ok' },
      { dueDate: '18/08/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '30/08/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'ok' },
    ],
    history: [
      { date: '26/04/2026', label: 'Retorno da manutenção preventiva concluído.' },
      { date: '17/04/2026', label: 'Troca de pneus dianteiros.' },
    ],
    id: 'rva-3021',
    licenseCategory: 'B',
    mileage: '62.455 km',
    model: 'Renault Oroch',
    plate: 'RVA-3021',
    secretariat: 'Obras',
    status: 'Manutenção',
    year: '2023',
  },
  {
    documents: [
      { dueDate: '12/10/2026', label: 'IPVA', shortLabel: 'IP', state: 'ok' },
      { dueDate: '03/12/2026', label: 'Seguro', shortLabel: 'SG', state: 'ok' },
      { dueDate: '22/10/2026', label: 'Licenciamento', shortLabel: 'LC', state: 'ok' },
    ],
    history: [
      { date: '24/04/2026', label: 'Veículo alocado para rota da educação.' },
      { date: '05/04/2026', label: 'Cadastro revisado pelo gestor.' },
    ],
    id: 'mta-9011',
    licenseCategory: 'D',
    mileage: '84.020 km',
    model: 'Mercedes Sprinter',
    plate: 'MTA-9011',
    secretariat: 'Educação',
    status: 'Ativo',
    year: '2022',
  },
];

export const vehicleFormOptions = {
  licenseCategories: ['A', 'B', 'C', 'D', 'E'],
  secretariats: ['Gabinete', 'Saúde', 'Educação', 'Obras', 'Administração'],
  statuses: ['Ativo', 'Manutenção', 'Reservado', 'Inativo'],
};
