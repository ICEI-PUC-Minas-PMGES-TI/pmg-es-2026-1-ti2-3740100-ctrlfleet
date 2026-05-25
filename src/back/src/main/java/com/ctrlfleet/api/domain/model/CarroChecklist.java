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
import java.time.LocalDateTime;

@Entity
@Table(name = "carro_checklist")
public class CarroChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_checklist")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_uso", nullable = false)
    private RegistroUso registroUso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_item", nullable = false)
    private ItemChecklist item;

    @Column(name = "data_checklist", nullable = false)
    private LocalDateTime dataChecklist;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    protected CarroChecklist() {
    }

    public CarroChecklist(RegistroUso registroUso, ItemChecklist item, LocalDateTime dataChecklist, String observacoes) {
        this.registroUso = registroUso;
        this.item = item;
        this.dataChecklist = dataChecklist;
        this.observacoes = observacoes;
    }
}
