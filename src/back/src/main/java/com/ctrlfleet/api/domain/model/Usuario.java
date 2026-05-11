package com.ctrlfleet.api.domain.model;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 40)
    private PapelUsuario papel;

    /** Perfil de acesso amigável escolhido no cadastro (ex.: Administrador). */
    @Column(name = "perfil_acesso", length = 60)
    private String perfilAcesso;

    @Column(name = "data_desligamento")
    private LocalDate dataDesligamento;

    /** Estado da conta: ATIVO, INATIVO, BLOQUEADO, PENDENTE. */
    @Column(length = 20)
    private String status;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Motorista motorista;

    public Usuario() {}

    public Usuario(Long id, String nome, String email, String senha) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
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

    @JsonIgnore
    public String getSenha() {
        return senha;
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

    public PapelUsuario getPapel() {
        return papel;
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

    public Motorista getMotorista() {
        return motorista;
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

    public void setPapel(PapelUsuario papel) {
        this.papel = papel;
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

    public void setMotorista(Motorista motorista) {
        this.motorista = motorista;
    }
}
