package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.motorista.ChecklistItemResponseDTO;
import com.ctrlfleet.api.dto.motorista.FinalizarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.IniciarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.MotoristaResumoDTO;
import com.ctrlfleet.api.dto.motorista.ReservaMotoristaResponseDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoResponseDTO;
import com.ctrlfleet.api.service.MotoristaFrotaService;
import com.ctrlfleet.api.service.MotoristaJornadaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/motoristas")
public class MotoristaJornadaController {

    private final MotoristaJornadaService motoristaJornadaService;
    private final MotoristaFrotaService motoristaFrotaService;

    public MotoristaJornadaController(
            MotoristaJornadaService motoristaJornadaService, MotoristaFrotaService motoristaFrotaService) {
        this.motoristaJornadaService = motoristaJornadaService;
        this.motoristaFrotaService = motoristaFrotaService;
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<MotoristaResumoDTO>> listarMotoristasAtivos() {
        return ResponseEntity.ok(motoristaFrotaService.listarAtivos());
    }

    @GetMapping("/{motoristaId}/veiculos")
    public ResponseEntity<List<VeiculoResponseDTO>> listarVeiculosDoMotorista(
            @PathVariable Long motoristaId,
            @RequestParam(defaultValue = "true") boolean apenasDisponiveis) {
        return ResponseEntity.ok(motoristaFrotaService.listarVeiculosDoMotorista(motoristaId, apenasDisponiveis));
    }

    @GetMapping("/{motoristaId}/reservas/aprovadas")
    public ResponseEntity<List<ReservaMotoristaResponseDTO>> listarReservasAprovadas(
            @PathVariable Long motoristaId) {
        return ResponseEntity.ok(motoristaJornadaService.listarReservasAprovadas(motoristaId));
    }

    @GetMapping("/{motoristaId}/reservas/em-uso")
    public ResponseEntity<List<ReservaMotoristaResponseDTO>> listarReservasEmUso(
            @PathVariable Long motoristaId) {
        return ResponseEntity.ok(motoristaJornadaService.listarReservasEmUso(motoristaId));
    }

    @GetMapping("/{motoristaId}/historico")
    public ResponseEntity<List<RegistroUsoResponseDTO>> listarHistorico(@PathVariable Long motoristaId) {
        return ResponseEntity.ok(motoristaJornadaService.listarHistorico(motoristaId));
    }

    @GetMapping("/checklists/saida")
    public ResponseEntity<List<ChecklistItemResponseDTO>> listarChecklistSaida() {
        return ResponseEntity.ok(motoristaJornadaService.listarChecklistSaida());
    }

    @PostMapping("/reservas/{reservaId}/iniciar-trajeto")
    public ResponseEntity<RegistroUsoResponseDTO> iniciarTrajeto(
            @PathVariable Long reservaId, @RequestBody @Valid IniciarTrajetoRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(motoristaJornadaService.iniciarTrajeto(reservaId, dto));
    }

    @PostMapping("/reservas/{reservaId}/finalizar-trajeto")
    public ResponseEntity<RegistroUsoResponseDTO> finalizarTrajeto(
            @PathVariable Long reservaId, @RequestBody @Valid FinalizarTrajetoRequestDTO dto) {
        return ResponseEntity.ok(motoristaJornadaService.finalizarTrajeto(reservaId, dto));
    }
}
