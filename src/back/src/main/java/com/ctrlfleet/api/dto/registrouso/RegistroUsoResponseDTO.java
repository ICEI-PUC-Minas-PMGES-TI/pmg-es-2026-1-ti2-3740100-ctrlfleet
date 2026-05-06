package com.ctrlfleet.api.dto.registrouso;

import java.time.LocalDateTime;

public class RegistroUsoResponseDTO {

    private Long id;
    private Long idVeiculo;
    private String placaVeiculo;
    private Long idMotorista;
    private String nomeMotorista;
    private Long idReserva;
    private LocalDateTime dataSaida;
    private Double quilometragemSaida;
    private LocalDateTime dataRetorno;
    private Double quilometragemRetorno;
    private String observacoesVeiculo;

    public RegistroUsoResponseDTO() {
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
            String observacoesVeiculo) {
        this.id = id;
        this.idVeiculo = idVeiculo;
        this.placaVeiculo = placaVeiculo;
        this.idMotorista = idMotorista;
        this.nomeMotorista = nomeMotorista;
        this.idReserva = idReserva;
        this.dataSaida = dataSaida;
        this.quilometragemSaida = quilometragemSaida;
        this.dataRetorno = dataRetorno;
        this.quilometragemRetorno = quilometragemRetorno;
        this.observacoesVeiculo = observacoesVeiculo;
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

    public Long getIdMotorista() {
        return idMotorista;
    }

    public String getNomeMotorista() {
        return nomeMotorista;
    }

    public Long getIdReserva() {
        return idReserva;
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
}
