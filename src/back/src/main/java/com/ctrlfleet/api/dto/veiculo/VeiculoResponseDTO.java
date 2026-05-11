package com.ctrlfleet.api.dto.veiculo;

import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.Veiculo;

/**
 * Representação de um Veículo para consumo do frontend (painel do gestor de
 * frota). Mantém apenas os campos atualmente persistidos pela entidade
 * {@link Veiculo}; campos como documentos, motorista vinculado e categoria de
 * CNH ainda não existem no domínio e por isso não são expostos aqui — o front
 * deve usar valores neutros quando precisar exibi-los.
 */
public class VeiculoResponseDTO {

    private Long id;
    private String placa;
    private String modelo;
    private String marca;
    private int ano;
    private StatusVeiculo status;

    public VeiculoResponseDTO() {}

    public static VeiculoResponseDTO fromEntity(Veiculo veiculo) {
        VeiculoResponseDTO dto = new VeiculoResponseDTO();
        dto.id = veiculo.getId();
        dto.placa = veiculo.getPlaca();
        dto.modelo = veiculo.getModelo();
        dto.marca = veiculo.getMarca();
        dto.ano = veiculo.getAno();
        dto.status = veiculo.getStatus();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getPlaca() {
        return placa;
    }

    public String getModelo() {
        return modelo;
    }

    public String getMarca() {
        return marca;
    }

    public int getAno() {
        return ano;
    }

    public StatusVeiculo getStatus() {
        return status;
    }
}
