package com.ctrlfleet.api.dto.motorista;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.Map;

public class FinalizarTrajetoRequestDTO {
    @NotNull(message = "Motorista é obrigatório")
    private Long idMotorista;

    @NotNull(message = "Quilometragem de retorno é obrigatória")
    @PositiveOrZero(message = "Quilometragem de retorno deve ser maior ou igual a zero")
    private Double quilometragemRetorno;

    private String observacoesVeiculo;

    @NotEmpty(message = "Checklist de retorno é obrigatório")
    private List<Long> itensChecklist;

    private Map<Long, String> observacoesChecklist;

    public Long getIdMotorista() { return idMotorista; }
    public void setIdMotorista(Long idMotorista) { this.idMotorista = idMotorista; }
    public Double getQuilometragemRetorno() { return quilometragemRetorno; }
    public void setQuilometragemRetorno(Double quilometragemRetorno) { this.quilometragemRetorno = quilometragemRetorno; }
    public String getObservacoesVeiculo() { return observacoesVeiculo; }
    public void setObservacoesVeiculo(String observacoesVeiculo) { this.observacoesVeiculo = observacoesVeiculo; }

    public List<Long> getItensChecklist() {
        return itensChecklist;
    }

    public void setItensChecklist(List<Long> itensChecklist) {
        this.itensChecklist = itensChecklist;
    }

    public Map<Long, String> getObservacoesChecklist() {
        return observacoesChecklist;
    }

    public void setObservacoesChecklist(Map<Long, String> observacoesChecklist) {
        this.observacoesChecklist = observacoesChecklist;
    }
}
