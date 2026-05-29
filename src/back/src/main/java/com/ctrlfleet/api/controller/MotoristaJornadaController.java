package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.motorista.ChecklistJornadaStatusDTO;
import com.ctrlfleet.api.dto.motorista.ChecklistTipoResponseDTO;
import com.ctrlfleet.api.dto.motorista.FinalizarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.IniciarCorridaRequestDTO;
import com.ctrlfleet.api.dto.motorista.MotoristaResumoDTO;
import com.ctrlfleet.api.dto.motorista.RegistrarChecklistParcialRequestDTO;
import com.ctrlfleet.api.dto.motorista.ReservaMotoristaResponseDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoResponseDTO;
import com.ctrlfleet.api.service.MotoristaFrotaService;
import com.ctrlfleet.api.service.MotoristaJornadaService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
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

    @GetMapping("/{motoristaId}/reservas/concluidas")
    public ResponseEntity<List<ReservaMotoristaResponseDTO>> listarReservasConcluidas(
            @PathVariable Long motoristaId) {
        return ResponseEntity.ok(motoristaJornadaService.listarReservasConcluidas(motoristaId));
    }

    @GetMapping("/reservas/{reservaId}/checklist-saida/status")
    public ResponseEntity<ChecklistJornadaStatusDTO> statusChecklistSaida(
            @PathVariable Long reservaId, @RequestParam Long idMotorista) {
        return ResponseEntity.ok(motoristaJornadaService.obterStatusChecklistSaida(reservaId, idMotorista));
    }

    @GetMapping("/reservas/{reservaId}/checklist-retorno/status")
    public ResponseEntity<ChecklistJornadaStatusDTO> statusChecklistRetorno(
            @PathVariable Long reservaId, @RequestParam Long idMotorista) {
        return ResponseEntity.ok(motoristaJornadaService.obterStatusChecklistRetorno(reservaId, idMotorista));
    }

    @GetMapping("/checklists/tipos/{tipoId}")
    public ResponseEntity<ChecklistTipoResponseDTO> buscarChecklistPorTipo(@PathVariable Long tipoId) {
        return ResponseEntity.ok(motoristaJornadaService.buscarChecklistPorTipo(tipoId));
    }

    @PostMapping("/reservas/{reservaId}/checklist-saida/tipos/{tipoId}")
    public ResponseEntity<RegistroUsoResponseDTO> registrarChecklistParcialSaida(
            @PathVariable Long reservaId,
            @PathVariable Long tipoId,
            @RequestBody @Valid RegistrarChecklistParcialRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(motoristaJornadaService.registrarChecklistParcialSaida(reservaId, tipoId, dto));
    }

    @PostMapping("/reservas/{reservaId}/checklist-retorno/tipos/{tipoId}")
    public ResponseEntity<RegistroUsoResponseDTO> registrarChecklistParcialRetorno(
            @PathVariable Long reservaId,
            @PathVariable Long tipoId,
            @RequestBody @Valid RegistrarChecklistParcialRequestDTO dto) {
        return ResponseEntity.ok(motoristaJornadaService.registrarChecklistParcialRetorno(reservaId, tipoId, dto));
    }

    @PostMapping("/reservas/{reservaId}/checklist-saida/quilometragem")
    public ResponseEntity<RegistroUsoResponseDTO> registrarQuilometragemSaida(
            @PathVariable Long reservaId, @RequestBody Map<String, Object> body) {
        Long idMotorista = Long.valueOf(body.get("idMotorista").toString());
        Double quilometragemSaida = Double.valueOf(body.get("quilometragemSaida").toString());
        return ResponseEntity.ok(
                motoristaJornadaService.registrarQuilometragemSaida(reservaId, idMotorista, quilometragemSaida));
    }

    @PostMapping("/reservas/{reservaId}/checklist-saida/registrar")
    public ResponseEntity<RegistroUsoResponseDTO> registrarChecklistSaidaFinal(
            @PathVariable Long reservaId, @RequestParam Long idMotorista) {
        return ResponseEntity.ok(motoristaJornadaService.registrarChecklistSaidaFinal(reservaId, idMotorista));
    }

    @PostMapping("/reservas/{reservaId}/iniciar-trajeto")
    public ResponseEntity<RegistroUsoResponseDTO> iniciarTrajeto(
            @PathVariable Long reservaId, @RequestBody @Valid IniciarCorridaRequestDTO dto) {
        return ResponseEntity.ok(motoristaJornadaService.iniciarTrajeto(reservaId, dto));
    }

    @PostMapping("/reservas/{reservaId}/finalizar-trajeto")
    public ResponseEntity<RegistroUsoResponseDTO> finalizarTrajeto(
            @PathVariable Long reservaId, @RequestBody @Valid FinalizarTrajetoRequestDTO dto) {
        return ResponseEntity.ok(motoristaJornadaService.finalizarTrajeto(reservaId, dto));
    }
}
