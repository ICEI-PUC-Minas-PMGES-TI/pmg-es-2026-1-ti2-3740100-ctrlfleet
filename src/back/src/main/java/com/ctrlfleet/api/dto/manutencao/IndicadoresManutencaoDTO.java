package com.ctrlfleet.api.dto.manutencao;

import java.time.LocalDate;

public class IndicadoresManutencaoDTO {

    private LocalDate periodoInicio;
    private LocalDate periodoFim;
    private long totalAbertas;
    private long totalConcluidas;
    private double taxaConclusao;
    private long veiculosAtivos;
    private long veiculosComPreventivaCritica;
    private double indiceAderenciaPreventiva;

    public LocalDate getPeriodoInicio() {
        return periodoInicio;
    }

    public void setPeriodoInicio(LocalDate periodoInicio) {
        this.periodoInicio = periodoInicio;
    }

    public LocalDate getPeriodoFim() {
        return periodoFim;
    }

    public void setPeriodoFim(LocalDate periodoFim) {
        this.periodoFim = periodoFim;
    }

    public long getTotalAbertas() {
        return totalAbertas;
    }

    public void setTotalAbertas(long totalAbertas) {
        this.totalAbertas = totalAbertas;
    }

    public long getTotalConcluidas() {
        return totalConcluidas;
    }

    public void setTotalConcluidas(long totalConcluidas) {
        this.totalConcluidas = totalConcluidas;
    }

    public double getTaxaConclusao() {
        return taxaConclusao;
    }

    public void setTaxaConclusao(double taxaConclusao) {
        this.taxaConclusao = taxaConclusao;
    }

    public long getVeiculosAtivos() {
        return veiculosAtivos;
    }

    public void setVeiculosAtivos(long veiculosAtivos) {
        this.veiculosAtivos = veiculosAtivos;
    }

    public long getVeiculosComPreventivaCritica() {
        return veiculosComPreventivaCritica;
    }

    public void setVeiculosComPreventivaCritica(long veiculosComPreventivaCritica) {
        this.veiculosComPreventivaCritica = veiculosComPreventivaCritica;
    }

    public double getIndiceAderenciaPreventiva() {
        return indiceAderenciaPreventiva;
    }

    public void setIndiceAderenciaPreventiva(double indiceAderenciaPreventiva) {
        this.indiceAderenciaPreventiva = indiceAderenciaPreventiva;
    }
}
