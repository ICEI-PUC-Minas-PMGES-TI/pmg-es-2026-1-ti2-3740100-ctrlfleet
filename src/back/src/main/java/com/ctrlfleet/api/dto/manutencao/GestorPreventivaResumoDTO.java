package com.ctrlfleet.api.dto.manutencao;

public class GestorPreventivaResumoDTO {

    private long preventivasProximas;
    private long preventivasAtrasadas;
    private long preventivasAgendadas;
    private long veiculosParados;
    private long emAndamento;
    private long alertasPreventivos;

    public long getPreventivasProximas() {
        return preventivasProximas;
    }

    public void setPreventivasProximas(long preventivasProximas) {
        this.preventivasProximas = preventivasProximas;
    }

    public long getPreventivasAtrasadas() {
        return preventivasAtrasadas;
    }

    public void setPreventivasAtrasadas(long preventivasAtrasadas) {
        this.preventivasAtrasadas = preventivasAtrasadas;
    }

    public long getPreventivasAgendadas() {
        return preventivasAgendadas;
    }

    public void setPreventivasAgendadas(long preventivasAgendadas) {
        this.preventivasAgendadas = preventivasAgendadas;
    }

    public long getVeiculosParados() {
        return veiculosParados;
    }

    public void setVeiculosParados(long veiculosParados) {
        this.veiculosParados = veiculosParados;
    }

    public long getEmAndamento() {
        return emAndamento;
    }

    public void setEmAndamento(long emAndamento) {
        this.emAndamento = emAndamento;
    }

    public long getAlertasPreventivos() {
        return alertasPreventivos;
    }

    public void setAlertasPreventivos(long alertasPreventivos) {
        this.alertasPreventivos = alertasPreventivos;
    }
}
