package com.ctrlfleet.api.dto.motorista;

import java.time.LocalDateTime;

public class ViagemHistoricoReservaDTO {
    private Long idReserva;
    private String statusReserva;
    private String origem;
    private String destino;
    private Double origemLat;
    private Double origemLng;
    private Double destinoLat;
    private Double destinoLng;
    private String placaVeiculo;
    private String modeloVeiculo;
    private LocalDateTime dataHoraInicioPrevista;
    private LocalDateTime dataHoraFimEstimada;
    private LocalDateTime dataSaida;
    private LocalDateTime dataRetorno;
    private Double quilometragemSaida;
    private Double quilometragemRetorno;
    private Double quilometragemPercorrida;
    private String observacoesVeiculo;

    public ViagemHistoricoReservaDTO(
            Long idReserva,
            String statusReserva,
            String origem,
            String destino,
            Double origemLat,
            Double origemLng,
            Double destinoLat,
            Double destinoLng,
            String placaVeiculo,
            String modeloVeiculo,
            LocalDateTime dataHoraInicioPrevista,
            LocalDateTime dataHoraFimEstimada,
            LocalDateTime dataSaida,
            LocalDateTime dataRetorno,
            Double quilometragemSaida,
            Double quilometragemRetorno,
            Double quilometragemPercorrida,
            String observacoesVeiculo) {
        this.idReserva = idReserva;
        this.statusReserva = statusReserva;
        this.origem = origem;
        this.destino = destino;
        this.origemLat = origemLat;
        this.origemLng = origemLng;
        this.destinoLat = destinoLat;
        this.destinoLng = destinoLng;
        this.placaVeiculo = placaVeiculo;
        this.modeloVeiculo = modeloVeiculo;
        this.dataHoraInicioPrevista = dataHoraInicioPrevista;
        this.dataHoraFimEstimada = dataHoraFimEstimada;
        this.dataSaida = dataSaida;
        this.dataRetorno = dataRetorno;
        this.quilometragemSaida = quilometragemSaida;
        this.quilometragemRetorno = quilometragemRetorno;
        this.quilometragemPercorrida = quilometragemPercorrida;
        this.observacoesVeiculo = observacoesVeiculo;
    }

    public Long getIdReserva() {
        return idReserva;
    }

    public String getStatusReserva() {
        return statusReserva;
    }

    public String getOrigem() {
        return origem;
    }

    public String getDestino() {
        return destino;
    }

    public Double getOrigemLat() {
        return origemLat;
    }

    public Double getOrigemLng() {
        return origemLng;
    }

    public Double getDestinoLat() {
        return destinoLat;
    }

    public Double getDestinoLng() {
        return destinoLng;
    }

    public String getPlacaVeiculo() {
        return placaVeiculo;
    }

    public String getModeloVeiculo() {
        return modeloVeiculo;
    }

    public LocalDateTime getDataHoraInicioPrevista() {
        return dataHoraInicioPrevista;
    }

    public LocalDateTime getDataHoraFimEstimada() {
        return dataHoraFimEstimada;
    }

    public LocalDateTime getDataSaida() {
        return dataSaida;
    }

    public LocalDateTime getDataRetorno() {
        return dataRetorno;
    }

    public Double getQuilometragemSaida() {
        return quilometragemSaida;
    }

    public Double getQuilometragemRetorno() {
        return quilometragemRetorno;
    }

    public Double getQuilometragemPercorrida() {
        return quilometragemPercorrida;
    }

    public String getObservacoesVeiculo() {
        return observacoesVeiculo;
    }
}
