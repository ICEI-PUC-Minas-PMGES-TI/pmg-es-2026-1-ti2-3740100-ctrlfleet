package com.ctrlfleet.api.dto.veiculo;

import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class VeiculoRequestDTO {

    @NotBlank(message = "placa e obrigatoria")
    private String placa;

    @NotBlank(message = "modelo e obrigatorio")
    private String modelo;

    @NotBlank(message = "marca e obrigatoria")
    private String marca;

    @NotBlank(message = "secretaria e obrigatoria")
    private String secretaria;

    @NotNull(message = "ano e obrigatorio")
    private Integer ano;

    private StatusVeiculo status;

    @Valid private List<DocumentacaoRequestDTO> documentos = new ArrayList<>();

    public String getPlaca() {
        return placa;
    }

    public String getModelo() {
        return modelo;
    }

    public String getMarca() {
        return marca;
    }

    public String getSecretaria() {
        return secretaria;
    }

    public Integer getAno() {
        return ano;
    }

    public StatusVeiculo getStatus() {
        return status;
    }

    public List<DocumentacaoRequestDTO> getDocumentos() {
        return documentos;
    }
}
