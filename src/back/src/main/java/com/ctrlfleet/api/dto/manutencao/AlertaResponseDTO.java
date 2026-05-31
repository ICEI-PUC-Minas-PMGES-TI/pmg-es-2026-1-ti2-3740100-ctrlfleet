package com.ctrlfleet.api.dto.manutencao;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.model.Alerta;
import java.time.LocalDateTime;

public class AlertaResponseDTO {

    private Long id;
    private Long idVeiculo;
    private String placa;
    private PrioridadeAlerta prioridade;
    private String mensagem;
    private LocalDateTime dataGeracao;
    private boolean lido;
    private boolean preventivo;

    public static AlertaResponseDTO fromEntity(Alerta alerta) {
        AlertaResponseDTO dto = new AlertaResponseDTO();
        dto.id = alerta.getId();
        dto.idVeiculo = alerta.getVeiculo().getId();
        dto.placa = alerta.getVeiculo().getPlaca();
        dto.prioridade = alerta.getPrioridade();
        dto.mensagem = alerta.getMensagem();
        dto.dataGeracao = alerta.getDataGeracao();
        dto.lido = alerta.isLido();
        dto.preventivo = isPreventivoMessage(alerta.getMensagem());
        return dto;
    }

    private static boolean isPreventivoMessage(String mensagem) {
        if (mensagem == null) return false;
        String normalized = mensagem.toLowerCase();
        return normalized.contains("preventiv") || normalized.contains("revis");
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

    public PrioridadeAlerta getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeAlerta prioridade) {
        this.prioridade = prioridade;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public LocalDateTime getDataGeracao() {
        return dataGeracao;
    }

    public void setDataGeracao(LocalDateTime dataGeracao) {
        this.dataGeracao = dataGeracao;
    }

    public boolean isLido() {
        return lido;
    }

    public void setLido(boolean lido) {
        this.lido = lido;
    }

    public boolean isPreventivo() {
        return preventivo;
    }

    public void setPreventivo(boolean preventivo) {
        this.preventivo = preventivo;
    }
}
