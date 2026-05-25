package com.ctrlfleet.api.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "item_checklist")
public class ItemChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_inspecao", nullable = false)
    private TipoInspecao tipoInspecao;

    @Column(nullable = false)
    private String nome;

    public Long getId() {
        return id;
    }

    public TipoInspecao getTipoInspecao() {
        return tipoInspecao;
    }

    public String getNome() {
        return nome;
    }
}
