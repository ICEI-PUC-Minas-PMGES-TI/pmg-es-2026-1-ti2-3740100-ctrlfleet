package com.ctrlfleet.api.dto.usuario;

import com.ctrlfleet.api.domain.model.Usuario;
import java.time.LocalDate;
import java.util.Map;

public class UsuarioResponseDTO {

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
    private String tipoCadastro;
    private String numeroCnh;
    private LocalDate validadeCnh;
    private LocalDate dataAdmissao;
    private LocalDate dataDesligamento;
    private String numeroCnh;
    private LocalDate validadeCnh;

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
        dto.tipoCadastro = usuario.getTipoCadastro();
        dto.numeroCnh = usuario.getNumeroCnh();
        dto.validadeCnh = usuario.getValidadeCnh();
        dto.dataAdmissao = usuario.getDataAdmissao();
        dto.dataDesligamento = usuario.getDataDesligamento();

        String tipoConta = usuario.getPapel() != null ? usuario.getPapel().name() : null;
        dto.tipoConta = tipoConta;

        String perfilAcesso = usuario.getPerfilAcesso();
        if (perfilAcesso == null && tipoConta != null) {
            perfilAcesso = ROLE_TO_PERFIL.get(tipoConta);
        }
        dto.perfilAcesso = perfilAcesso;

        if (usuario.getMotorista() != null) {
            dto.numeroCnh = usuario.getMotorista().getNumeroCnh();
            dto.validadeCnh = usuario.getMotorista().getValidadeCnh();
        }

        return dto;
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

    public String getTipoCadastro() {
        return tipoCadastro;
    }

    public String getNumeroCnh() {
        return numeroCnh;
    }

    public LocalDate getValidadeCnh() {
        return validadeCnh;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public LocalDate getDataDesligamento() {
        return dataDesligamento;
    }

    public String getNumeroCnh() {
        return numeroCnh;
    }

    public LocalDate getValidadeCnh() {
        return validadeCnh;
    }
}
