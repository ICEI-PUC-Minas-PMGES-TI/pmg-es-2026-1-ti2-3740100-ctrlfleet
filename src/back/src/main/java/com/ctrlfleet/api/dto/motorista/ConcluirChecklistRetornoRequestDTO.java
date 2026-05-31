package com.ctrlfleet.api.dto.motorista;

import jakarta.validation.constraints.NotNull;

public class ConcluirChecklistRetornoRequestDTO {
    @NotNull(message = "Motorista é obrigatório")
    private Long idMotorista;

    /** Distância da rota (km) para calcular o hodômetro de retorno; opcional (usa 0 se ausente). */
    private Double distanciaPercorridaKm;

    private String observacoesVeiculo;

    public Long getIdMotorista() {
        return idMotorista;
    }

    public void setIdMotorista(Long idMotorista) {
        this.idMotorista = idMotorista;
    }

    public Double getDistanciaPercorridaKm() {
        return distanciaPercorridaKm;
    }

    public void setDistanciaPercorridaKm(Double distanciaPercorridaKm) {
        this.distanciaPercorridaKm = distanciaPercorridaKm;
    }

    public String getObservacoesVeiculo() {
        return observacoesVeiculo;
    }

    public void setObservacoesVeiculo(String observacoesVeiculo) {
        this.observacoesVeiculo = observacoesVeiculo;
    }
}
