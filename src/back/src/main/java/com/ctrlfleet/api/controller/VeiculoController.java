package com.ctrlfleet.api.controller;

<<<<<<< HEAD
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
=======
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
>>>>>>> 8b9b9f01c412e9f7fea8bb088b2835eb369de4cd
