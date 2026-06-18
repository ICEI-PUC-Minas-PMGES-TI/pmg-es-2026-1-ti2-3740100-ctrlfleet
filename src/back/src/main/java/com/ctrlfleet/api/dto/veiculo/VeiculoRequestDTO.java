package com.ctrlfleet.api.dto.veiculo;

import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.enums.TipoVeiculo;
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

    private TipoVeiculo tipoVeiculo;

    private Long idMotorista;

    @Valid private List<DocumentacaoRequestDTO> documentos = new ArrayList<>();

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getSecretaria() {
        return secretaria;
    }

    public void setSecretaria(String secretaria) {
        this.secretaria = secretaria;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public StatusVeiculo getStatus() {
        return status;
    }

    public void setStatus(StatusVeiculo status) {
        this.status = status;
    }

    public TipoVeiculo getTipoVeiculo() {
        return tipoVeiculo;
    }

    public void setTipoVeiculo(TipoVeiculo tipoVeiculo) {
        this.tipoVeiculo = tipoVeiculo;
    }

    public Long getIdMotorista() {
        return idMotorista;
    }

    public void setIdMotorista(Long idMotorista) {
        this.idMotorista = idMotorista;
    }

    public List<DocumentacaoRequestDTO> getDocumentos() {
        return documentos;
    }

    public void setDocumentos(List<DocumentacaoRequestDTO> documentos) {
        this.documentos = documentos;
    }
}
