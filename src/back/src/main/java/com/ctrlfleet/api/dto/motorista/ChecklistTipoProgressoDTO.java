package com.ctrlfleet.api.dto.motorista;

public class ChecklistTipoProgressoDTO {
    private Long idTipoInspecao;
    private String nome;
    private String descricao;
    private int totalItens;
    private int itensConcluidos;
    private boolean concluido;

    public ChecklistTipoProgressoDTO(
            Long idTipoInspecao,
            String nome,
            String descricao,
            int totalItens,
            int itensConcluidos,
            boolean concluido) {
        this.idTipoInspecao = idTipoInspecao;
        this.nome = nome;
        this.descricao = descricao;
        this.totalItens = totalItens;
        this.itensConcluidos = itensConcluidos;
        this.concluido = concluido;
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

    public int getTotalItens() {
        return totalItens;
    }

    public int getItensConcluidos() {
        return itensConcluidos;
    }

    public boolean isConcluido() {
        return concluido;
    }
}
