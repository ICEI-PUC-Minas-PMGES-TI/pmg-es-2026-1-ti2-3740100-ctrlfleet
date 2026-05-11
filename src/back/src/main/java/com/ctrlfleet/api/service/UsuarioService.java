package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Role;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.dto.usuario.UsuarioRequestDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioResponseDTO;
import com.ctrlfleet.api.dto.usuario.UsuarioUpdateRequestDTO;
import com.ctrlfleet.api.repository.RoleRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Sort;
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
                    "Servidor Solicitante", "ROLE_SOLICITANTE",
                    "Administrador", "ROLE_ADMINISTRADOR",
                    "Gestor de Frota", "ROLE_GESTOR_FROTA",
                    "Motorista", "ROLE_MOTORISTA");

    private static final Map<String, String> STATUS_CANONICO =
            Map.of(
                    "Ativo", "ATIVO",
                    "ATIVO", "ATIVO",
                    "Inativo", "INATIVO",
                    "INATIVO", "INATIVO",
                    "Bloqueado", "BLOQUEADO",
                    "BLOQUEADO", "BLOQUEADO",
                    "Pendente", "PENDENTE",
                    "PENDENTE", "PENDENTE");

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return UsuarioResponseDTO.fromEntity(buscarEntidade(id));
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
        usuario.setMatricula(formatarMatricula(dto.getMatricula()));
        usuario.setCargo(dto.getCargo() != null ? dto.getCargo().trim() : null);
        usuario.setDataAdmissao(parseDataOpcional(dto.getDataAdmissao(), "dataAdmissao"));
        usuario.setTipoCadastro(tipoCadastro);

        // Campos novos do diagrama
        usuario.setPerfilAcesso(dto.getPerfilAcesso().trim());
        usuario.setTipoConta(nomeRole);
        usuario.setStatus("ATIVO");
        usuario.setDataDesligamento(null);

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
        registrarAuditoria(
                "Usuario criado",
                salvo,
                "Ativo",
                "info",
                null,
                "Conta criada com perfil " + salvo.getPerfilAcesso() + ".");

        return new UsuarioResponseDTO(salvo.getId(), salvo.getNome(), salvo.getEmail());
    }

    @Transactional
    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioUpdateRequestDTO dto) {
        Usuario usuario = buscarEntidade(id);

        String emailNorm = dto.getEmail().trim().toLowerCase();
        usuarioRepository
                .findByEmail(emailNorm)
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(
                        existente -> {
                            throw new IllegalArgumentException("Email ja cadastrado");
                        });

        String tipoCadastro = normalizarTipoCadastro(dto.getTipoCadastro(), dto.getPerfilAcesso());
        Role role = buscarRolePorPerfil(dto.getPerfilAcesso());
        String status = normalizarStatus(dto.getStatus());

        usuario.setNome(dto.getNome().trim());
        usuario.setEmail(emailNorm);
        usuario.setMatricula(formatarMatricula(dto.getMatricula()));
        usuario.setCargo(dto.getCargo() != null && !dto.getCargo().isBlank() ? dto.getCargo().trim() : null);
        usuario.setDataAdmissao(parseDataOpcional(dto.getDataAdmissao(), "dataAdmissao"));
        usuario.setTipoCadastro(tipoCadastro);
        usuario.setPerfilAcesso(dto.getPerfilAcesso().trim());
        usuario.setTipoConta(role.getNome());
        usuario.setStatus(status);
        usuario.setDataDesligamento("INATIVO".equals(status) ? LocalDate.now() : null);

        aplicarDadosMotorista(usuario, tipoCadastro, dto.getNumeroCnh(), dto.getCnhValidade());

        usuario.getRoles().clear();
        usuario.addRole(role);

        Usuario salvo = usuarioRepository.save(usuario);
        registrarAuditoria(
                "Usuario atualizado",
                salvo,
                rotuloStatus(salvo.getStatus()),
                "info",
                null,
                "Dados cadastrais e permissoes revisados.");
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public UsuarioResponseDTO desativarUsuario(Long id) {
        Usuario usuario = buscarEntidade(id);
        usuario.setStatus("INATIVO");
        usuario.setDataDesligamento(LocalDate.now());
        Usuario salvo = usuarioRepository.save(usuario);
        registrarAuditoria(
                "Usuario inativado",
                salvo,
                "Inativo",
                "warning",
                null,
                "Conta inativada pelo painel administrativo.");
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public UsuarioResponseDTO aprovarUsuario(Long id, String ip) {
        Usuario usuario = buscarEntidade(id);
        usuario.setStatus("ATIVO");
        usuario.setDataDesligamento(null);
        Usuario salvo = usuarioRepository.save(usuario);
        registrarAuditoria(
                "Usuario aprovado",
                salvo,
                "Ativo",
                "info",
                ip,
                "Solicitacao pendente aprovada e acesso liberado.");
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public UsuarioResponseDTO recusarUsuario(Long id, String ip) {
        Usuario usuario = buscarEntidade(id);
        usuario.setStatus("INATIVO");
        usuario.setDataDesligamento(LocalDate.now());
        Usuario salvo = usuarioRepository.save(usuario);
        registrarAuditoria(
                "Solicitacao recusada",
                salvo,
                "Inativo",
                "warning",
                ip,
                "Solicitacao de acesso recusada pelo painel administrativo.");
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public UsuarioResponseDTO bloquearUsuario(Long id, String ip) {
        Usuario usuario = buscarEntidade(id);
        usuario.setStatus("BLOQUEADO");
        usuario.setDataDesligamento(null);
        Usuario salvo = usuarioRepository.save(usuario);
        registrarAuditoria(
                "Usuario bloqueado",
                salvo,
                "Bloqueado",
                "critical",
                ip,
                "Conta bloqueada manualmente pelo painel administrativo.");
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public UsuarioResponseDTO reativarUsuario(Long id, String ip) {
        Usuario usuario = buscarEntidade(id);
        usuario.setStatus("ATIVO");
        usuario.setDataDesligamento(null);
        Usuario salvo = usuarioRepository.save(usuario);
        registrarAuditoria(
                "Usuario reativado",
                salvo,
                "Ativo",
                "info",
                ip,
                "Conta reativada pelo painel administrativo.");
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public UsuarioResponseDTO reenviarConvite(Long id, String ip) {
        Usuario usuario = buscarEntidade(id);
        registrarAuditoria(
                "Convite reenviado",
                usuario,
                rotuloStatus(usuario.getStatus()),
                "info",
                ip,
                "Convite de acesso reenviado para " + usuario.getEmail() + ".");
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @Transactional
    public UsuarioResponseDTO redefinirSenha(Long id, String ip) {
        Usuario usuario = buscarEntidade(id);
        usuario.setSenha(passwordEncoder.encode("CtrlFleet@123"));
        Usuario salvo = usuarioRepository.save(usuario);
        registrarAuditoria(
                "Senha redefinida",
                salvo,
                rotuloStatus(salvo.getStatus()),
                "warning",
                ip,
                "Senha provisoria redefinida pelo painel administrativo.");
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    private Usuario buscarEntidade(Long id) {
        return usuarioRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
    }

    private Role buscarRolePorPerfil(String perfilAcesso) {
        String perfil = perfilAcesso == null ? "" : perfilAcesso.trim();
        String nomeRole =
                Optional.ofNullable(PERFIL_PARA_ROLE.get(perfil))
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Perfil invalido: use Solicitante, Administrador,"
                                                        + " Gestor de Frota ou Motorista"));

        return roleRepository
                .findByNome(nomeRole)
                .orElseThrow(() -> new IllegalArgumentException("Perfil nao encontrado no sistema: " + nomeRole));
    }

    private String normalizarTipoCadastro(String raw, String perfilAcesso) {
        String valor =
                raw == null || raw.isBlank()
                        ? ("Motorista".equals(perfilAcesso) ? "motorista" : "usuario")
                        : raw.trim().toLowerCase();

        if (!valor.equals("usuario") && !valor.equals("motorista")) {
            throw new IllegalArgumentException("tipoCadastro deve ser 'usuario' ou 'motorista'");
        }

        return valor;
    }

    private String normalizarStatus(String raw) {
        String status =
                Optional.ofNullable(STATUS_CANONICO.get(raw == null ? "" : raw.trim()))
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Status invalido: use ATIVO, INATIVO, BLOQUEADO ou PENDENTE"));
        return status;
    }

    private void registrarAuditoria(
            String acao, Usuario usuario, String status, String severidade, String ip, String detalhe) {
        auditoriaService.registrar(
                acao,
                "Admin",
                usuario.getNome(),
                status,
                severidade,
                ip,
                detalhe);
    }

    private String rotuloStatus(String status) {
        if ("ATIVO".equals(status)) return "Ativo";
        if ("INATIVO".equals(status)) return "Inativo";
        if ("BLOQUEADO".equals(status)) return "Bloqueado";
        if ("PENDENTE".equals(status)) return "Pendente";
        return status == null ? "Pendente" : status;
    }

    private String formatarMatricula(String raw) {
        String numero = raw == null ? "" : raw.trim();
        if (!numero.matches("\\d{1,10}")) {
            throw new IllegalArgumentException("Matricula deve conter apenas numeros");
        }
        return "MAT-" + String.format("%04d", Long.parseLong(numero));
    }

    private void aplicarDadosMotorista(Usuario usuario, String tipoCadastro, String numeroCnh, String cnhValidade) {
        if (tipoCadastro.equals("motorista")) {
            if (numeroCnh == null || numeroCnh.isBlank()) {
                throw new IllegalArgumentException("CNH e obrigatoria para cadastro como motorista");
            }
            if (cnhValidade == null || cnhValidade.isBlank()) {
                throw new IllegalArgumentException("Validade da CNH e obrigatoria para motorista");
            }
            usuario.setNumeroCnh(numeroCnh.trim());
            usuario.setValidadeCnh(parseDataObrigatoria(cnhValidade, "cnhValidade"));
        } else {
            usuario.setNumeroCnh(null);
            usuario.setValidadeCnh(null);
        }
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
