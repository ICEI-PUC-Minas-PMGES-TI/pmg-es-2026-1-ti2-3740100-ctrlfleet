package com.ctrlfleet.api.dto.motorista;

public class ChecklistItemResponseDTO {
    private Long id;
    private String nome;
    private boolean critico;
    private boolean obrigatorio;

    public ChecklistItemResponseDTO(Long id, String nome, boolean critico, boolean obrigatorio) {
        this.id = id;
        this.nome = nome;
        this.critico = critico;
        this.obrigatorio = obrigatorio;
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

    public boolean isObrigatorio() {
        return obrigatorio;
    }
}
