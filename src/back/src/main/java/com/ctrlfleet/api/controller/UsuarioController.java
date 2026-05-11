package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.usuario.UsuarioRequestDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioResponseDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioUpdateRequestDTO;
import com.ctrlfleet.api.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(@RequestBody @Valid UsuarioRequestDTO dto) {
        UsuarioResponseDTO response = usuarioService.criarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listarTodos().stream().map(UsuarioResponseDTO::fromEntity).toList();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public UsuarioResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid UsuarioUpdateRequestDTO dto) {
        return usuarioService.atualizarUsuario(id, dto);
    }

    @PatchMapping("/{id}/desativar")
    public UsuarioResponseDTO desativar(@PathVariable Long id) {
        return usuarioService.desativarUsuario(id);
    }

    @PatchMapping("/{id}/aprovar")
    public UsuarioResponseDTO aprovar(@PathVariable Long id, HttpServletRequest request) {
        return usuarioService.aprovarUsuario(id, request.getRemoteAddr());
    }

    @PatchMapping("/{id}/recusar")
    public UsuarioResponseDTO recusar(@PathVariable Long id, HttpServletRequest request) {
        return usuarioService.recusarUsuario(id, request.getRemoteAddr());
    }

    @PatchMapping("/{id}/bloquear")
    public UsuarioResponseDTO bloquear(@PathVariable Long id, HttpServletRequest request) {
        return usuarioService.bloquearUsuario(id, request.getRemoteAddr());
    }

    @PatchMapping("/{id}/reativar")
    public UsuarioResponseDTO reativar(@PathVariable Long id, HttpServletRequest request) {
        return usuarioService.reativarUsuario(id, request.getRemoteAddr());
    }

    @PostMapping("/{id}/reenviar-convite")
    public UsuarioResponseDTO reenviarConvite(@PathVariable Long id, HttpServletRequest request) {
        return usuarioService.reenviarConvite(id, request.getRemoteAddr());
    }

    @PostMapping("/{id}/redefinir-senha")
    public UsuarioResponseDTO redefinirSenha(@PathVariable Long id, HttpServletRequest request) {
        return usuarioService.redefinirSenha(id, request.getRemoteAddr());
    }
}
