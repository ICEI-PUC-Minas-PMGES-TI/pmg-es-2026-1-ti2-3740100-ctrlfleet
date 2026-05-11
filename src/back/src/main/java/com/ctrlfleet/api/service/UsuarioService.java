package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.model.Motorista;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.dto.usuario.UsuarioRequestDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioResponseDTO;
import com.ctrlfleet.api.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private static final DateTimeFormatter DATA_BR =
            DateTimeFormatter.ofPattern("d/M/uuuu").withResolverStyle(ResolverStyle.STRICT);

    private static final Map<String, PapelUsuario> PERFIL_PARA_PAPEL =
            Map.of(
                    "Solicitante", PapelUsuario.ROLE_SOLICITANTE,
                    "Administrador", PapelUsuario.ROLE_ADMINISTRADOR,
                    "Gestor de Frota", PapelUsuario.ROLE_GESTOR_FROTA,
                    "Motorista", PapelUsuario.ROLE_MOTORISTA);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAllWithMotorista();
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

        PapelUsuario papel =
                Optional.ofNullable(PERFIL_PARA_PAPEL.get(dto.getPerfilAcesso().trim()))
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Perfil inválido: use Solicitante, Administrador,"
                                                        + " Gestor de Frota ou Motorista"));

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome().trim());
        usuario.setEmail(emailNorm);
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setMatricula(dto.getMatricula().trim());
        usuario.setCargo(dto.getCargo() != null ? dto.getCargo().trim() : null);
        usuario.setDataAdmissao(parseDataOpcional(dto.getDataAdmissao(), "dataAdmissao"));
        usuario.setTipoCadastro(tipoCadastro);

        usuario.setPerfilAcesso(dto.getPerfilAcesso().trim());
        usuario.setPapel(papel);
        usuario.setStatus("ATIVO");
        usuario.setDataDesligamento(null);

        if (tipoCadastro.equals("motorista")) {
            LocalDate validade = parseDataObrigatoria(dto.getCnhValidade(), "cnhValidade");
            Motorista motorista =
                    new Motorista(usuario, dto.getNumeroCnh().trim(), validade);
            usuario.setMotorista(motorista);
        }

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
