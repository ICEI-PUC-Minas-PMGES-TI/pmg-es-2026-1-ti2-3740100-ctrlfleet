package com.ctrlfleet.api.dto.reserva;

import com.ctrlfleet.api.domain.model.Reserva;
import java.time.LocalDateTime;

public class ReservaResponseDTO {
    private Long idReserva;
    private Long idUsuario;
    private String nomeSolicitante;
    private String matriculaSolicitante;
    private Long idVeiculo;
    private String placaVeiculo;
    private String modeloVeiculo;
    private String origem;
    private String destino;
    private String justificativa;
    private Double origemLat;
    private Double origemLng;
    private Double destinoLat;
    private Double destinoLng;
    private String statusReserva;
    private LocalDateTime dataHoraSolicitacao;
    private LocalDateTime dataHoraInicioPrevista;
    private LocalDateTime dataHoraFimEstimada;

    public static ReservaResponseDTO fromEntity(Reserva reserva) {
        ReservaResponseDTO dto = new ReservaResponseDTO();
        dto.idReserva = reserva.getId();
        dto.idUsuario = reserva.getUsuario().getId();
        dto.nomeSolicitante = reserva.getUsuario().getNome();
        dto.matriculaSolicitante = reserva.getMatriculaSolicitante() != null
                ? reserva.getMatriculaSolicitante()
                : reserva.getUsuario().getMatricula();
        dto.idVeiculo = reserva.getVeiculo().getId();
        dto.placaVeiculo = reserva.getVeiculo().getPlaca();
        dto.modeloVeiculo = reserva.getVeiculo().getMarca() + " " + reserva.getVeiculo().getModelo();
        dto.origem = reserva.getOrigem();
        dto.destino = reserva.getDestino();
        dto.justificativa = reserva.getJustificativa();
        dto.origemLat = reserva.getOrigemLat();
        dto.origemLng = reserva.getOrigemLng();
        dto.destinoLat = reserva.getDestinoLat();
        dto.destinoLng = reserva.getDestinoLng();
        dto.statusReserva = reserva.getStatusReserva().name();
        dto.dataHoraSolicitacao = reserva.getDataHoraSolicitacao();
        dto.dataHoraInicioPrevista = reserva.getDataHoraInicioPrevista();
        dto.dataHoraFimEstimada = reserva.getDataHoraFimEstimada();
        return dto;
    }

    public Long getIdReserva() { return idReserva; }
    public Long getIdUsuario() { return idUsuario; }
    public String getNomeSolicitante() { return nomeSolicitante; }
    public String getMatriculaSolicitante() { return matriculaSolicitante; }
    public Long getIdVeiculo() { return idVeiculo; }
    public String getPlacaVeiculo() { return placaVeiculo; }
    public String getModeloVeiculo() { return modeloVeiculo; }
    public String getOrigem() { return origem; }
    public String getDestino() { return destino; }
    public String getJustificativa() { return justificativa; }
    public Double getOrigemLat() { return origemLat; }
    public Double getOrigemLng() { return origemLng; }
    public Double getDestinoLat() { return destinoLat; }
    public Double getDestinoLng() { return destinoLng; }
    public String getStatusReserva() { return statusReserva; }
    public LocalDateTime getDataHoraSolicitacao() { return dataHoraSolicitacao; }
    public LocalDateTime getDataHoraInicioPrevista() { return dataHoraInicioPrevista; }
    public LocalDateTime getDataHoraFimEstimada() { return dataHoraFimEstimada; }
}
