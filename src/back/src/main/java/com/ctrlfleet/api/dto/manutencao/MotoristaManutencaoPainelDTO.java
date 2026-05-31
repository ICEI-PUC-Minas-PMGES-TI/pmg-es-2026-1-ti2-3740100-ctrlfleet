package com.ctrlfleet.api.dto.manutencao;

import java.util.ArrayList;
import java.util.List;

public class MotoristaManutencaoPainelDTO {

    private List<ManutencaoResponseDTO> preventivasProximas = new ArrayList<>();
    private List<AlertaResponseDTO> alertasPreventivos = new ArrayList<>();
    private List<ManutencaoResponseDTO> solicitacoes = new ArrayList<>();
    private List<ManutencaoResponseDTO> emAndamento = new ArrayList<>();
    private List<ManutencaoResponseDTO> historico = new ArrayList<>();

    public List<ManutencaoResponseDTO> getPreventivasProximas() {
        return preventivasProximas;
    }

    public void setPreventivasProximas(List<ManutencaoResponseDTO> preventivasProximas) {
        this.preventivasProximas = preventivasProximas;
    }

    public List<AlertaResponseDTO> getAlertasPreventivos() {
        return alertasPreventivos;
    }

    public void setAlertasPreventivos(List<AlertaResponseDTO> alertasPreventivos) {
        this.alertasPreventivos = alertasPreventivos;
    }

    public List<ManutencaoResponseDTO> getSolicitacoes() {
        return solicitacoes;
    }

    public void setSolicitacoes(List<ManutencaoResponseDTO> solicitacoes) {
        this.solicitacoes = solicitacoes;
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
