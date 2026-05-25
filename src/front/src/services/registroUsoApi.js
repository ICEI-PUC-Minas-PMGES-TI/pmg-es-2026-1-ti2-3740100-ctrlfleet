import { resolveRegistrosUsoForReserva } from '../utils/mockRegistroUso';
import { mapRegistroUsoFromApi, mapRegistrosUsoFromApi } from '../utils/registroUsoMappers';

import { buildApiUrl } from './apiBase';

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

/**
 * Lista todos os registros de uso de um veículo, ordenados por data mais recente.
 * @param {number|string} veiculoId
 * @returns {Promise<Array>}
 */
export async function listarRegistrosPorVeiculo(veiculoId) {
  const res = await fetch(buildApiUrl(`/registros-uso/veiculo/${veiculoId}`));

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível carregar registros de uso (${res.status})`;
    throw new Error(msg);
  }

  return mapRegistrosUsoFromApi(data || []);
}

/**
 * Lista os registros vinculados a uma reserva.
 * Para reservas concluídas sem vínculo no backend, preenche com dados de apoio do seed.
 * @param {number|string} reservaId
 * @param {object|null} reserva metadados da reserva (status, datas, veículo…)
 * @returns {Promise<Array>}
 */
export async function listarRegistrosPorReserva(reservaId, reserva = null) {
  const res = await fetch(buildApiUrl(`/registros-uso/reserva/${reservaId}`));

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    if (reserva?.statusReserva === 'CONCLUIDA') {
      return resolveRegistrosUsoForReserva(reserva, []);
    }
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível carregar o histórico da reserva (${res.status})`;
    throw new Error(msg);
  }

  const registros = mapRegistrosUsoFromApi(Array.isArray(data) ? data : []);
  return resolveRegistrosUsoForReserva(reserva, registros);
}

/**
 * Gera o registro de uso ao finalizar a corrida.
 * @param {Record<string, unknown>} payload corpo alinhado ao `FinalizarCorridaRequestDTO`
 * @returns {Promise<object>}
 */
export async function finalizarCorrida(payload) {
  const res = await fetch(buildApiUrl('/registros-uso/finalizar'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = parseJsonSafely(await res.text());

  if (!res.ok) {
    const msg =
      (data && typeof data.mensagem === 'string' && data.mensagem) ||
      (data && typeof data.message === 'string' && data.message) ||
      `Não foi possível finalizar corrida (${res.status})`;
    throw new Error(msg);
  }

  return mapRegistroUsoFromApi(data);
}
