package com.ctrlfleet.api.dto.motorista;

public class ChecklistItemResponseDTO {
    private Long id;
    private String nome;
    private boolean critico;

    public ChecklistItemResponseDTO(Long id, String nome, boolean critico) {
        this.id = id;
        this.nome = nome;
        this.critico = critico;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public boolean isCritico() {
        return critico;
    }
}
