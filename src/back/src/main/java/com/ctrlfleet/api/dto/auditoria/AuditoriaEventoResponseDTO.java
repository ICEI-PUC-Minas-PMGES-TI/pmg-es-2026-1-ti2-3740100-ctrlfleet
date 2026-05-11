package com.ctrlfleet.api.dto.auditoria;

import com.ctrlfleet.api.domain.model.AuditoriaEvento;
import java.time.LocalDateTime;

public class AuditoriaEventoResponseDTO {

    private Long id;
    private String acao;
    private String ator;
    private String alvo;
    private String status;
    private String severidade;
    private String ip;
    private String detalhe;
    private LocalDateTime criadoEm;

    public static AuditoriaEventoResponseDTO fromEntity(AuditoriaEvento evento) {
        AuditoriaEventoResponseDTO dto = new AuditoriaEventoResponseDTO();
        dto.id = evento.getId();
        dto.acao = evento.getAcao();
        dto.ator = evento.getAtor();
        dto.alvo = evento.getAlvo();
        dto.status = evento.getStatus();
        dto.severidade = evento.getSeveridade();
        dto.ip = evento.getIp();
        dto.detalhe = evento.getDetalhe();
        dto.criadoEm = evento.getCriadoEm();
        return dto;
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
