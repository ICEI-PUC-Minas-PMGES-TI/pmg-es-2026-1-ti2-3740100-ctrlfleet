package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.manutencao.ConcluirManutencaoRequestDTO;
import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import com.ctrlfleet.api.service.MotoristaManutencaoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ctrlfleet.api.dto.manutencao.AlertaResponseDTO;
import com.ctrlfleet.api.service.AlertaPreventivosService;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/manutencoes")
public class ManutencaoController {

    private final MotoristaManutencaoService manutencaoService;
    private final AlertaPreventivosService alertaPreventivosService;

    public ManutencaoController(MotoristaManutencaoService manutencaoService,
            AlertaPreventivosService alertaPreventivosService) {
        this.manutencaoService = manutencaoService;
        this.alertaPreventivosService = alertaPreventivosService;
    }

    @GetMapping
    public ResponseEntity<List<ManutencaoResponseDTO>> listar() {
        return ResponseEntity.ok(manutencaoService.listarManutencoes());
    }

    @GetMapping("/veiculo/{veiculoId}")
    public ResponseEntity<List<ManutencaoResponseDTO>> listarPorVeiculo(@PathVariable Long veiculoId) {
        return ResponseEntity.ok(manutencaoService.listarManutencoesPorVeiculo(veiculoId));
    }

    @PatchMapping("/{manutencaoId}/concluir")
    public ResponseEntity<ManutencaoResponseDTO> concluir(
            @PathVariable Long manutencaoId, @Valid @RequestBody ConcluirManutencaoRequestDTO request) {
        return ResponseEntity.ok(manutencaoService.concluirManutencao(manutencaoId, request));
    }

    // Lista alertas preventivos não lidos
    @GetMapping("/alertas/preventivos")
    public ResponseEntity<List<AlertaResponseDTO>> listarAlertasPreventivos() {
        return ResponseEntity.ok(alertaPreventivosService.listarAlertasPreventivos());
    }

    // Verifica e gera alertas novos (chame manualmente ou agende)
    @PostMapping("/alertas/verificar")
    public ResponseEntity<List<AlertaResponseDTO>> verificarAlertas() {
        return ResponseEntity.ok(alertaPreventivosService.verificarEGerarAlertas());
    }

    // Marca alerta como lido
    @PatchMapping("/alertas/{alertaId}/lido")
    public ResponseEntity<Void> marcarLido(@PathVariable Long alertaId) {
        alertaPreventivosService.marcarComoLido(alertaId);
        return ResponseEntity.noContent().build();
    }

}
