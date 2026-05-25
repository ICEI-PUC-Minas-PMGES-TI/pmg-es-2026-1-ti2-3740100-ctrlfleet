/**
 * Normaliza o payload da API para as colunas da tabela `registros_uso`.
 * Campos derivados (placa, motorista, origem/destino) vêm de joins no backend.
 */
export function mapRegistroUsoFromApi(raw) {
  if (!raw) return null;

  const idUso = raw.idUso ?? raw.id ?? null;
  const quilometragemSaida = raw.quilometragemSaida;
  const quilometragemRetorno = raw.quilometragemRetorno;

  let quilometragemPercorrida = raw.quilometragemPercorrida;
  if (
    quilometragemPercorrida == null &&
    quilometragemSaida != null &&
    quilometragemRetorno != null
  ) {
    quilometragemPercorrida = quilometragemRetorno - quilometragemSaida;
  }

  return {
    idUso,
    id: idUso,
    idReserva: raw.idReserva ?? null,
    idVeiculo: raw.idVeiculo ?? null,
    idMotorista: raw.idMotorista ?? null,
    dataSaida: raw.dataSaida ?? null,
    quilometragemSaida,
    dataRetorno: raw.dataRetorno ?? null,
    quilometragemRetorno,
    observacoesVeiculo: raw.observacoesVeiculo ?? null,
    quilometragemPercorrida,
    placaVeiculo: raw.placaVeiculo ?? null,
    modeloVeiculo: raw.modeloVeiculo ?? null,
    nomeMotorista: raw.nomeMotorista ?? null,
    origem: raw.origem ?? null,
    destino: raw.destino ?? null,
    statusReserva: raw.statusReserva ?? null,
  };
}

export function mapRegistrosUsoFromApi(list) {
  if (!Array.isArray(list)) return [];
  return list.map(mapRegistroUsoFromApi).filter(Boolean);
}
