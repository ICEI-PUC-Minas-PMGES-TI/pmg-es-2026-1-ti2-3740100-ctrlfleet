package com.ctrlfleet.api.dto.motorista;

import java.util.List;

public class ChecklistJornadaStatusDTO {
    private Double quilometragemSaida;
    /** Quilometragem de retorno (checklist de retorno); nulo na fase de saída. */
    private Double quilometragemRetorno;
    private Double ultimaQuilometragemVeiculo;
    /** Todos os tipos e a quilometragem foram informados. */
    private boolean preenchimentoCompleto;
    /** Checklist confirmado com "Registrar checklist". */
    private boolean checklistRegistrado;
    private List<ChecklistTipoProgressoDTO> tipos;

    public ChecklistJornadaStatusDTO(
            Double quilometragemSaida,
            Double quilometragemRetorno,
            Double ultimaQuilometragemVeiculo,
            boolean preenchimentoCompleto,
            boolean checklistRegistrado,
            List<ChecklistTipoProgressoDTO> tipos) {
        this.quilometragemSaida = quilometragemSaida;
        this.quilometragemRetorno = quilometragemRetorno;
        this.ultimaQuilometragemVeiculo = ultimaQuilometragemVeiculo;
        this.preenchimentoCompleto = preenchimentoCompleto;
        this.checklistRegistrado = checklistRegistrado;
        this.tipos = tipos;
    }

    public Double getQuilometragemSaida() {
        return quilometragemSaida;
    }

    public Double getQuilometragemRetorno() {
        return quilometragemRetorno;
    }

    public Double getUltimaQuilometragemVeiculo() {
        return ultimaQuilometragemVeiculo;
    }

    public boolean isPreenchimentoCompleto() {
        return preenchimentoCompleto;
    }

    public boolean isChecklistRegistrado() {
        return checklistRegistrado;
    }

    public List<ChecklistTipoProgressoDTO> getTipos() {
        return tipos;
    }
}
