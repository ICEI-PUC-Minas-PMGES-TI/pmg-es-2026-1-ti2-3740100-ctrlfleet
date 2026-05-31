package com.ctrlfleet.api.dto.manutencao;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SolicitarManutencaoRequestDTO {

    @NotNull(message = "O veículo é obrigatório")
    private Long idVeiculo;

    @NotNull(message = "A quilometragem atual é obrigatória")
    @Min(value = 0, message = "A quilometragem deve ser zero ou maior")
    private Double quilometragemAtual;

    @NotBlank(message = "A descrição do problema é obrigatória")
    @Size(min = 15, message = "Descreva o problema com pelo menos 15 caracteres")
    private String descricaoProblema;

    private boolean emergencia = true;

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Long idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public Double getQuilometragemAtual() {
        return quilometragemAtual;
    }

    public void setQuilometragemAtual(Double quilometragemAtual) {
        this.quilometragemAtual = quilometragemAtual;
    }

    public String getDescricaoProblema() {
        return descricaoProblema;
    }

    public void setDescricaoProblema(String descricaoProblema) {
        this.descricaoProblema = descricaoProblema;
    }

    public boolean isEmergencia() {
        return emergencia;
    }

    public void setEmergencia(boolean emergencia) {
        this.emergencia = emergencia;
    }
}
