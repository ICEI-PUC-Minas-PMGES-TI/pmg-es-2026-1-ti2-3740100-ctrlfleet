import { resolveRegistrosUsoForReserva } from '../utils/mockRegistroUso';
import { mapRegistroUsoFromApi, mapRegistrosUsoFromApi } from '../utils/registroUsoMappers';

import { apiFetch, parseApiResponse } from './apiBase';

/**
 * Lista todos os registros de uso de um veículo, ordenados por data mais recente.
 * @param {number|string} veiculoId
 * @returns {Promise<Array>}
 */
export async function listarRegistrosPorVeiculo(veiculoId) {
  const res = await apiFetch(`/registros-uso/veiculo/${veiculoId}`);
  const data = await parseApiResponse(res);
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
  const res = await apiFetch(`/registros-uso/reserva/${reservaId}`);

  if (!res.ok) {
    if (reserva?.statusReserva === 'CONCLUIDA') {
      return resolveRegistrosUsoForReserva(reserva, []);
    }
    await parseApiResponse(res);
  }

  const data = await parseApiResponse(res);
  const registros = mapRegistrosUsoFromApi(Array.isArray(data) ? data : []);
  return resolveRegistrosUsoForReserva(reserva, registros);
}

/**
 * Gera o registro de uso ao finalizar a corrida.
 * @param {Record<string, unknown>} payload corpo alinhado ao `FinalizarCorridaRequestDTO`
 * @returns {Promise<object>}
 */
export async function finalizarCorrida(payload) {
  const res = await apiFetch('/registros-uso/finalizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await parseApiResponse(res);
  return mapRegistroUsoFromApi(data);
}
