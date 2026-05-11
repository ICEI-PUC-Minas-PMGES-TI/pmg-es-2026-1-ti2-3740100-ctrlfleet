package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.veiculo.DocumentacaoRequestDTO;
import com.ctrlfleet.api.dto.veiculo.DocumentacaoResponseDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoRequestDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoResponseDTO;
import com.ctrlfleet.api.service.VeiculoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
        return veiculoService.listarTodos();
    }

    @GetMapping("/{id}")
    public VeiculoResponseDTO buscarPorId(@PathVariable Long id) {
        return veiculoService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<VeiculoResponseDTO> cadastrar(@RequestBody @Valid VeiculoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(veiculoService.salvar(dto));
    }

    @PutMapping("/{id}")
    public VeiculoResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid VeiculoRequestDTO dto) {
        return veiculoService.atualizar(id, dto);
    }

    @PatchMapping("/{id}/desativar")
    public VeiculoResponseDTO desativar(@PathVariable Long id) {
        return veiculoService.desativar(id);
    }

    @PostMapping("/{id}/documentacao")
    public ResponseEntity<DocumentacaoResponseDTO> cadastrarDocumentacao(
            @PathVariable Long id, @RequestBody @Valid DocumentacaoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(veiculoService.cadastrarDocumentacao(id, dto));
    }

    @PutMapping("/{id}/documentacao/{documentoId}")
    public DocumentacaoResponseDTO editarDocumentacao(
            @PathVariable Long id, @PathVariable Long documentoId, @RequestBody @Valid DocumentacaoRequestDTO dto) {
        return veiculoService.editarDocumentacao(id, documentoId, dto);
    }
}
