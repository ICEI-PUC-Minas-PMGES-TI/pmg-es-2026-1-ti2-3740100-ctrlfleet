package com.ctrlfleet.api.dto;

import com.ctrlfleet.api.StatusVeiculo;

public class VeiculoResponseDTO {

    private Long id;
    private String placa;
    private String modelo;
    private String marca;
    private int ano;
    private StatusVeiculo status;

    public VeiculoResponseDTO() {}

    public VeiculoResponseDTO(Long id, String placa, String modelo, String marca, int ano, StatusVeiculo status) {
        this.id = id;
        this.placa = placa;
        this.modelo = modelo;
        this.marca = marca;
        this.ano = ano;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }

    public StatusVeiculo getStatus() { return status; }
    public void setStatus(StatusVeiculo status) { this.status = status; }
}