package com.ctrlfleet.api.domain.model;

import com.ctrlfleet.api.domain.enums.StatusReserva;
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
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veiculo", nullable = false)
    private Veiculo veiculo;

    @Column(name = "datahora_solicitacao", nullable = false)
    private LocalDateTime dataHoraSolicitacao;

    @Column(name = "datahora_inicio_prevista", nullable = false)
    private LocalDateTime dataHoraInicioPrevista;

    @Column(name = "datahora_fim_estimada", nullable = false)
    private LocalDateTime dataHoraFimEstimada;

    @Column(nullable = false)
    private String destino;

    @Column(nullable = false)
    private String origem;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String justificativa;

    @Column(name = "matricula_solicitante", length = 30)
    private String matriculaSolicitante;

    @Column(name = "origem_lat")
    private Double origemLat;

    @Column(name = "origem_lng")
    private Double origemLng;

    @Column(name = "destino_lat")
    private Double destinoLat;

    @Column(name = "destino_lng")
    private Double destinoLng;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_reserva", nullable = false, length = 30)
    private StatusReserva statusReserva = StatusReserva.SOLICITADA;

    public Reserva() {
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public LocalDateTime getDataHoraSolicitacao() {
        return dataHoraSolicitacao;
    }

    public LocalDateTime getDataHoraInicioPrevista() {
        return dataHoraInicioPrevista;
    }

    public LocalDateTime getDataHoraFimEstimada() {
        return dataHoraFimEstimada;
    }

    public String getDestino() {
        return destino;
    }

    public String getOrigem() {
        return origem;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public String getMatriculaSolicitante() {
        return matriculaSolicitante;
    }

    public Double getOrigemLat() {
        return origemLat;
    }

    public Double getOrigemLng() {
        return origemLng;
    }

    public Double getDestinoLat() {
        return destinoLat;
    }

    public Double getDestinoLng() {
        return destinoLng;
    }

    public StatusReserva getStatusReserva() {
        return statusReserva;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }

    public void setDataHoraSolicitacao(LocalDateTime dataHoraSolicitacao) {
        this.dataHoraSolicitacao = dataHoraSolicitacao;
    }

    public void setDataHoraInicioPrevista(LocalDateTime dataHoraInicioPrevista) {
        this.dataHoraInicioPrevista = dataHoraInicioPrevista;
    }

    public void setDataHoraFimEstimada(LocalDateTime dataHoraFimEstimada) {
        this.dataHoraFimEstimada = dataHoraFimEstimada;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }

    public void setMatriculaSolicitante(String matriculaSolicitante) {
        this.matriculaSolicitante = matriculaSolicitante;
    }

    public void setOrigemLat(Double origemLat) {
        this.origemLat = origemLat;
    }

    public void setOrigemLng(Double origemLng) {
        this.origemLng = origemLng;
    }

    public void setDestinoLat(Double destinoLat) {
        this.destinoLat = destinoLat;
    }

    public void setDestinoLng(Double destinoLng) {
        this.destinoLng = destinoLng;
    }

    public void setStatusReserva(StatusReserva statusReserva) {
        this.statusReserva = statusReserva;
    }
}
