package com.ctrlfleet.api.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String matricula;

    @Column(length = 160)
    private String cargo;

    private LocalDate dataAdmissao;

    @Column(nullable = false, length = 24)
    private String tipoCadastro;

    @Column(length = 40)
    private String numeroCnh;

    private LocalDate validadeCnh;

    // ========================================================
    // Campos novos do diagrama ER (todos nullable para não quebrar
    // ddl-auto=update em tabelas pré-existentes; defaults aplicados
    // pelo UsuarioService no momento da criação).
    // ========================================================

    /** Tipo de conta canônico (ex.: ROLE_ADMINISTRADOR, ROLE_MOTORISTA). */
    @Column(name = "role", length = 40)
    private String tipoConta;

    /** Perfil de acesso amigável escolhido no cadastro (ex.: Administrador). */
    @Column(name = "perfil_acesso", length = 60)
    private String perfilAcesso;

    @Column(name = "data_desligamento")
    private LocalDate dataDesligamento;

    /** Estado da conta: ATIVO, INATIVO, BLOQUEADO, PENDENTE. */
    @Column(length = 20)
    private String status;

    // RELAÇÃO COM ROLES (muitos pra muitos)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "usuario_roles",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // CONSTRUTORES
    public Usuario() {}

    public Usuario(Long id, String nome, String email, String senha) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    // GETTERS E SETTERS

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    @JsonIgnore
    public String getSenha() {
        return senha;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public String getMatricula() {
        return matricula;
    }

    public String getCargo() {
        return cargo;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
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

    public String getTipoConta() {
        return tipoConta;
    }

    public String getPerfilAcesso() {
        return perfilAcesso;
    }

    public LocalDate getDataDesligamento() {
        return dataDesligamento;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public void setDataAdmissao(LocalDate dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public void setTipoCadastro(String tipoCadastro) {
        this.tipoCadastro = tipoCadastro;
    }

    public void setNumeroCnh(String numeroCnh) {
        this.numeroCnh = numeroCnh;
    }

    public void setValidadeCnh(LocalDate validadeCnh) {
        this.validadeCnh = validadeCnh;
    }

    public void setTipoConta(String tipoConta) {
        this.tipoConta = tipoConta;
    }

    public void setPerfilAcesso(String perfilAcesso) {
        this.perfilAcesso = perfilAcesso;
    }

    public void setDataDesligamento(LocalDate dataDesligamento) {
        this.dataDesligamento = dataDesligamento;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    // MÉTODO AUXILIAR (muito útil)
    public void addRole(Role role) {
        this.roles.add(role);
    }
}