package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.auditoria.AuditoriaEventoResponseDTO;
import com.ctrlfleet.api.dto.common.PageResponseDTO;
import com.ctrlfleet.api.service.AuditoriaService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public PageResponseDTO<AuditoriaEventoResponseDTO> listar(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("criadoEm").descending());
        return PageResponseDTO.from(auditoriaService.listarEventos(pageable));
    }
}
