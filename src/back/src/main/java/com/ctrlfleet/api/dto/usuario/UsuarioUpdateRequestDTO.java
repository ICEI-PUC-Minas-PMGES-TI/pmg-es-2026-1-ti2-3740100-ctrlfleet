package com.ctrlfleet.api.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioUpdateRequestDTO {

    @NotBlank(message = "Nome e obrigatorio")
    @Size(min = 2, max = 120, message = "Nome deve ter entre 2 e 120 caracteres")
    @Pattern(
            regexp = "^[\\p{L}][\\p{L} .'-]*[\\p{L}]$",
            message = "Nome deve conter apenas letras, espacos, ponto, apostrofo ou hifen")
    private String nome;

    @NotBlank(message = "E-mail e obrigatorio")
    @Email(message = "E-mail invalido")
    private String email;

    @NotBlank(message = "Matricula e obrigatoria")
    @Size(min = 1, max = 10, message = "Matricula deve ter entre 1 e 10 numeros")
    @Pattern(regexp = "^\\d+$", message = "Matricula deve conter apenas numeros")
    private String matricula;

    @NotBlank(message = "Perfil de acesso e obrigatorio")
    private String perfilAcesso;

    @NotBlank(message = "Status e obrigatorio")
    private String status;

    private String cargo;
    @Pattern(
            regexp = "^\\d{1,2}/\\d{1,2}/\\d{4}$",
            message = "Data de admissao deve estar no formato dd/mm/aaaa")
    private String dataAdmissao;
    private String tipoCadastro;
    @Pattern(regexp = "^\\d{11}$", message = "CNH deve conter exatamente 11 numeros")
    private String numeroCnh;
    @Pattern(
            regexp = "^\\d{1,2}/\\d{1,2}/\\d{4}$",
            message = "Validade da CNH deve estar no formato dd/mm/aaaa")
    private String cnhValidade;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
}
