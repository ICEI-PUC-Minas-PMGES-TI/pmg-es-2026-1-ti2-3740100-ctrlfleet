package com.ctrlfleet.api.dto.motorista;

public class ChecklistItemResponseDTO {
    private Long id;
    private String nome;

    public ChecklistItemResponseDTO(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }
}
