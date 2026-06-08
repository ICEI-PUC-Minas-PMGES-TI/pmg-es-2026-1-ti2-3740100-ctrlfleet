package com.ctrlfleet.api.dto.manutencao;

import java.util.ArrayList;
import java.util.List;

public class GestorPreventivaPainelDTO {

    private GestorPreventivaResumoDTO resumo = new GestorPreventivaResumoDTO();
    private List<ManutencaoResponseDTO> preventivasProximas = new ArrayList<>();
    private List<ManutencaoResponseDTO> preventivasAgendadas = new ArrayList<>();
    private List<VeiculoParadoRevisaoDTO> veiculosParadosRevisao = new ArrayList<>();
    private List<ManutencaoResponseDTO> emAndamento = new ArrayList<>();
    private List<AlertaResponseDTO> alertasPreventivos = new ArrayList<>();

    public GestorPreventivaResumoDTO getResumo() {
        return resumo;
    }

    public void setResumo(GestorPreventivaResumoDTO resumo) {
        this.resumo = resumo;
    }

    public List<ManutencaoResponseDTO> getPreventivasProximas() {
        return preventivasProximas;
    }

    public void setPreventivasProximas(List<ManutencaoResponseDTO> preventivasProximas) {
        this.preventivasProximas = preventivasProximas;
    }

    public List<ManutencaoResponseDTO> getPreventivasAgendadas() {
        return preventivasAgendadas;
    }

    public void setPreventivasAgendadas(List<ManutencaoResponseDTO> preventivasAgendadas) {
        this.preventivasAgendadas = preventivasAgendadas;
    }

    public List<VeiculoParadoRevisaoDTO> getVeiculosParadosRevisao() {
        return veiculosParadosRevisao;
    }

    public void setVeiculosParadosRevisao(List<VeiculoParadoRevisaoDTO> veiculosParadosRevisao) {
        this.veiculosParadosRevisao = veiculosParadosRevisao;
    }

    public List<ManutencaoResponseDTO> getEmAndamento() {
        return emAndamento;
    }

    public void setEmAndamento(List<ManutencaoResponseDTO> emAndamento) {
        this.emAndamento = emAndamento;
    }

    public List<AlertaResponseDTO> getAlertasPreventivos() {
        return alertasPreventivos;
    }

    public void setAlertasPreventivos(List<AlertaResponseDTO> alertasPreventivos) {
        this.alertasPreventivos = alertasPreventivos;
    }
}
