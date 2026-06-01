package com.ctrlfleet.api.dto.manutencao;

import java.util.ArrayList;
import java.util.List;

public class GestorManutencaoPainelDTO {

    private List<ManutencaoResponseDTO> pendentes = new ArrayList<>();
    private List<ManutencaoResponseDTO> agendadas = new ArrayList<>();
    private List<ManutencaoResponseDTO> emAndamento = new ArrayList<>();
    private List<ManutencaoResponseDTO> historico = new ArrayList<>();

    public List<ManutencaoResponseDTO> getPendentes() {
        return pendentes;
    }

    public void setPendentes(List<ManutencaoResponseDTO> pendentes) {
        this.pendentes = pendentes;
    }

    public List<ManutencaoResponseDTO> getAgendadas() {
        return agendadas;
    }

    public void setAgendadas(List<ManutencaoResponseDTO> agendadas) {
        this.agendadas = agendadas;
    }

    public List<ManutencaoResponseDTO> getEmAndamento() {
        return emAndamento;
    }

    public void setEmAndamento(List<ManutencaoResponseDTO> emAndamento) {
        this.emAndamento = emAndamento;
    }

    public List<ManutencaoResponseDTO> getHistorico() {
        return historico;
    }

    public void setHistorico(List<ManutencaoResponseDTO> historico) {
        this.historico = historico;
    }
}
