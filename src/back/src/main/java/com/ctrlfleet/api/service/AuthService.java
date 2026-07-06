package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.dto.auth.AlterarSenhaRequestDTO;
import com.ctrlfleet.api.dto.auth.LoginRequestDTO;
import com.ctrlfleet.api.dto.auth.LoginResponseDTO;
import com.ctrlfleet.api.dto.auth.PerfilUpdateRequestDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioResponseDTO;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditoriaService auditoriaService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dto) {
        String emailNorm = dto.getEmail().trim().toLowerCase();

        Usuario usuario = usuarioRepository
                .findByEmail(emailNorm)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email ou senha inválidos"));

        if (!passwordEncoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        String status = usuario.getStatus();
        if (status == null || !"ATIVO".equalsIgnoreCase(status)) {
            String mensagem = switch (status != null ? status.toUpperCase() : "") {
                case "BLOQUEADO" -> "Conta bloqueada. Entre em contato com o administrador.";
                case "INATIVO" -> "Conta inativa. Entre em contato com o administrador.";
                case "PENDENTE" -> "Conta aguardando aprovação do administrador.";
                default -> "Conta indisponível para login.";
            };
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, mensagem);
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
                usuario.getMatricula(),
                motoristaId);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPerfilAtual() {
        return UsuarioResponseDTO.fromEntity(buscarUsuarioAutenticado());
    }

    @Transactional
    public UsuarioResponseDTO atualizarPerfil(PerfilUpdateRequestDTO dto) {
        Usuario usuario = buscarUsuarioAutenticado();

        String emailNorm = dto.getEmail().trim().toLowerCase();
        usuarioRepository
                .findByEmail(emailNorm)
                .filter(existente -> !existente.getId().equals(usuario.getId()))
                .ifPresent(existente -> {
                    throw new IllegalArgumentException("Email já cadastrado");
                });

        usuario.setNome(dto.getNome().trim());
        usuario.setEmail(emailNorm);
        Usuario salvo = usuarioRepository.save(usuario);

        auditoriaService.registrar(
                "PERFIL_ATUALIZADO",
                salvo.getNome(),
                salvo.getEmail(),
                "Atualizado",
                "info",
                null,
                "Dados pessoais alterados pelo próprio usuário.");

        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public void alterarSenha(AlterarSenhaRequestDTO dto) {
        Usuario usuario = buscarUsuarioAutenticado();

        if (!passwordEncoder.matches(dto.getSenhaAtual(), usuario.getSenha())) {
            throw new IllegalArgumentException("Senha atual incorreta");
        }

        if (passwordEncoder.matches(dto.getSenhaNova(), usuario.getSenha())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual");
        }

        usuario.setSenha(passwordEncoder.encode(dto.getSenhaNova()));
        usuarioRepository.save(usuario);

        auditoriaService.registrar(
                "SENHA_ALTERADA",
                usuario.getNome(),
                usuario.getEmail(),
                "Alterada",
                "warning",
                null,
                "Senha alterada pelo próprio usuário.");
    }

    private Usuario buscarUsuarioAutenticado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida");
        }

        String email = authentication.getPrincipal().toString();
        return usuarioRepository
                .findByEmailWithMotorista(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
    }
}
