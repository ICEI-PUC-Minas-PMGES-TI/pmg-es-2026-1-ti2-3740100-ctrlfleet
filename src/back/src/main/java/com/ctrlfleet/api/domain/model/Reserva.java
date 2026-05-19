package com.ctrlfleet.api.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotNull(message = "O usuário solicitante é obrigatório")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veiculo", nullable = false)
    @NotNull(message = "O veículo é obrigatório")
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_motorista")
    private Usuario motorista;

    @Column(name = "datahora_solicitacao", nullable = false)
    @NotNull(message = "A data de solicitação é obrigatória")
    private LocalDateTime datahoraSolicitacao;

    @Column(name = "datahora_inicio_prevista", nullable = false)
    @NotNull(message = "A data de início prevista é obrigatória")
    private LocalDateTime datahoraInicioPrevista;

    @Column(name = "datahora_fim_estimada", nullable = false)
    @NotNull(message = "A data de fim estimada é obrigatória")
    private LocalDateTime datahoraFimEstimada;

    @Column(nullable = false)
    @NotBlank(message = "O destino é obrigatório")
    private String destino;

    @Column(nullable = false)
    @NotBlank(message = "A origem é obrigatória")
    private String origem;

    @Column(name = "status_reserva", nullable = false, length = 40)
    @NotBlank(message = "O status da reserva é obrigatório")
    private String statusReserva;

    protected Reserva() {
    }

    public Reserva(
            Usuario usuario,
            Veiculo veiculo,
            Usuario motorista,
            LocalDateTime datahoraSolicitacao,
            LocalDateTime datahoraInicioPrevista,
            LocalDateTime datahoraFimEstimada,
            String origem,
            String destino,
            String statusReserva) {
        this.usuario = usuario;
        this.veiculo = veiculo;
        this.motorista = motorista;
        this.datahoraSolicitacao = datahoraSolicitacao;
        this.datahoraInicioPrevista = datahoraInicioPrevista;
        this.datahoraFimEstimada = datahoraFimEstimada;
        this.origem = origem;
        this.destino = destino;
        this.statusReserva = statusReserva;
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

    public Usuario getMotorista() {
        return motorista;
    }

    public LocalDateTime getDatahoraSolicitacao() {
        return datahoraSolicitacao;
    }

    public LocalDateTime getDatahoraInicioPrevista() {
        return datahoraInicioPrevista;
    }

    public LocalDateTime getDatahoraFimEstimada() {
        return datahoraFimEstimada;
    }

    public String getDestino() {
        return destino;
    }

    public String getOrigem() {
        return origem;
    }

    public String getStatusReserva() {
        return statusReserva;
    }
}
