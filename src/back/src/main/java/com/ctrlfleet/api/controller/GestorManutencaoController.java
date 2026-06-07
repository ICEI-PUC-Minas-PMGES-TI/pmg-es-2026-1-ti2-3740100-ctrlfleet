package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.manutencao.DecisaoManutencaoRequestDTO;
import com.ctrlfleet.api.dto.manutencao.GestorManutencaoPainelDTO;
import com.ctrlfleet.api.dto.manutencao.GestorPreventivaPainelDTO;
import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import com.ctrlfleet.api.service.GestorManutencaoService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gestor/manutencoes")
public class GestorManutencaoController {

    private final GestorManutencaoService gestorManutencaoService;

    public GestorManutencaoController(GestorManutencaoService gestorManutencaoService) {
        this.gestorManutencaoService = gestorManutencaoService;
    }

    @GetMapping
    public ResponseEntity<GestorManutencaoPainelDTO> listarPainel() {
        return ResponseEntity.ok(gestorManutencaoService.montarPainel());
    }

    @GetMapping("/contagem")
    public ResponseEntity<Map<String, Long>> contarPendentes() {
        return ResponseEntity.ok(Map.of("pendentes", gestorManutencaoService.contarPendentes()));
    }

    @GetMapping("/preventiva")
    public ResponseEntity<GestorPreventivaPainelDTO> listarPainelPreventiva() {
        return ResponseEntity.ok(gestorManutencaoService.montarPainelPreventiva());
    }

    @PostMapping("/{manutencaoId}/aprovar")
    public ResponseEntity<ManutencaoResponseDTO> aprovar(
            @PathVariable Long manutencaoId, @RequestBody(required = false) DecisaoManutencaoRequestDTO dto) {
        return ResponseEntity.ok(gestorManutencaoService.aprovar(manutencaoId, dto));
    }

    @PostMapping("/{manutencaoId}/reprovar")
    public ResponseEntity<ManutencaoResponseDTO> reprovar(
            @PathVariable Long manutencaoId, @RequestBody(required = false) DecisaoManutencaoRequestDTO dto) {
        return ResponseEntity.ok(gestorManutencaoService.reprovar(manutencaoId, dto));
    }

    @PatchMapping("/{manutencaoId}/prioridade")
    public ResponseEntity<ManutencaoResponseDTO> definirPrioridade(
            @PathVariable Long manutencaoId, @RequestBody DecisaoManutencaoRequestDTO dto) {
        return ResponseEntity.ok(gestorManutencaoService.definirPrioridade(manutencaoId, dto));
    }

    @PostMapping("/{manutencaoId}/iniciar")
    public ResponseEntity<ManutencaoResponseDTO> iniciar(
            @PathVariable Long manutencaoId, @RequestBody(required = false) DecisaoManutencaoRequestDTO dto) {
        return ResponseEntity.ok(gestorManutencaoService.iniciar(manutencaoId, dto));
    }

    @PostMapping("/{manutencaoId}/concluir")
    public ResponseEntity<ManutencaoResponseDTO> concluir(
            @PathVariable Long manutencaoId, @RequestBody(required = false) DecisaoManutencaoRequestDTO dto) {
        return ResponseEntity.ok(gestorManutencaoService.concluir(manutencaoId, dto));
    }
}
