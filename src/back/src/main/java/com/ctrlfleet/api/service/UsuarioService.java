package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Role;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.dto.usuario.UsuarioRequestDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioResponseDTO;
import com.ctrlfleet.api.repository.RoleRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private static final DateTimeFormatter DATA_BR =
            DateTimeFormatter.ofPattern("d/M/uuuu").withResolverStyle(ResolverStyle.STRICT);

    private static final Map<String, String> PERFIL_PARA_ROLE =
            Map.of(
                    "Solicitante", "ROLE_SOLICITANTE",
                    "Administrador", "ROLE_ADMINISTRADOR",
                    "Gestor de Frota", "ROLE_GESTOR_FROTA",
                    "Motorista", "ROLE_MOTORISTA");

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponseDTO criarUsuario(UsuarioRequestDTO dto) {

        String emailNorm = dto.getEmail().trim().toLowerCase();
        if (usuarioRepository.findByEmail(emailNorm).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        var tipoCadastro = dto.getTipoCadastro().trim().toLowerCase();
        if (!tipoCadastro.equals("usuario") && !tipoCadastro.equals("motorista")) {
            throw new IllegalArgumentException("tipoCadastro deve ser 'usuario' ou 'motorista'");
        }

        if (tipoCadastro.equals("motorista")) {
            if (dto.getNumeroCnh() == null || dto.getNumeroCnh().isBlank()) {
                throw new IllegalArgumentException("CNH é obrigatória para cadastro como motorista");
            }
            if (dto.getCnhValidade() == null || dto.getCnhValidade().isBlank()) {
                throw new IllegalArgumentException("Validade da CNH é obrigatória para motorista");
            }
        }

        String nomeRole =
                Optional.ofNullable(PERFIL_PARA_ROLE.get(dto.getPerfilAcesso().trim()))
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Perfil inválido: use Solicitante, Administrador,"
                                                        + " Gestor de Frota ou Motorista"));

        Role role =
                roleRepository
                        .findByNome(nomeRole)
                        .orElseThrow(() -> new IllegalArgumentException("Perfil não encontrado no sistema: " + nomeRole));

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome().trim());
        usuario.setEmail(emailNorm);
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setMatricula(dto.getMatricula().trim());
        usuario.setDepartamento(dto.getDepartamento().trim());
        usuario.setCargo(dto.getCargo() != null ? dto.getCargo().trim() : null);
        usuario.setDataAdmissao(parseDataOpcional(dto.getDataAdmissao(), "dataAdmissao"));
        usuario.setTipoCadastro(tipoCadastro);

        if (tipoCadastro.equals("motorista")) {
            usuario.setNumeroCnh(dto.getNumeroCnh().trim());
            usuario.setValidadeCnh(parseDataObrigatoria(dto.getCnhValidade(), "cnhValidade"));
        } else {
            usuario.setNumeroCnh(null);
            usuario.setValidadeCnh(null);
        }

        usuario.getRoles().clear();
        usuario.addRole(role);

        Usuario salvo = usuarioRepository.save(usuario);

        return new UsuarioResponseDTO(salvo.getId(), salvo.getNome(), salvo.getEmail());
    }

    private LocalDate parseDataOpcional(String raw, String campo) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return parseBrDataOuErro(raw, campo);
    }

    private LocalDate parseDataObrigatoria(String raw, String campo) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(campo + " é obrigatória (use dd/mm/aaaa)");
        }
        return parseBrDataOuErro(raw, campo);
    }

    private LocalDate parseBrDataOuErro(String raw, String campo) {
        String t = raw.trim();
        try {
            return LocalDate.parse(t, DATA_BR);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(campo + " inválida; use formato dd/mm/aaaa");
        }
    }
}
