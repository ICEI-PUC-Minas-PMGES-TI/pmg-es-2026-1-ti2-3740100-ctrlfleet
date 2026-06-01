package com.ctrlfleet.api.dto.manutencao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class EncaminharOficinaRequestDTO {

    @NotNull(message = "O ID do gestor é obrigatório")
    private Long idGestor;

    @NotBlank(message = "O nome da oficina executora é obrigatório")
    private String oficinaExecutor;

    @NotNull(message = "O prazo previsto em dias é obrigatório")
    @Positive(message = "O prazo deve ser maior que zero")
    private Integer prazoPrevistoDias;

    // Getters e Setters
    public Long getIdGestor() { return idGestor; }
    public void setIdGestor(Long idGestor) { this.idGestor = idGestor; }

    public String getOficinaExecutor() { return oficinaExecutor; }
    public void setOficinaExecutor(String oficinaExecutor) { this.oficinaExecutor = oficinaExecutor; }

    public Integer getPrazoPrevistoDias() { return prazoPrevistoDias; }
    public void setPrazoPrevistoDias(Integer prazoPrevistoDias) { this.prazoPrevistoDias = prazoPrevistoDias; }
}