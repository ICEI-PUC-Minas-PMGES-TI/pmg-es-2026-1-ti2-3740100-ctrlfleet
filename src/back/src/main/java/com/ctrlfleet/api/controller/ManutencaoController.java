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

@RestController
@RequestMapping("/manutencoes")
public class ManutencaoController {

    private final MotoristaManutencaoService manutencaoService;

    public ManutencaoController(MotoristaManutencaoService manutencaoService) {
        this.manutencaoService = manutencaoService;
    }

    @GetMapping
    public ResponseEntity<List<ManutencaoResponseDTO>> listar() {
        return ResponseEntity.ok(manutencaoService.listarManutencoes());
    }

    @PatchMapping("/{manutencaoId}/concluir")
    public ResponseEntity<ManutencaoResponseDTO> concluir(
            @PathVariable Long manutencaoId, @Valid @RequestBody ConcluirManutencaoRequestDTO request) {
        return ResponseEntity.ok(manutencaoService.concluirManutencao(manutencaoId, request));
    }
}
