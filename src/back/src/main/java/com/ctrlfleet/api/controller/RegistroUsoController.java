package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.registrouso.FinalizarCorridaRequestDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
import com.ctrlfleet.api.service.RegistroUsoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/registros-uso")
public class RegistroUsoController {

    private final RegistroUsoService registroUsoService;

    public RegistroUsoController(RegistroUsoService registroUsoService) {
        this.registroUsoService = registroUsoService;
    }

    /**
     * Lista todos os registros de uso de um veículo, ordenados pela data de saída mais recente.
     */
    @GetMapping("/veiculo/{veiculoId}")
    public ResponseEntity<List<RegistroUsoResponseDTO>> listarPorVeiculo(
            @PathVariable Long veiculoId) {
        List<RegistroUsoResponseDTO> registros = registroUsoService.listarPorVeiculo(veiculoId);
        return ResponseEntity.ok(registros);
    }

    /**
     * Gera o registro de uso automaticamente ao finalizar a corrida. Recebe dados de saída e
     * retorno e cria o registro completo.
     */
    @PostMapping("/finalizar")
    public ResponseEntity<RegistroUsoResponseDTO> finalizarCorrida(
            @RequestBody @Valid FinalizarCorridaRequestDTO dto) {
        RegistroUsoResponseDTO response = registroUsoService.finalizarCorrida(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
