package com.ctrlfleet.api.dto.manutencao;

import com.ctrlfleet.api.domain.enums.StatusVeiculo;

public class VeiculoParadoRevisaoDTO {

    private Long idVeiculo;
    private String placa;
    private String marca;
    private String modelo;
    private StatusVeiculo statusVeiculo;
    private String nomeMotorista;
    private ManutencaoResponseDTO manutencaoAtiva;
    private Integer diasParado;
    private String motivoParada;

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Long idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public StatusVeiculo getStatusVeiculo() {
        return statusVeiculo;
    }

    public void setStatusVeiculo(StatusVeiculo statusVeiculo) {
        this.statusVeiculo = statusVeiculo;
    }

    public String getNomeMotorista() {
        return nomeMotorista;
    }

    public void setNomeMotorista(String nomeMotorista) {
        this.nomeMotorista = nomeMotorista;
    }

    public ManutencaoResponseDTO getManutencaoAtiva() {
        return manutencaoAtiva;
    }

    public void setManutencaoAtiva(ManutencaoResponseDTO manutencaoAtiva) {
        this.manutencaoAtiva = manutencaoAtiva;
    }

    public Integer getDiasParado() {
        return diasParado;
    }

    public void setDiasParado(Integer diasParado) {
        this.diasParado = diasParado;
    }

    public String getMotivoParada() {
        return motivoParada;
    }

    public void setMotivoParada(String motivoParada) {
        this.motivoParada = motivoParada;
    }
}
