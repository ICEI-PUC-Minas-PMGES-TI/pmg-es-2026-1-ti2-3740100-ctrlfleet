package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.VeiculoEditDTO;
import com.ctrlfleet.api.dto.VeiculoResponseDTO;
import com.ctrlfleet.api.service.VeiculoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/veiculos")
@CrossOrigin(origins = "http://localhost:5173") 
public class VeiculoController {

    private final VeiculoService service;

    public VeiculoController(VeiculoService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeiculoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeiculoResponseDTO> editar(
            @PathVariable Long id,
            @Valid @RequestBody VeiculoEditDTO dto) {
        return ResponseEntity.ok(service.editar(id, dto));
    }
}