import { mapRegistroUsoFromApi } from './registroUsoMappers';

/**
 * Dados alinhados ao seed da seção 12 em data.sql (registros_uso).
 */
const PRESET_BY_RESERVA = {
  1: {
    idUso: 1,
    idVeiculo: 1,
    idMotorista: 5,
    nomeMotorista: 'Patrícia Melo',
    dataSaida: '2026-04-10T08:00:00',
    quilometragemSaida: 15200,
    dataRetorno: '2026-04-10T17:30:00',
    quilometragemRetorno: 15340,
    observacoesVeiculo: 'Viagem para vistoria na regional norte. Veículo entregue em ordem.',
  },
  2: {
    idUso: 2,
    idVeiculo: 2,
    idMotorista: 6,
    nomeMotorista: 'Leandro Sousa',
    dataSaida: '2026-04-05T06:45:00',
    quilometragemSaida: 32100,
    dataRetorno: '2026-04-05T14:00:00',
    quilometragemRetorno: 32250,
    observacoesVeiculo: 'Deslocamento à Secretaria de Educação. Sem ocorrências.',
  },
  3: {
    idUso: 3,
    idVeiculo: 5,
    idMotorista: 4,
    nomeMotorista: 'Carlos Rocha',
    dataSaida: '2026-04-02T08:15:00',
    quilometragemSaida: 48000,
    dataRetorno: '2026-04-02T17:00:00',
    quilometragemRetorno: 48180,
    observacoesVeiculo: 'Fiscalização de obras na zona sul.',
  },
  4: {
    idUso: 4,
    idVeiculo: 5,
    idMotorista: 6,
    nomeMotorista: 'Leandro Sousa',
    dataSaida: '2026-04-15T07:00:00',
    quilometragemSaida: 48180,
    dataRetorno: '2026-04-15T11:30:00',
    quilometragemRetorno: 48260,
    observacoesVeiculo: 'Entrega de documentos no fórum.',
  },
};

const FALLBACK_MOTORISTAS = [
  { id: 5, nome: 'Patrícia Melo' },
  { id: 6, nome: 'Leandro Sousa' },
  { id: 4, nome: 'Carlos Rocha' },
];

export function buildMockRegistrosUso(reserva) {
  if (!reserva || reserva.statusReserva !== 'CONCLUIDA') {
    return [];
  }

  const idReserva = Number(reserva.idReserva) || 0;
  const preset = PRESET_BY_RESERVA[idReserva];
  const motorista = preset
    ? { id: preset.idMotorista, nome: preset.nomeMotorista }
    : FALLBACK_MOTORISTAS[idReserva % FALLBACK_MOTORISTAS.length];

  const kmSaida = preset?.quilometragemSaida ?? 11800 + idReserva * 620;
  const kmRetorno = preset?.quilometragemRetorno ?? kmSaida + 72 + (idReserva % 4) * 28;

  return [
    mapRegistroUsoFromApi({
      idUso: preset?.idUso ?? idReserva,
      idReserva: reserva.idReserva,
      idVeiculo: preset?.idVeiculo ?? reserva.idVeiculo,
      idMotorista: motorista.id,
      placaVeiculo: reserva.placaVeiculo,
      modeloVeiculo: reserva.modeloVeiculo,
      nomeMotorista: motorista.nome,
      dataSaida: preset?.dataSaida ?? reserva.dataHoraInicioPrevista,
      quilometragemSaida: kmSaida,
      dataRetorno: preset?.dataRetorno ?? reserva.dataHoraFimEstimada,
      quilometragemRetorno: kmRetorno,
      observacoesVeiculo: preset?.observacoesVeiculo || null,
      statusReserva: 'CONCLUIDA',
    }),
  ];
}

export function resolveRegistrosUsoForReserva(reserva, registrosApi = []) {
  if (Array.isArray(registrosApi) && registrosApi.length > 0) {
    return registrosApi;
  }
  return buildMockRegistrosUso(reserva);
}
