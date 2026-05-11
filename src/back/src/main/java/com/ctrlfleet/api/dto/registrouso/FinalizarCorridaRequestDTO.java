package com.ctrlfleet.api.dto.registrouso;

import jakarta.validation.constraints.NotNull;

public class FinalizarCorridaRequestDTO {

    @NotNull(message = "O id do veículo é obrigatório")
    private Long idVeiculo;

    @NotNull(message = "O id do motorista é obrigatório")
    private Long idMotorista;

    private Long idReserva;

    @NotNull(message = "A data de saída é obrigatória (ISO 8601)")
    private String dataSaida;

    @NotNull(message = "A quilometragem de saída é obrigatória")
    private Double quilometragemSaida;

    @NotNull(message = "A data de retorno é obrigatória (ISO 8601)")
    private String dataRetorno;

    @NotNull(message = "A quilometragem de retorno é obrigatória")
    private Double quilometragemRetorno;

    private String observacoesVeiculo;

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Long idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public Long getIdMotorista() {
        return idMotorista;
    }

    public void setIdMotorista(Long idMotorista) {
        this.idMotorista = idMotorista;
    }

    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    public String getDataSaida() {
        return dataSaida;
    }

    public void setDataSaida(String dataSaida) {
        this.dataSaida = dataSaida;
    }

    public Double getQuilometragemSaida() {
        return quilometragemSaida;
    }

    public void setQuilometragemSaida(Double quilometragemSaida) {
        this.quilometragemSaida = quilometragemSaida;
    }

    public String getDataRetorno() {
        return dataRetorno;
    }

    public void setDataRetorno(String dataRetorno) {
        this.dataRetorno = dataRetorno;
    }

    public Double getQuilometragemRetorno() {
        return quilometragemRetorno;
    }

    public void setQuilometragemRetorno(Double quilometragemRetorno) {
        this.quilometragemRetorno = quilometragemRetorno;
    }

    public String getObservacoesVeiculo() {
        return observacoesVeiculo;
    }

    public void setObservacoesVeiculo(String observacoesVeiculo) {
        this.observacoesVeiculo = observacoesVeiculo;
    }
}
