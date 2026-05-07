package com.ctrlfleet.api.dto.veiculo;

import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import java.time.LocalDate;

public class VeiculoResponseDTO {

    private Long id;
    private String placa;
    private String modelo;
    private String marca;
    private int ano;
    private String secretaria;
    private String categoriaCnh;
    private Double quilometragem;
    private String status;
    private LocalDate vencimentoIpva;
    private LocalDate vencimentoSeguro;
    private LocalDate vencimentoLicenciamento;
    private MotoristaResumoDTO motorista;

    public VeiculoResponseDTO(Veiculo veiculo) {
        this.id = veiculo.getId();
        this.placa = veiculo.getPlaca();
        this.modelo = veiculo.getModelo();
        this.marca = veiculo.getMarca();
        this.ano = veiculo.getAno();
        this.secretaria = veiculo.getSecretaria();
        this.categoriaCnh = veiculo.getCategoriaCnh();
        this.quilometragem = veiculo.getQuilometragem();
        this.status = veiculo.getStatus().name();
        this.vencimentoIpva = veiculo.getVencimentoIpva();
        this.vencimentoSeguro = veiculo.getVencimentoSeguro();
        this.vencimentoLicenciamento = veiculo.getVencimentoLicenciamento();
        this.motorista = veiculo.getMotorista() != null ? new MotoristaResumoDTO(veiculo.getMotorista()) : null;
    }

    public Long getId() { return id; }
    public String getPlaca() { return placa; }
    public String getModelo() { return modelo; }
    public String getMarca() { return marca; }
    public int getAno() { return ano; }
    public String getSecretaria() { return secretaria; }
    public String getCategoriaCnh() { return categoriaCnh; }
    public Double getQuilometragem() { return quilometragem; }
    public String getStatus() { return status; }
    public LocalDate getVencimentoIpva() { return vencimentoIpva; }
    public LocalDate getVencimentoSeguro() { return vencimentoSeguro; }
    public LocalDate getVencimentoLicenciamento() { return vencimentoLicenciamento; }
    public MotoristaResumoDTO getMotorista() { return motorista; }

    public static class MotoristaResumoDTO {
        private Long id;
        private String nome;
        private String email;
        private String departamento;
        private String numeroCnh;
        private LocalDate validadeCnh;

        public MotoristaResumoDTO(Usuario usuario) {
            this.id = usuario.getId();
            this.nome = usuario.getNome();
            this.email = usuario.getEmail();
            this.departamento = usuario.getDepartamento();
            this.numeroCnh = usuario.getNumeroCnh();
            this.validadeCnh = usuario.getValidadeCnh();
        }

        public Long getId() { return id; }
        public String getNome() { return nome; }
        public String getEmail() { return email; }
        public String getDepartamento() { return departamento; }
        public String getNumeroCnh() { return numeroCnh; }
        public LocalDate getValidadeCnh() { return validadeCnh; }
    }
}
