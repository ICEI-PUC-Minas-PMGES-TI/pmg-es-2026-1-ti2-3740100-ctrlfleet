package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.dto.auth.LoginRequestDTO;
import com.ctrlfleet.api.dto.auth.LoginResponseDTO;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {
        String emailNorm = dto.getEmail().trim().toLowerCase();

        Usuario usuario = usuarioRepository
                .findByEmail(emailNorm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email ou senha inválidos"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        switch (usuario.getStatus()) {
            case "BLOQUEADO" -> throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Conta bloqueada. Entre em contato com o administrador.");
            case "INATIVO" -> throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Conta inativa. Entre em contato com o administrador.");
            case "PENDENTE" -> throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Conta aguardando aprovação do administrador.");
            default -> { /* ATIVO — prossegue */ }
        }

        String role = usuario.getPapel() != null ? usuario.getPapel().name() : "ROLE_SOLICITANTE";

        String token = jwtUtil.gerar(
                usuario.getId(),
                usuario.getEmail(),
                role,
                usuario.getNome());

        Long motoristaId = null;
        if (usuario.getMotorista() != null) {
            motoristaId = usuario.getMotorista().getId();
        }

        return new LoginResponseDTO(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                role,
                usuario.getPerfilAcesso(),
                motoristaId);
    }
}
