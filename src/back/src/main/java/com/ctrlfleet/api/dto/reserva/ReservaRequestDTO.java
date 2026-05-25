package com.ctrlfleet.api.dto.reserva;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReservaRequestDTO {
    @NotNull(message = "Solicitante e obrigatorio")
    private Long idUsuario;

    @NotBlank(message = "Matricula do solicitante e obrigatoria")
    private String matriculaSolicitante;

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

    @NotBlank(message = "Justificativa e obrigatoria")
    private String justificativa;

    private Double origemLat;
    private Double origemLng;
    private Double destinoLat;
    private Double destinoLng;

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public String getMatriculaSolicitante() { return matriculaSolicitante; }
    public void setMatriculaSolicitante(String matriculaSolicitante) { this.matriculaSolicitante = matriculaSolicitante; }
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
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
    public Double getOrigemLat() { return origemLat; }
    public void setOrigemLat(Double origemLat) { this.origemLat = origemLat; }
    public Double getOrigemLng() { return origemLng; }
    public void setOrigemLng(Double origemLng) { this.origemLng = origemLng; }
    public Double getDestinoLat() { return destinoLat; }
    public void setDestinoLat(Double destinoLat) { this.destinoLat = destinoLat; }
    public Double getDestinoLng() { return destinoLng; }
    public void setDestinoLng(Double destinoLng) { this.destinoLng = destinoLng; }
}
