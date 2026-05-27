package com.ctrlfleet.api.dto.motorista;

import jakarta.validation.constraints.NotNull;

public class IniciarCorridaRequestDTO {
    @NotNull(message = "Motorista é obrigatório")
    private Long idMotorista;

    public Long getIdMotorista() {
        return idMotorista;
    }

    public void setIdMotorista(Long idMotorista) {
        this.idMotorista = idMotorista;
    }
}
