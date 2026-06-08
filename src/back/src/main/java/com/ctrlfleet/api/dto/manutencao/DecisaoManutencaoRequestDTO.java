package com.ctrlfleet.api.dto.manutencao;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;

public class DecisaoManutencaoRequestDTO {

    private Long idGestor;
    private String motivo;
    private PrioridadeAlerta prioridade;

    public Long getIdGestor() {
        return idGestor;
    }

    public void setIdGestor(Long idGestor) {
        this.idGestor = idGestor;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public PrioridadeAlerta getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeAlerta prioridade) {
        this.prioridade = prioridade;
    }
}
