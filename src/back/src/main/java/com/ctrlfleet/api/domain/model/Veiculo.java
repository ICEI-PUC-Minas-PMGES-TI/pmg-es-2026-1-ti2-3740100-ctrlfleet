package com.ctrlfleet.api.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import java.time.LocalDate;

@Entity
@Table(name = "veiculos")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "A placa é obrigatória")
    @Column(unique = true, nullable = false, length = 10)
    private String placa;

    @NotBlank(message = "O modelo é obrigatório")
    @Column(nullable = false)
    private String modelo;

    @NotBlank(message = "A marca é obrigatória")
    @Column(nullable = false)
    private String marca;

    @NotNull(message = "O ano é obrigatório")
    private int ano;

    @Column
    private String secretaria;

    @Column(name = "categoria_cnh", length = 2)
    private String categoriaCnh;

    @Column
    private Double quilometragem = 0.0;

    @Column(name = "vencimento_ipva")
    private LocalDate vencimentoIpva;

    @Column(name = "vencimento_seguro")
    private LocalDate vencimentoSeguro;

    @Column(name = "vencimento_licenciamento")
    private LocalDate vencimentoLicenciamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id")
    private Usuario motorista;

    @Enumerated(EnumType.STRING) //Salva o nome do status no banco
    @Column(nullable = false)
    private StatusVeiculo status = StatusVeiculo.DISPONIVEL; // Define DISPONIVEL como valor padrão

    protected Veiculo() {
    }

    public Veiculo(String placa, String modelo, String marca, int ano) {
        this.placa = placa;
        this.modelo = modelo;
        this.marca = marca;
        this.ano = ano;
    }

    //ID
    public Long getId() { 
        return id; }
    public void setId(Long id) { 
        this.id = id; }

    //PLACA
    public String getPlaca() { 
        return placa; }
    public void setPlaca(String placa) { 
        this.placa = placa; }

    //MODELO
    public String getModelo() { 
        return modelo; }
    public void setModelo(String modelo) { 
        this.modelo = modelo; }

    //MARCA
    public String getMarca() { 
        return marca; }
    public void setMarca(String marca) { 
        this.marca = marca; }

    //ANO
    public int getAno() { 
        return ano; }
    public void setAno(int ano) { 
        this.ano = ano; }

    public String getSecretaria() {
        return secretaria;
    }

    public void setSecretaria(String secretaria) {
        this.secretaria = secretaria;
    }

    public String getCategoriaCnh() {
        return categoriaCnh;
    }

    public void setCategoriaCnh(String categoriaCnh) {
        this.categoriaCnh = categoriaCnh;
    }

    public Double getQuilometragem() {
        return quilometragem;
    }

    public void setQuilometragem(Double quilometragem) {
        this.quilometragem = quilometragem;
    }

    public LocalDate getVencimentoIpva() {
        return vencimentoIpva;
    }

    public void setVencimentoIpva(LocalDate vencimentoIpva) {
        this.vencimentoIpva = vencimentoIpva;
    }

    public LocalDate getVencimentoSeguro() {
        return vencimentoSeguro;
    }

    public void setVencimentoSeguro(LocalDate vencimentoSeguro) {
        this.vencimentoSeguro = vencimentoSeguro;
    }

    public LocalDate getVencimentoLicenciamento() {
        return vencimentoLicenciamento;
    }

    public void setVencimentoLicenciamento(LocalDate vencimentoLicenciamento) {
        this.vencimentoLicenciamento = vencimentoLicenciamento;
    }

    public Usuario getMotorista() {
        return motorista;
    }

    public void setMotorista(Usuario motorista) {
        this.motorista = motorista;
    }

    //STATUS
    public StatusVeiculo getStatus() { 
        return status; }
    public void setStatus(StatusVeiculo status) { 
        this.status = status; }
}
