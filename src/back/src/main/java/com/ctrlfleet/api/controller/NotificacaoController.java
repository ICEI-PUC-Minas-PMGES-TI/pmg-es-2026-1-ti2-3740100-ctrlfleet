package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.auditoria.AuditoriaEventoResponseDTO;
import com.ctrlfleet.api.service.AuditoriaService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final AuditoriaService auditoriaService;

    public NotificacaoController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    /**
     * Retorna eventos de atenção (warning + critical) das últimas N horas.
     * Parâmetro opcional: horas (padrão 24). Limitado a 50 resultados.
     *
     * Exemplo de uso:
     * GET /notificacoes/pendentes → últimas 24h
     * GET /notificacoes/pendentes?horas=8 → últimas 8h
     */
    @GetMapping("/pendentes")
    public List<AuditoriaEventoResponseDTO> pendentes(
            @RequestParam(defaultValue = "24") int horas) {

        LocalDateTime corte = LocalDateTime.now().minusHours(horas);

        // Busca warnings e criticals usando o AuditoriaService que já existe
        List<AuditoriaEventoResponseDTO> warnings = auditoriaService.filtrar(null, "warning", null);
        List<AuditoriaEventoResponseDTO> criticals = auditoriaService.filtrar(null, "critical", null);

        // Junta as duas listas
        List<AuditoriaEventoResponseDTO> todos = new ArrayList<>();
        todos.addAll(warnings);
        todos.addAll(criticals);

        // Filtra pelo período e ordena do mais recente para o mais antigo
        return todos.stream()
                .filter(e -> e.getCriadoEm() != null && e.getCriadoEm().isAfter(corte))
                .sorted(Comparator.comparing(AuditoriaEventoResponseDTO::getCriadoEm).reversed())
                .limit(50)
                .toList();
    }
}