package com.ctrlfleet.api.dto.motorista;

import java.util.List;

public class ChecklistTipoResponseDTO {
    private Long idTipoInspecao;
    private String nome;
    private String descricao;
    private List<ChecklistItemResponseDTO> itens;

    public ChecklistTipoResponseDTO(
            Long idTipoInspecao, String nome, String descricao, List<ChecklistItemResponseDTO> itens) {
        this.idTipoInspecao = idTipoInspecao;
        this.nome = nome;
        this.descricao = descricao;
        this.itens = itens;
    }

    public Long getIdTipoInspecao() {
        return idTipoInspecao;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public List<ChecklistItemResponseDTO> getItens() {
        return itens;
    }
}
