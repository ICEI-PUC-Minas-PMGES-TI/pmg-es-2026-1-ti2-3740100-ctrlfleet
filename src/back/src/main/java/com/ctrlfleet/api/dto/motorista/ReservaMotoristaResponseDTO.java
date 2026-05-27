package com.ctrlfleet.api.dto.motorista;

import java.time.LocalDateTime;
import java.util.List;

public class ReservaMotoristaResponseDTO {
    private Long idReserva;
    private Long idSolicitante;
    private String nomeSolicitante;
    private Long idVeiculo;
    private String placaVeiculo;
    private String modeloVeiculo;
    private String origem;
    private String destino;
    private Double origemLat;
    private Double origemLng;
    private Double destinoLat;
    private Double destinoLng;
    private String justificativa;
    private String tipoVeiculo;
    private String statusReserva;
    private LocalDateTime dataHoraInicioPrevista;
    private LocalDateTime dataHoraFimEstimada;
    private Double ultimaQuilometragemVeiculo;
    private List<ChecklistItemResponseDTO> checklistSaida;
    /** Itens do checklist de retorno (viagem em uso); vazio para reservas apenas aprovadas. */
    private List<ChecklistItemResponseDTO> checklistRetorno;
    /** Quilometragem registrada na saída do trajeto atual; nulo se não há registro de uso aberto. */
    private Double quilometragemSaidaTrajeto;
    /** Checklist de saída já salvo para esta reserva/motorista (antes de iniciar a corrida). */
    private boolean checklistSaidaConcluido;

    public ReservaMotoristaResponseDTO(
            Long idReserva,
            Long idSolicitante,
            String nomeSolicitante,
            Long idVeiculo,
            String placaVeiculo,
            String modeloVeiculo,
            String origem,
            String destino,
            Double origemLat,
            Double origemLng,
            Double destinoLat,
            Double destinoLng,
            String justificativa,
            String tipoVeiculo,
            String statusReserva,
            LocalDateTime dataHoraInicioPrevista,
            LocalDateTime dataHoraFimEstimada,
            Double ultimaQuilometragemVeiculo,
            List<ChecklistItemResponseDTO> checklistSaida,
            List<ChecklistItemResponseDTO> checklistRetorno,
            Double quilometragemSaidaTrajeto,
            boolean checklistSaidaConcluido) {
        this.idReserva = idReserva;
        this.idSolicitante = idSolicitante;
        this.nomeSolicitante = nomeSolicitante;
        this.idVeiculo = idVeiculo;
        this.placaVeiculo = placaVeiculo;
        this.modeloVeiculo = modeloVeiculo;
        this.origem = origem;
        this.destino = destino;
        this.origemLat = origemLat;
        this.origemLng = origemLng;
        this.destinoLat = destinoLat;
        this.destinoLng = destinoLng;
        this.justificativa = justificativa;
        this.tipoVeiculo = tipoVeiculo;
        this.statusReserva = statusReserva;
        this.dataHoraInicioPrevista = dataHoraInicioPrevista;
        this.dataHoraFimEstimada = dataHoraFimEstimada;
        this.ultimaQuilometragemVeiculo = ultimaQuilometragemVeiculo;
        this.checklistSaida = checklistSaida;
        this.checklistRetorno = checklistRetorno;
        this.quilometragemSaidaTrajeto = quilometragemSaidaTrajeto;
        this.checklistSaidaConcluido = checklistSaidaConcluido;
    }

    public Long getIdReserva() { return idReserva; }
    public Long getIdSolicitante() { return idSolicitante; }
    public String getNomeSolicitante() { return nomeSolicitante; }
    public Long getIdVeiculo() { return idVeiculo; }
    public String getPlacaVeiculo() { return placaVeiculo; }
    public String getModeloVeiculo() { return modeloVeiculo; }
    public String getOrigem() { return origem; }
    public String getDestino() { return destino; }
    public Double getOrigemLat() { return origemLat; }
    public Double getOrigemLng() { return origemLng; }
    public Double getDestinoLat() { return destinoLat; }
    public Double getDestinoLng() { return destinoLng; }
    public String getJustificativa() { return justificativa; }
    public String getTipoVeiculo() { return tipoVeiculo; }
    public String getStatusReserva() { return statusReserva; }
    public LocalDateTime getDataHoraInicioPrevista() { return dataHoraInicioPrevista; }
    public LocalDateTime getDataHoraFimEstimada() { return dataHoraFimEstimada; }
    public Double getUltimaQuilometragemVeiculo() { return ultimaQuilometragemVeiculo; }
    public List<ChecklistItemResponseDTO> getChecklistSaida() { return checklistSaida; }

    public List<ChecklistItemResponseDTO> getChecklistRetorno() {
        return checklistRetorno;
    }

    public Double getQuilometragemSaidaTrajeto() {
        return quilometragemSaidaTrajeto;
    }

    public boolean isChecklistSaidaConcluido() {
        return checklistSaidaConcluido;
    }
}
