package com.ctrlfleet.api.dto.indicadores;

import java.time.LocalDate;

public class AdminIndicadoresDTO {

    // Processo 1 — Gestão de frotas (estado atual)
    private double taxaDisponibilidadeOperacional;
    private long veiculosDisponiveis;
    private long veiculosTotaisAtivos;

    private double indiceRegularidadeDocumental;
    private long documentosVigentes;
    private long totalDocumentos;

    // Processo 2 — Gestão de pessoas (estado atual)
    private double taxaMotoristasAptos;
    private long motoristasAptos;
    private long totalMotoristas;

    private double taxaContasRegularizadas;
    private long usuariosAtivos;
    private long usuariosNaoInativos;

    // Processo 3 — Gestão de manutenção (período)
    private double taxaConclusaoManutencoes;
    private long manutencoesConcluidas;
    private long manutencoesAbertas;

    private double indiceAderenciaPreventiva;
    private long veiculosSemPreventivaCritica;
    private long veiculosAtivosManutencao;

    // Processo 4 — Gestão de reservas (período)
    private double taxaAprovacaoReservas;
    private long reservasAprovadas;
    private long reservasAnalisadas;

    private double taxaConclusaoViagens;
    private long reservasConcluidas;
    private long reservasElegiveisParaConclusao;

    // Período analisado
    private LocalDate periodoInicio;
    private LocalDate periodoFim;

    public double getTaxaDisponibilidadeOperacional() { return taxaDisponibilidadeOperacional; }
    public void setTaxaDisponibilidadeOperacional(double v) { this.taxaDisponibilidadeOperacional = v; }

    public long getVeiculosDisponiveis() { return veiculosDisponiveis; }
    public void setVeiculosDisponiveis(long v) { this.veiculosDisponiveis = v; }

    public long getVeiculosTotaisAtivos() { return veiculosTotaisAtivos; }
    public void setVeiculosTotaisAtivos(long v) { this.veiculosTotaisAtivos = v; }

    public double getIndiceRegularidadeDocumental() { return indiceRegularidadeDocumental; }
    public void setIndiceRegularidadeDocumental(double v) { this.indiceRegularidadeDocumental = v; }

    public long getDocumentosVigentes() { return documentosVigentes; }
    public void setDocumentosVigentes(long v) { this.documentosVigentes = v; }

    public long getTotalDocumentos() { return totalDocumentos; }
    public void setTotalDocumentos(long v) { this.totalDocumentos = v; }

    public double getTaxaMotoristasAptos() { return taxaMotoristasAptos; }
    public void setTaxaMotoristasAptos(double v) { this.taxaMotoristasAptos = v; }

    public long getMotoristasAptos() { return motoristasAptos; }
    public void setMotoristasAptos(long v) { this.motoristasAptos = v; }

    public long getTotalMotoristas() { return totalMotoristas; }
    public void setTotalMotoristas(long v) { this.totalMotoristas = v; }

    public double getTaxaContasRegularizadas() { return taxaContasRegularizadas; }
    public void setTaxaContasRegularizadas(double v) { this.taxaContasRegularizadas = v; }

    public long getUsuariosAtivos() { return usuariosAtivos; }
    public void setUsuariosAtivos(long v) { this.usuariosAtivos = v; }

    public long getUsuariosNaoInativos() { return usuariosNaoInativos; }
    public void setUsuariosNaoInativos(long v) { this.usuariosNaoInativos = v; }

    public double getTaxaConclusaoManutencoes() { return taxaConclusaoManutencoes; }
    public void setTaxaConclusaoManutencoes(double v) { this.taxaConclusaoManutencoes = v; }

    public long getManutencoesConcluidas() { return manutencoesConcluidas; }
    public void setManutencoesConcluidas(long v) { this.manutencoesConcluidas = v; }

    public long getManutencoesAbertas() { return manutencoesAbertas; }
    public void setManutencoesAbertas(long v) { this.manutencoesAbertas = v; }

    public double getIndiceAderenciaPreventiva() { return indiceAderenciaPreventiva; }
    public void setIndiceAderenciaPreventiva(double v) { this.indiceAderenciaPreventiva = v; }

    public long getVeiculosSemPreventivaCritica() { return veiculosSemPreventivaCritica; }
    public void setVeiculosSemPreventivaCritica(long v) { this.veiculosSemPreventivaCritica = v; }

    public long getVeiculosAtivosManutencao() { return veiculosAtivosManutencao; }
    public void setVeiculosAtivosManutencao(long v) { this.veiculosAtivosManutencao = v; }

    public double getTaxaAprovacaoReservas() { return taxaAprovacaoReservas; }
    public void setTaxaAprovacaoReservas(double v) { this.taxaAprovacaoReservas = v; }

    public long getReservasAprovadas() { return reservasAprovadas; }
    public void setReservasAprovadas(long v) { this.reservasAprovadas = v; }

    public long getReservasAnalisadas() { return reservasAnalisadas; }
    public void setReservasAnalisadas(long v) { this.reservasAnalisadas = v; }

    public double getTaxaConclusaoViagens() { return taxaConclusaoViagens; }
    public void setTaxaConclusaoViagens(double v) { this.taxaConclusaoViagens = v; }

    public long getReservasConcluidas() { return reservasConcluidas; }
    public void setReservasConcluidas(long v) { this.reservasConcluidas = v; }

    public long getReservasElegiveisParaConclusao() { return reservasElegiveisParaConclusao; }
    public void setReservasElegiveisParaConclusao(long v) { this.reservasElegiveisParaConclusao = v; }

    public LocalDate getPeriodoInicio() { return periodoInicio; }
    public void setPeriodoInicio(LocalDate v) { this.periodoInicio = v; }

    public LocalDate getPeriodoFim() { return periodoFim; }
    public void setPeriodoFim(LocalDate v) { this.periodoFim = v; }
}
