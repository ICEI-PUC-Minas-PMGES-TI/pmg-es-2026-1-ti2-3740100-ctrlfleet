package com.ctrlfleet.api.dto.reserva;

import com.ctrlfleet.api.domain.model.Reserva;
import java.time.LocalDateTime;

public class ReservaResponseDTO {

    private Long idReserva;
    private Long idUsuario;
    private String nomeUsuario;
    private Long idVeiculo;
    private String placaVeiculo;
    private String modeloVeiculo;
    private Long idMotorista;
    private String nomeMotorista;
    private LocalDateTime datahoraSolicitacao;
    private LocalDateTime datahoraInicioPrevista;
    private LocalDateTime datahoraFimEstimada;
    private String destino;
    private String origem;
    private String statusReserva;

    public ReservaResponseDTO() {
    }

    public static ReservaResponseDTO fromEntity(Reserva reserva) {
        ReservaResponseDTO dto = new ReservaResponseDTO();
        dto.idReserva = reserva.getId();
        dto.idUsuario = reserva.getUsuario().getId();
        dto.nomeUsuario = reserva.getUsuario().getNome();
        dto.idVeiculo = reserva.getVeiculo().getId();
        dto.placaVeiculo = reserva.getVeiculo().getPlaca();
        dto.modeloVeiculo = reserva.getVeiculo().getModelo();
        dto.datahoraSolicitacao = reserva.getDatahoraSolicitacao();
        dto.datahoraInicioPrevista = reserva.getDatahoraInicioPrevista();
        dto.datahoraFimEstimada = reserva.getDatahoraFimEstimada();
        dto.destino = reserva.getDestino();
        dto.origem = reserva.getOrigem();
        dto.statusReserva = reserva.getStatusReserva();

        if (reserva.getMotorista() != null) {
            dto.idMotorista = reserva.getMotorista().getId();
            dto.nomeMotorista = reserva.getMotorista().getNome();
        }

        return dto;
    }

    public Long getIdReserva() {
        return idReserva;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public String getNomeUsuario() {
        return nomeUsuario;
    }

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public String getPlacaVeiculo() {
        return placaVeiculo;
    }

    public String getModeloVeiculo() {
        return modeloVeiculo;
    }

    public Long getIdMotorista() {
        return idMotorista;
    }

    public String getNomeMotorista() {
        return nomeMotorista;
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
