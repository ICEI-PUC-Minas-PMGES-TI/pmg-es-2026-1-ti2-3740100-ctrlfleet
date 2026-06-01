package com.ctrlfleet.api.dto.manutencao;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ManutencaoResponseDTO {

    private Long id;
    private Long idVeiculo;
    private String placa;
    private String marca;
    private String modelo;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private LocalDate dataAgendada;
    private LocalDateTime dataIdentificacao;
    private Double quilometragemRegistro;
    private Double quilometragemAtual;
    private Double kmRestantes;
    private Integer diasRestantes;
    private Double custoTotal;
    private String oficinaExecutor;
    private StatusManutencao status;
    private boolean emergencia;
    private PrioridadeAlerta prioridade;
    private String proximidadeLabel;
    private String nomeMotorista;

    public static ManutencaoResponseDTO fromEntity(Manutencao manutencao, Double quilometragemAtual) {
        ManutencaoResponseDTO dto = new ManutencaoResponseDTO();
        dto.id = manutencao.getId();
        dto.idVeiculo = manutencao.getVeiculo().getId();
        dto.placa = manutencao.getVeiculo().getPlaca();
        dto.marca = manutencao.getVeiculo().getMarca();
        dto.modelo = manutencao.getVeiculo().getModelo();
        if (manutencao.getMotorista() != null) {
            dto.nomeMotorista = manutencao.getMotorista().getNome();
        } else if (manutencao.getVeiculo().getMotorista() != null) {
            dto.nomeMotorista = manutencao.getVeiculo().getMotorista().getNome();
        }
        dto.tipoManutencao = manutencao.getTipoManutencao();
        dto.descricaoProblema = manutencao.getDescricaoProblema();
        dto.dataAgendada = manutencao.getDataRealizada();
        dto.dataIdentificacao = manutencao.getDataIdentificacao();
        dto.quilometragemRegistro = manutencao.getQuilometragemRegistro();
        dto.quilometragemAtual = quilometragemAtual;
        dto.custoTotal = manutencao.getCustoTotal();
        dto.oficinaExecutor = manutencao.getOficinaExecutor();
        dto.status = manutencao.getStatus();
        dto.emergencia = manutencao.isEmergencia();
        dto.prioridade = manutencao.getPrioridade();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Long idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public TipoManutencao getTipoManutencao() {
        return tipoManutencao;
    }

    public void setTipoManutencao(TipoManutencao tipoManutencao) {
        this.tipoManutencao = tipoManutencao;
    }

    public String getDescricaoProblema() {
        return descricaoProblema;
    }

    public void setDescricaoProblema(String descricaoProblema) {
        this.descricaoProblema = descricaoProblema;
    }

    public LocalDate getDataAgendada() {
        return dataAgendada;
    }

    public void setDataAgendada(LocalDate dataAgendada) {
        this.dataAgendada = dataAgendada;
    }

    public LocalDateTime getDataIdentificacao() {
        return dataIdentificacao;
    }

    public void setDataIdentificacao(LocalDateTime dataIdentificacao) {
        this.dataIdentificacao = dataIdentificacao;
    }

    public Double getQuilometragemRegistro() {
        return quilometragemRegistro;
    }

    public void setQuilometragemRegistro(Double quilometragemRegistro) {
        this.quilometragemRegistro = quilometragemRegistro;
    }

    public Double getQuilometragemAtual() {
        return quilometragemAtual;
    }

    public void setQuilometragemAtual(Double quilometragemAtual) {
        this.quilometragemAtual = quilometragemAtual;
    }

    public Double getKmRestantes() {
        return kmRestantes;
    }

    public void setKmRestantes(Double kmRestantes) {
        this.kmRestantes = kmRestantes;
    }

    public Integer getDiasRestantes() {
        return diasRestantes;
    }

    public void setDiasRestantes(Integer diasRestantes) {
        this.diasRestantes = diasRestantes;
    }

    public Double getCustoTotal() {
        return custoTotal;
    }

    public void setCustoTotal(Double custoTotal) {
        this.custoTotal = custoTotal;
    }

    public String getOficinaExecutor() {
        return oficinaExecutor;
    }

    public void setOficinaExecutor(String oficinaExecutor) {
        this.oficinaExecutor = oficinaExecutor;
    }

    public StatusManutencao getStatus() {
        return status;
    }

    public void setStatus(StatusManutencao status) {
        this.status = status;
    }

    public boolean isEmergencia() {
        return emergencia;
    }

    public void setEmergencia(boolean emergencia) {
        this.emergencia = emergencia;
    }

    public PrioridadeAlerta getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeAlerta prioridade) {
        this.prioridade = prioridade;
    }

    public String getProximidadeLabel() {
        return proximidadeLabel;
    }

    public void setProximidadeLabel(String proximidadeLabel) {
        this.proximidadeLabel = proximidadeLabel;
    }

    public String getNomeMotorista() {
        return nomeMotorista;
    }

    public void setNomeMotorista(String nomeMotorista) {
        this.nomeMotorista = nomeMotorista;
    }
}
