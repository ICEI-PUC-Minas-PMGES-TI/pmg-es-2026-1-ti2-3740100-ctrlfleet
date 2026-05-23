package com.ctrlfleet.api.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;

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

    @NotBlank(message = "A secretaria é obrigatória")
    @Column(nullable = false)
    private String secretaria;

    @NotNull(message = "O ano é obrigatório")
    private int ano;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusVeiculo status = StatusVeiculo.DISPONIVEL;

    public Veiculo() {}

    public Veiculo(String placa, String modelo, String marca, int ano, String secretaria) {
        this.placa = placa;
        this.modelo = modelo;
        this.marca = marca;
        this.ano = ano;
        this.secretaria = secretaria;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getSecretaria() { return secretaria; }
    public void setSecretaria(String secretaria) { this.secretaria = secretaria; }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public StatusVeiculo getStatus() { return status; }
    public void setStatus(StatusVeiculo status) { this.status = status; }
}
