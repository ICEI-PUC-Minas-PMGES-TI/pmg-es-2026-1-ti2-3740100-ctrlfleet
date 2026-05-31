import { apiFetch, parseApiResponse } from './apiBase';
import { buscarVeiculo } from './veiculoApi';

async function request(path, options = {}) {
  const res = await apiFetch(path, options);
  return parseApiResponse(res);
}

function isEndpointUnavailableError(error) {
  const message = String(error?.message || '');
  return message.includes('(403)') || message.includes('(404)');
}

async function assertVeiculoDoMotorista(motoristaId, veiculoId, options = {}) {
  const owned = await listarVeiculosDoMotorista(motoristaId, {
    apenasDisponiveis: false,
    signal: options.signal,
  });

  if (!(owned || []).some((item) => String(item.id) === String(veiculoId))) {
    throw new Error('Veículo não vinculado ao seu perfil.');
  }
}

export async function listarMotoristasAtivos(options = {}) {
  return request('/motoristas/ativos', { signal: options.signal });
}

async function enrichVehicleDocuments(vehicles, options = {}) {
  return Promise.all(
    (vehicles || []).map(async (vehicle) => {
      if (Array.isArray(vehicle.documentos) && vehicle.documentos.length > 0) {
        return vehicle;
      }
      try {
        return await buscarVeiculo(vehicle.id, { signal: options.signal });
      } catch {
        return vehicle;
      }
    }),
  );
}

export async function listarVeiculosDoMotorista(motoristaId, options = {}) {
  const params = new URLSearchParams();
  if (options.apenasDisponiveis === true) params.set('apenasDisponiveis', 'true');
  else if (options.apenasDisponiveis === false) params.set('apenasDisponiveis', 'false');
  const query = params.toString() ? `?${params}` : '';
  const items = await request(`/motoristas/${motoristaId}/veiculos${query}`, { signal: options.signal });
  return enrichVehicleDocuments(items, options);
}

export async function buscarVeiculoDoMotorista(motoristaId, veiculoId, options = {}) {
  try {
    return await request(`/motoristas/${motoristaId}/veiculos/${veiculoId}`, { signal: options.signal });
  } catch (error) {
    if (!isEndpointUnavailableError(error)) throw error;

    await assertVeiculoDoMotorista(motoristaId, veiculoId, options);
    return buscarVeiculo(veiculoId, { signal: options.signal });
  }
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
