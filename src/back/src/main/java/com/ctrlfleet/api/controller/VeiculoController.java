package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.service.VeiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/veiculos")
@CrossOrigin(origins = "*") // Permite acesso do seu Frontend React
public class VeiculoController {

    @Autowired
    private VeiculoService veiculoService;

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Veiculo veiculo) {
        try {
            Veiculo novoVeiculo = veiculoService.salvar(veiculo);
            // Retorna Status 201 Created se der certo
            return ResponseEntity.status(HttpStatus.CREATED).body(novoVeiculo);
        } catch (RuntimeException e) {
            // Retorna Status 400 Bad Request se a placa já existir
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}