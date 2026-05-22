package com.ctrlfleet.api.dto.reserva;

public class DecisaoReservaRequestDTO {
    private Long idGestor;
    private String motivo;

    public Long getIdGestor() { return idGestor; }
    public void setIdGestor(Long idGestor) { this.idGestor = idGestor; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
