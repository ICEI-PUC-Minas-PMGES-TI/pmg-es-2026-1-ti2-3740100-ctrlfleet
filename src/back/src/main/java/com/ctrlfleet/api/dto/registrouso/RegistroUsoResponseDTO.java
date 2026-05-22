package com.ctrlfleet.api.dto.registrouso;

import java.time.LocalDateTime;

public class RegistroUsoResponseDTO {

    private Long id;
    private Long idVeiculo;
    private String placaVeiculo;
    private String modeloVeiculo;
    private Long idMotorista;
    private String nomeMotorista;
    private Long idReserva;
    private String origem;
    private String destino;
    private LocalDateTime dataSaida;
    private Double quilometragemSaida;
    private LocalDateTime dataRetorno;
    private Double quilometragemRetorno;
    private String observacoesVeiculo;
    private Double quilometragemPercorrida;
    private String statusReserva;

    public RegistroUsoResponseDTO() {
    }

    public RegistroUsoResponseDTO(
            Long id,
            Long idVeiculo,
            String placaVeiculo,
            String modeloVeiculo,
            Long idMotorista,
            String nomeMotorista,
            Long idReserva,
            String origem,
            String destino,
            LocalDateTime dataSaida,
            Double quilometragemSaida,
            LocalDateTime dataRetorno,
            Double quilometragemRetorno,
            String observacoesVeiculo) {
        this(
                id,
                idVeiculo,
                placaVeiculo,
                modeloVeiculo,
                idMotorista,
                nomeMotorista,
                idReserva,
                origem,
                destino,
                dataSaida,
                quilometragemSaida,
                dataRetorno,
                quilometragemRetorno,
                observacoesVeiculo,
                null,
                null);
    }

    public RegistroUsoResponseDTO(
            Long id,
            Long idVeiculo,
            String placaVeiculo,
            Long idMotorista,
            String nomeMotorista,
            Long idReserva,
            LocalDateTime dataSaida,
            Double quilometragemSaida,
            LocalDateTime dataRetorno,
            Double quilometragemRetorno,
            String observacoesVeiculo,
            Double quilometragemPercorrida,
            String statusReserva) {
        this(
                id,
                idVeiculo,
                placaVeiculo,
                null,
                idMotorista,
                nomeMotorista,
                idReserva,
                null,
                null,
                dataSaida,
                quilometragemSaida,
                dataRetorno,
                quilometragemRetorno,
                observacoesVeiculo,
                quilometragemPercorrida,
                statusReserva);
    }

    public RegistroUsoResponseDTO(
            Long id,
            Long idVeiculo,
            String placaVeiculo,
            String modeloVeiculo,
            Long idMotorista,
            String nomeMotorista,
            Long idReserva,
            String origem,
            String destino,
            LocalDateTime dataSaida,
            Double quilometragemSaida,
            LocalDateTime dataRetorno,
            Double quilometragemRetorno,
            String observacoesVeiculo,
            Double quilometragemPercorrida,
            String statusReserva) {
        this.id = id;
        this.idVeiculo = idVeiculo;
        this.placaVeiculo = placaVeiculo;
        this.modeloVeiculo = modeloVeiculo;
        this.idMotorista = idMotorista;
        this.nomeMotorista = nomeMotorista;
        this.idReserva = idReserva;
        this.origem = origem;
        this.destino = destino;
        this.dataSaida = dataSaida;
        this.quilometragemSaida = quilometragemSaida;
        this.dataRetorno = dataRetorno;
        this.quilometragemRetorno = quilometragemRetorno;
        this.observacoesVeiculo = observacoesVeiculo;
        this.quilometragemPercorrida = quilometragemPercorrida;
        this.statusReserva = statusReserva;
    }

    public Long getId() {
        return id;
    }

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public String getPlacaVeiculo() {
        return placaVeiculo;
    }

    public String getModeloVeiculo() {
        return modeloVeiculo;
    }

    public Long getIdMotorista() {
        return idMotorista;
    }

    public String getNomeMotorista() {
        return nomeMotorista;
    }

    public Long getIdReserva() {
        return idReserva;
    }

    public String getOrigem() {
        return origem;
    }

    public String getDestino() {
        return destino;
    }

    public LocalDateTime getDataSaida() {
        return dataSaida;
    }

    public Double getQuilometragemSaida() {
        return quilometragemSaida;
    }

    public LocalDateTime getDataRetorno() {
        return dataRetorno;
    }

    public Double getQuilometragemRetorno() {
        return quilometragemRetorno;
    }

    public String getObservacoesVeiculo() {
        return observacoesVeiculo;
    }

    public Double getQuilometragemPercorrida() {
        return quilometragemPercorrida;
    }

    public String getStatusReserva() {
        return statusReserva;
    }
}
