package com.ctrlfleet.api.dto.motorista;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.Map;

public class IniciarTrajetoRequestDTO {
    @NotNull(message = "Motorista e obrigatorio")
    private Long idMotorista;

    @NotNull(message = "Quilometragem de saida e obrigatoria")
    @PositiveOrZero(message = "Quilometragem de saida deve ser maior ou igual a zero")
    private Double quilometragemSaida;

    @NotEmpty(message = "Checklist de saida e obrigatorio")
    private List<Long> itensChecklist;

    private Map<Long, String> observacoesChecklist;

    public Long getIdMotorista() {
        return idMotorista;
    }

    public void setIdMotorista(Long idMotorista) {
        this.idMotorista = idMotorista;
    }

    public Double getQuilometragemSaida() {
        return quilometragemSaida;
    }

    public void setQuilometragemSaida(Double quilometragemSaida) {
        this.quilometragemSaida = quilometragemSaida;
    }

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
