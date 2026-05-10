package com.ctrlfleet.api.dto.usuario;

import com.ctrlfleet.api.domain.model.Role;
import com.ctrlfleet.api.domain.model.Usuario;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;

public class UsuarioResponseDTO {

    /**
     * Mapeamento canônico ROLE_* → rótulo amigável de perfil.
     * Usado como fallback para usuários antigos no banco que ainda não tinham
     * `perfilAcesso` / `tipoConta` populados (campos adicionados depois pelo
     * ddl-auto=update e que não retroagem em linhas existentes).
     */
    private static final Map<String, String> ROLE_TO_PERFIL =
            Map.of(
                    "ROLE_ADMINISTRADOR", "Administrador",
                    "ROLE_GESTOR_FROTA", "Gestor de Frota",
                    "ROLE_MOTORISTA", "Motorista",
                    "ROLE_SOLICITANTE", "Solicitante");

    private Long id;
    private String nome;
    private String email;
    private String matricula;
    private String cargo;
    private String perfilAcesso;
    private String tipoConta;
    private String status;
    private LocalDate dataAdmissao;
    private LocalDate dataDesligamento;

    public UsuarioResponseDTO() {}

    public UsuarioResponseDTO(Long id, String nome, String email) {
        this.id = id;
        this.nome = nome;
        this.email = email;
    }

    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.id = usuario.getId();
        dto.nome = usuario.getNome();
        dto.email = usuario.getEmail();
        dto.matricula = usuario.getMatricula();
        dto.cargo = usuario.getCargo();
        dto.status = usuario.getStatus();
        dto.dataAdmissao = usuario.getDataAdmissao();
        dto.dataDesligamento = usuario.getDataDesligamento();

        // tipoConta efetivo: usa a coluna `role` se existir, senão pega da
        // primeira role associada via tabela usuario_roles.
        String tipoConta = usuario.getTipoConta();
        if (tipoConta == null) {
            tipoConta = primeiraRoleNome(usuario.getRoles());
        }
        dto.tipoConta = tipoConta;

        // perfilAcesso efetivo: usa a coluna `perfil_acesso` se existir, senão
        // deriva do tipoConta (rótulo amigável).
        String perfilAcesso = usuario.getPerfilAcesso();
        if (perfilAcesso == null && tipoConta != null) {
            perfilAcesso = ROLE_TO_PERFIL.get(tipoConta);
        }
        dto.perfilAcesso = perfilAcesso;

        return dto;
    }

    private static String primeiraRoleNome(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        return roles.iterator().next().getNome();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getMatricula() {
        return matricula;
    }

    public String getCargo() {
        return cargo;
    }

    public String getPerfilAcesso() {
        return perfilAcesso;
    }

    public String getTipoConta() {
        return tipoConta;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public LocalDate getDataDesligamento() {
        return dataDesligamento;
    }
}
