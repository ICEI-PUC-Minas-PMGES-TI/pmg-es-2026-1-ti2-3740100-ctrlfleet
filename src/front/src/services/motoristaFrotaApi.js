import { apiFetch, parseApiResponse } from './apiBase';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
}

export async function listarMotoristasAtivos(options = {}) {
  return request('/motoristas/ativos', { signal: options.signal });
}

export async function listarVeiculosDoMotorista(motoristaId, options = {}) {
  const params = new URLSearchParams();
  if (options.apenasDisponiveis !== false) params.set('apenasDisponiveis', 'true');
  const query = params.toString() ? `?${params}` : '';
  return request(`/motoristas/${motoristaId}/veiculos${query}`, { signal: options.signal });
}

export function mapMotoristaToView(dto) {
  return {
    id: dto.id,
    name: dto.nome,
    matricula: dto.matricula,
    cnh: dto.numeroCnh,
    veiculosVinculados: dto.veiculosVinculados ?? 0,
  };
}
