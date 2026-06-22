package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.AuditoriaEvento;
import com.ctrlfleet.api.dto.auditoria.AuditoriaEventoResponseDTO;
import com.ctrlfleet.api.repository.AuditoriaEventoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaService {

    private final AuditoriaEventoRepository auditoriaEventoRepository;

    public AuditoriaService(AuditoriaEventoRepository auditoriaEventoRepository) {
        this.auditoriaEventoRepository = auditoriaEventoRepository;
    }

    @Transactional(readOnly = true)
    public Page<AuditoriaEventoResponseDTO> listarEventos(Pageable pageable) {
        return auditoriaEventoRepository.findAll(pageable).map(AuditoriaEventoResponseDTO::fromEntity);
    }

    @Transactional
    public void registrar(String acao, String ator, String alvo, String status, String severidade, String ip, String detalhe) {
        auditoriaEventoRepository.save(new AuditoriaEvento(acao, ator, alvo, status, severidade, ip, detalhe));
    }
}
