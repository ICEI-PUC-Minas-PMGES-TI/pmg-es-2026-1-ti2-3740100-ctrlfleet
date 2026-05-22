package com.ctrlfleet.api.dto.reserva;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReservaRequestDTO {
    @NotNull(message = "Solicitante e obrigatorio")
    private Long idUsuario;

    @NotNull(message = "Veiculo e obrigatorio")
    private Long idVeiculo;

    @NotNull(message = "Inicio previsto e obrigatorio")
    private String dataHoraInicioPrevista;

    @NotNull(message = "Fim estimado e obrigatorio")
    private String dataHoraFimEstimada;

    @NotBlank(message = "Origem e obrigatoria")
    private String origem;

    @NotBlank(message = "Destino e obrigatorio")
    private String destino;

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public Long getIdVeiculo() { return idVeiculo; }
    public void setIdVeiculo(Long idVeiculo) { this.idVeiculo = idVeiculo; }
    public String getDataHoraInicioPrevista() { return dataHoraInicioPrevista; }
    public void setDataHoraInicioPrevista(String dataHoraInicioPrevista) { this.dataHoraInicioPrevista = dataHoraInicioPrevista; }
    public String getDataHoraFimEstimada() { return dataHoraFimEstimada; }
    public void setDataHoraFimEstimada(String dataHoraFimEstimada) { this.dataHoraFimEstimada = dataHoraFimEstimada; }
    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }
    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }
}
