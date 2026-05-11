package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.AuditoriaEvento;
import com.ctrlfleet.api.dto.auditoria.AuditoriaEventoResponseDTO;
import com.ctrlfleet.api.repository.AuditoriaEventoRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaService {

    private final AuditoriaEventoRepository auditoriaEventoRepository;

    public AuditoriaService(AuditoriaEventoRepository auditoriaEventoRepository) {
        this.auditoriaEventoRepository = auditoriaEventoRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditoriaEventoResponseDTO> listarEventos() {
        return auditoriaEventoRepository.findAll(Sort.by(Sort.Direction.DESC, "criadoEm")).stream()
                .map(AuditoriaEventoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public void registrar(String acao, String ator, String alvo, String status, String severidade, String ip, String detalhe) {
        auditoriaEventoRepository.save(new AuditoriaEvento(acao, ator, alvo, status, severidade, ip, detalhe));
    }
}
