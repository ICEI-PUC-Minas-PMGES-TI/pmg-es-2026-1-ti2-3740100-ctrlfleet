import { buildApiUrl } from './apiBase';

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

async function request(path, options = {}) {
  const res = await fetch(buildApiUrl(path), options);
  const data = parseJsonSafely(await res.text());
  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Falha na requisição (${res.status})`;
    throw new Error(msg);
  }
  return data;
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
