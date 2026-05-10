package com.ctrlfleet.api.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UsuarioRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    private String senha;

    @NotBlank(message = "Matrícula é obrigatória")
    private String matricula;

    @NotBlank(message = "Perfil de acesso é obrigatório")
    private String perfilAcesso;

    private String cargo;

    /** Formato esperado: dd/MM/yyyy (opcional) */
    private String dataAdmissao;

    @NotBlank(message = "Tipo de cadastro é obrigatório")
    private String tipoCadastro;

    private String numeroCnh;

    private String cnhValidade;

    /** Apenas para o fluxo do front — não persistido por enquanto */
    private boolean enviarCredenciaisEmail;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getPerfilAcesso() {
        return perfilAcesso;
    }

    public void setPerfilAcesso(String perfilAcesso) {
        this.perfilAcesso = perfilAcesso;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(String dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public String getTipoCadastro() {
        return tipoCadastro;
    }

    public void setTipoCadastro(String tipoCadastro) {
        this.tipoCadastro = tipoCadastro;
    }

    public String getNumeroCnh() {
        return numeroCnh;
    }

    public void setNumeroCnh(String numeroCnh) {
        this.numeroCnh = numeroCnh;
    }

    public String getCnhValidade() {
        return cnhValidade;
    }

    public void setCnhValidade(String cnhValidade) {
        this.cnhValidade = cnhValidade;
    }

    public boolean isEnviarCredenciaisEmail() {
        return enviarCredenciaisEmail;
    }

    public void setEnviarCredenciaisEmail(boolean enviarCredenciaisEmail) {
        this.enviarCredenciaisEmail = enviarCredenciaisEmail;
    }
}
