package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.reserva.DecisaoReservaRequestDTO;
import com.ctrlfleet.api.dto.reserva.ReservaRequestDTO;
import com.ctrlfleet.api.dto.reserva.ReservaResponseDTO;
import com.ctrlfleet.api.service.ReservaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public ResponseEntity<List<ReservaResponseDTO>> listar(
            @RequestParam(required = false) String status, @RequestParam(required = false) Long idUsuario) {
        return ResponseEntity.ok(reservaService.listar(status, idUsuario));
    }

    @PostMapping
    public ResponseEntity<ReservaResponseDTO> criar(@RequestBody @Valid ReservaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.criar(dto));
    }

    @PostMapping("/{reservaId}/aprovar")
    public ResponseEntity<ReservaResponseDTO> aprovar(
            @PathVariable Long reservaId, @RequestBody(required = false) DecisaoReservaRequestDTO dto) {
        return ResponseEntity.ok(reservaService.aprovar(reservaId, dto));
    }

    @PostMapping("/{reservaId}/reprovar")
    public ResponseEntity<ReservaResponseDTO> reprovar(
            @PathVariable Long reservaId, @RequestBody(required = false) DecisaoReservaRequestDTO dto) {
        return ResponseEntity.ok(reservaService.reprovar(reservaId, dto));
    }

    @PostMapping("/{reservaId}/cancelar")
    public ResponseEntity<ReservaResponseDTO> cancelar(
            @PathVariable Long reservaId, @RequestBody(required = false) DecisaoReservaRequestDTO dto) {
        return ResponseEntity.ok(reservaService.cancelar(reservaId, dto));
    }

    @DeleteMapping("/{reservaId}")
    public ResponseEntity<Void> excluirDoHistorico(
            @PathVariable Long reservaId, @RequestParam(required = false) Long idUsuario) {
        reservaService.excluirDoHistorico(reservaId, idUsuario);
        return ResponseEntity.noContent().build();
    }
}
