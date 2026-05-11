package com.ctrlfleet.api.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "auditoria_eventos")
public class AuditoriaEvento {

    private static final ZoneId ZONA_BRASILIA = ZoneId.of("America/Sao_Paulo");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String acao;

    @Column(nullable = false, length = 120)
    private String ator;

    @Column(length = 160)
    private String alvo;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false, length = 20)
    private String severidade;

    @Column(length = 80)
    private String ip;

    @Column(nullable = false, length = 500)
    private String detalhe;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    public AuditoriaEvento() {}

    public AuditoriaEvento(String acao, String ator, String alvo, String status, String severidade, String ip, String detalhe) {
        this.acao = acao;
        this.ator = ator;
        this.alvo = alvo;
        this.status = status;
        this.severidade = severidade;
        this.ip = ip;
        this.detalhe = detalhe;
        this.criadoEm = LocalDateTime.now(ZONA_BRASILIA);
    }

    public Long getId() {
        return id;
    }

    public String getAcao() {
        return acao;
    }

    public String getAtor() {
        return ator;
    }

    public String getAlvo() {
        return alvo;
    }

    public String getStatus() {
        return status;
    }

    public String getSeveridade() {
        return severidade;
    }

    public String getIp() {
        return ip;
    }

    public String getDetalhe() {
        return detalhe;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
