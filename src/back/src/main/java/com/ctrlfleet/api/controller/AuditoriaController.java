package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.auditoria.AuditoriaEventoResponseDTO;
import com.ctrlfleet.api.service.AuditoriaService;
import java.util.List;
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
    public List<AuditoriaEventoResponseDTO> listar(
            @RequestParam(required = false) String acao,
            @RequestParam(required = false) String severidade,
            @RequestParam(required = false) String ator) {
        return auditoriaService.filtrar(acao, severidade, ator);
    }
}