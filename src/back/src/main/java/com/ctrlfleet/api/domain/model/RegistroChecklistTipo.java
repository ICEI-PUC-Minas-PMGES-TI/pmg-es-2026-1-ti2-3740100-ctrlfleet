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
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "registro_checklist_tipo",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id_uso", "id_tipo_inspecao"}))
public class RegistroChecklistTipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro_tipo")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_uso", nullable = false)
    private RegistroUso registroUso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_inspecao", nullable = false)
    private TipoInspecao tipoInspecao;

    @Column(name = "concluido_em", nullable = false)
    private LocalDateTime concluidoEm;

    protected RegistroChecklistTipo() {}

    public RegistroChecklistTipo(RegistroUso registroUso, TipoInspecao tipoInspecao, LocalDateTime concluidoEm) {
        this.registroUso = registroUso;
        this.tipoInspecao = tipoInspecao;
        this.concluidoEm = concluidoEm;
    }

    public Long getId() {
        return id;
    }

    public RegistroUso getRegistroUso() {
        return registroUso;
    }

    public TipoInspecao getTipoInspecao() {
        return tipoInspecao;
    }

    public LocalDateTime getConcluidoEm() {
        return concluidoEm;
    }
}
