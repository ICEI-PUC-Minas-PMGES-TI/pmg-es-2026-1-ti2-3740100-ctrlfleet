import { apiRequest } from './apiClient';

const roleLabels = {
  ROLE_ADMINISTRADOR: 'Administrador',
  ROLE_GESTOR_FROTA: 'Gestor de Frota',
  ROLE_MOTORISTA: 'Motorista',
  ROLE_SOLICITANTE: 'Servidor Solicitante',
};

function formatDateBr(date) {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function getPrimaryRole(usuario) {
  const roles = Array.isArray(usuario.roles) ? usuario.roles : [];
  return roles[0]?.nome;
}

function mapUsuario(usuario) {
  const role = roleLabels[getPrimaryRole(usuario)] ?? 'Servidor Solicitante';

  return {
    cnh: usuario.numeroCnh ?? '',
    cnhExpiry: formatDateBr(usuario.validadeCnh),
    cpf: usuario.matricula ?? '',
    email: usuario.email,
    id: String(usuario.id),
    lastAccess: 'Persistido no banco',
    name: usuario.nome,
    role,
    secretariat: usuario.departamento ?? 'Administracao',
    status: 'Ativo',
  };
}

export async function criarUsuario(payload) {
  return apiRequest('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function listarUsuarios() {
  const data = await apiRequest('/usuarios');
  return (data || []).map(mapUsuario);
}
