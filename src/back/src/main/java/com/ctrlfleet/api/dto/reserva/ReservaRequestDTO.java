package com.ctrlfleet.api.dto.reserva;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReservaRequestDTO {

    @NotNull(message = "O id do usuário é obrigatório")
    private Long idUsuario;

    @NotNull(message = "O id do veículo é obrigatório")
    private Long idVeiculo;

    @NotNull(message = "O id do motorista é obrigatório")
    private Long idMotorista;

    @NotBlank(message = "A data de início prevista é obrigatória")
    private String datahoraInicioPrevista;

    @NotBlank(message = "A data de fim estimada é obrigatória")
    private String datahoraFimEstimada;

    @NotBlank(message = "O destino é obrigatório")
    private String destino;

    @NotBlank(message = "A origem é obrigatória")
    private String origem;

    private String statusReserva;

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Long idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public Long getIdMotorista() {
        return idMotorista;
    }

    public void setIdMotorista(Long idMotorista) {
        this.idMotorista = idMotorista;
    }

    public String getDatahoraInicioPrevista() {
        return datahoraInicioPrevista;
    }

    public void setDatahoraInicioPrevista(String datahoraInicioPrevista) {
        this.datahoraInicioPrevista = datahoraInicioPrevista;
    }

    public String getDatahoraFimEstimada() {
        return datahoraFimEstimada;
    }

    public void setDatahoraFimEstimada(String datahoraFimEstimada) {
        this.datahoraFimEstimada = datahoraFimEstimada;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public String getOrigem() {
        return origem;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public String getStatusReserva() {
        return statusReserva;
    }

    public void setStatusReserva(String statusReserva) {
        this.statusReserva = statusReserva;
    }
}
