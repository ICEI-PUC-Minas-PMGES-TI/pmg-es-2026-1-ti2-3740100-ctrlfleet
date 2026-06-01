package com.ctrlfleet.api.domain.model;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "manutencoes")
public class Manutencao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_manutencao")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_veiculo", nullable = false)
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_motorista")
    private Usuario motorista;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_manutencao", nullable = false, length = 20)
    private TipoManutencao tipoManutencao;

    @Column(name = "descricao_problema", nullable = false, columnDefinition = "TEXT")
    private String descricaoProblema;

    @Column(name = "data_realizada")
    private LocalDate dataRealizada;

    @Column(name = "quilometragem_registro")
    private Double quilometragemRegistro;

    @Column(name = "custo_total")
    private Double custoTotal;

    @Column(name = "oficina_executor")
    private String oficinaExecutor;

    @Column(name = "prazo_previsto_dias")
    private Integer prazoPrevistoDias;

    @Column(name = "servicos_realizados", columnDefinition = "TEXT")
    private String servicosRealizados;

    @Column(name = "data_conclusao")
    private LocalDate dataConclusao;

    @Column(name = "garantia")
    private String garantia;

    @Column(name = "comprovante_nf", nullable = true)
    private String comprovanteNf;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusManutencao status = StatusManutencao.PENDENTE;

    @Column(name = "data_identificacao")
    private LocalDateTime dataIdentificacao;

    @Column(nullable = false)
    private boolean emergencia = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PrioridadeAlerta prioridade;

    public Manutencao() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }

    public Usuario getMotorista() {
        return motorista;
    }

    public void setMotorista(Usuario motorista) {
        this.motorista = motorista;
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

    public LocalDate getDataRealizada() {
        return dataRealizada;
    }

    public void setDataRealizada(LocalDate dataRealizada) {
        this.dataRealizada = dataRealizada;
    }

    public Double getQuilometragemRegistro() {
        return quilometragemRegistro;
    }

    public void setQuilometragemRegistro(Double quilometragemRegistro) {
        this.quilometragemRegistro = quilometragemRegistro;
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

    public String getServicosRealizados() {
        return servicosRealizados;
    }

    public void setServicosRealizados(String servicosRealizados) {
        this.servicosRealizados = servicosRealizados;
    }

    public LocalDate getDataConclusao() {
        return dataConclusao;
    }

    public void setDataConclusao(LocalDate dataConclusao) {
        this.dataConclusao = dataConclusao;
    }

    public String getGarantia() {
        return garantia;
    }

    public void setGarantia(String garantia) {
        this.garantia = garantia;
    }

    public String getComprovanteNf() {
        return comprovanteNf;
    }

    public void setComprovanteNf(String comprovanteNf) {
        this.comprovanteNf = comprovanteNf;
    }

    public StatusManutencao getStatus() {
        return status;
    }

    public void setStatus(StatusManutencao status) {
        this.status = status;
    }

    public LocalDateTime getDataIdentificacao() {
        return dataIdentificacao;
    }

    public void setDataIdentificacao(LocalDateTime dataIdentificacao) {
        this.dataIdentificacao = dataIdentificacao;
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

    public Integer getPrazoPrevistoDias() {
        return prazoPrevistoDias;
    }

    public void setPrazoPrevistoDias(Integer prazoPrevistoDias) {
        this.prazoPrevistoDias = prazoPrevistoDias;
    }
}
