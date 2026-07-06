package com.ctrlfleet.api.controller;

import com.ctrlfleet.api.dto.auth.AlterarSenhaRequestDTO;
import com.ctrlfleet.api.dto.auth.LoginRequestDTO;
import com.ctrlfleet.api.dto.auth.LoginResponseDTO;
import com.ctrlfleet.api.dto.auth.PerfilUpdateRequestDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioResponseDTO;
import com.ctrlfleet.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> buscarPerfil() {
        return ResponseEntity.ok(authService.buscarPerfilAtual());
    }

    @PatchMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> atualizarPerfil(@RequestBody @Valid PerfilUpdateRequestDTO dto) {
        return ResponseEntity.ok(authService.atualizarPerfil(dto));
    }

    @PostMapping("/alterar-senha")
    public ResponseEntity<Void> alterarSenha(@RequestBody @Valid AlterarSenhaRequestDTO dto) {
        authService.alterarSenha(dto);
        return ResponseEntity.noContent().build();
    }
}
