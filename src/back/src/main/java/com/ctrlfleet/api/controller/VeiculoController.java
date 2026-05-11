package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.veiculo.VeiculoResponseDTO;
import com.ctrlfleet.api.service.VeiculoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/veiculos")
public class VeiculoController {

    private final VeiculoService veiculoService;

    public VeiculoController(VeiculoService veiculoService) {
        this.veiculoService = veiculoService;
    }

    @GetMapping
    public List<VeiculoResponseDTO> listar() {
        return veiculoService.listarTodos().stream().map(VeiculoResponseDTO::fromEntity).toList();
    }
}
