import { apiRequest } from './apiClient';

export async function listarRegistrosPorVeiculo(veiculoId) {
  return (await apiRequest(`/registros-uso/veiculo/${veiculoId}`)) || [];
}

export async function finalizarCorrida(payload) {
  return apiRequest('/registros-uso/finalizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
