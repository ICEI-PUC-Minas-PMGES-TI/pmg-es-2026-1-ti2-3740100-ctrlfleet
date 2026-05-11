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

    @NotNull(message = "O ano é obrigatório")
    private int ano;

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

    //STATUS
    public StatusVeiculo getStatus() { 
        return status; }
    public void setStatus(StatusVeiculo status) { 
        this.status = status; }
}