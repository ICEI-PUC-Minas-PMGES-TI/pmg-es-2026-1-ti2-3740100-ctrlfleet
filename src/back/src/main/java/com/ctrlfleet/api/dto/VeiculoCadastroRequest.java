package com.ctrlfleet.api.dto.veiculo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class VeiculoCadastroRequest {

    @NotBlank(message = "A placa é obrigatória")
    @Pattern(
        regexp = "^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$",
        message = "Placa inválida. Use o formato antigo (ABC1234) ou Mercosul (ABC1D23)"
    )
    private String placa;

    @NotBlank(message = "O modelo é obrigatório")
    @Size(max = 100, message = "Modelo deve ter no máximo 100 caracteres")
    private String modelo;

    @NotBlank(message = "A marca é obrigatória")
    @Size(max = 50, message = "Marca deve ter no máximo 50 caracteres")
    private String marca;

    @NotNull(message = "O ano é obrigatório")
    @Min(value = 1990, message = "Ano mínimo permitido é 1990")
    @Max(value = 2100, message = "Ano inválido")
    private Integer ano;

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
}
