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
    private String statusReserva;
    private LocalDateTime dataHoraInicioPrevista;
    private LocalDateTime dataHoraFimEstimada;
    private Double ultimaQuilometragemVeiculo;
    private List<ChecklistItemResponseDTO> checklistSaida;

    public ReservaMotoristaResponseDTO(
            Long idReserva,
            Long idSolicitante,
            String nomeSolicitante,
            Long idVeiculo,
            String placaVeiculo,
            String modeloVeiculo,
            String origem,
            String destino,
            String statusReserva,
            LocalDateTime dataHoraInicioPrevista,
            LocalDateTime dataHoraFimEstimada,
            Double ultimaQuilometragemVeiculo,
            List<ChecklistItemResponseDTO> checklistSaida) {
        this.idReserva = idReserva;
        this.idSolicitante = idSolicitante;
        this.nomeSolicitante = nomeSolicitante;
        this.idVeiculo = idVeiculo;
        this.placaVeiculo = placaVeiculo;
        this.modeloVeiculo = modeloVeiculo;
        this.origem = origem;
        this.destino = destino;
        this.statusReserva = statusReserva;
        this.dataHoraInicioPrevista = dataHoraInicioPrevista;
        this.dataHoraFimEstimada = dataHoraFimEstimada;
        this.ultimaQuilometragemVeiculo = ultimaQuilometragemVeiculo;
        this.checklistSaida = checklistSaida;
    }

    public Long getIdReserva() { return idReserva; }
    public Long getIdSolicitante() { return idSolicitante; }
    public String getNomeSolicitante() { return nomeSolicitante; }
    public Long getIdVeiculo() { return idVeiculo; }
    public String getPlacaVeiculo() { return placaVeiculo; }
    public String getModeloVeiculo() { return modeloVeiculo; }
    public String getOrigem() { return origem; }
    public String getDestino() { return destino; }
    public String getStatusReserva() { return statusReserva; }
    public LocalDateTime getDataHoraInicioPrevista() { return dataHoraInicioPrevista; }
    public LocalDateTime getDataHoraFimEstimada() { return dataHoraFimEstimada; }
    public Double getUltimaQuilometragemVeiculo() { return ultimaQuilometragemVeiculo; }
    public List<ChecklistItemResponseDTO> getChecklistSaida() { return checklistSaida; }
}
