import { apiRequest } from './apiClient';

const statusLabels = {
  DESATIVADO: 'Bloqueado',
  DISPONIVEL: 'Ativo',
  EM_USO: 'Ativo',
  MANUTENCAO: 'Manutencao',
};

function formatDateBr(date) {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function documentState(date) {
  if (!date) return 'warning';
  const today = new Date();
  const dueDate = new Date(`${date}T00:00:00`);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 45) return 'warning';
  return 'ok';
}

function mapMotorista(motorista) {
  if (!motorista) return null;
  return {
    cnh: motorista.numeroCnh ?? '',
    cnhExpiry: formatDateBr(motorista.validadeCnh),
    cpf: '',
    email: motorista.email,
    id: String(motorista.id),
    name: motorista.nome,
    status: 'Ativo',
  };
}

function mapVeiculo(veiculo) {
  return {
    documents: [
      { dueDate: formatDateBr(veiculo.vencimentoIpva), label: 'IPVA', shortLabel: 'IP', state: documentState(veiculo.vencimentoIpva) },
      { dueDate: formatDateBr(veiculo.vencimentoSeguro), label: 'Seguro', shortLabel: 'SG', state: documentState(veiculo.vencimentoSeguro) },
      {
        dueDate: formatDateBr(veiculo.vencimentoLicenciamento),
        label: 'Licenciamento',
        shortLabel: 'LC',
        state: documentState(veiculo.vencimentoLicenciamento),
      },
    ],
    driver: mapMotorista(veiculo.motorista),
    history: [],
    id: String(veiculo.id),
    licenseCategory: veiculo.categoriaCnh,
    mileage: `${Number(veiculo.quilometragem ?? 0).toLocaleString('pt-BR')} km`,
    model: veiculo.modelo,
    plate: veiculo.placa,
    secretariat: veiculo.secretaria,
    status: statusLabels[veiculo.status] ?? veiculo.status,
    year: String(veiculo.ano),
  };
}

export async function listarVeiculos() {
  const data = await apiRequest('/veiculos');
  return (data || []).map(mapVeiculo);
}

export async function buscarVeiculo(id) {
  const data = await apiRequest(`/veiculos/${id}`);
  return mapVeiculo(data);
}
