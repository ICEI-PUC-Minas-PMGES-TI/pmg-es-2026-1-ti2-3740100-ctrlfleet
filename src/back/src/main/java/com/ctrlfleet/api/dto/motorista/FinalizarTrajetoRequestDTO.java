package com.ctrlfleet.api.dto.motorista;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class FinalizarTrajetoRequestDTO {
    @NotNull(message = "Motorista e obrigatorio")
    private Long idMotorista;

    @NotNull(message = "Quilometragem de retorno e obrigatoria")
    @PositiveOrZero(message = "Quilometragem de retorno deve ser maior ou igual a zero")
    private Double quilometragemRetorno;

    private String observacoesVeiculo;

    public Long getIdMotorista() { return idMotorista; }
    public void setIdMotorista(Long idMotorista) { this.idMotorista = idMotorista; }
    public Double getQuilometragemRetorno() { return quilometragemRetorno; }
    public void setQuilometragemRetorno(Double quilometragemRetorno) { this.quilometragemRetorno = quilometragemRetorno; }
    public String getObservacoesVeiculo() { return observacoesVeiculo; }
    public void setObservacoesVeiculo(String observacoesVeiculo) { this.observacoesVeiculo = observacoesVeiculo; }
}
