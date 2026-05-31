package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import com.ctrlfleet.api.dto.manutencao.MotoristaManutencaoPainelDTO;
import com.ctrlfleet.api.dto.manutencao.SolicitarManutencaoRequestDTO;
import com.ctrlfleet.api.service.MotoristaManutencaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/motoristas/{motoristaId}/manutencoes")
public class MotoristaManutencaoController {

    private final MotoristaManutencaoService motoristaManutencaoService;

    public MotoristaManutencaoController(MotoristaManutencaoService motoristaManutencaoService) {
        this.motoristaManutencaoService = motoristaManutencaoService;
    }

    @GetMapping
    public ResponseEntity<MotoristaManutencaoPainelDTO> listarPainel(@PathVariable Long motoristaId) {
        return ResponseEntity.ok(motoristaManutencaoService.montarPainel(motoristaId));
    }

    @PostMapping("/solicitar")
    public ResponseEntity<ManutencaoResponseDTO> solicitar(
            @PathVariable Long motoristaId, @Valid @RequestBody SolicitarManutencaoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(motoristaManutencaoService.solicitarManutencao(motoristaId, request));
    }
}
