package com.ctrlfleet.api.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_uso")
public class RegistroUso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_uso")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veiculo", nullable = false)
    @NotNull(message = "O veículo é obrigatório")
    private Veiculo veiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_motorista", nullable = false)
    @NotNull(message = "O motorista é obrigatório")
    private Usuario motorista;

    @Column(name = "id_reserva")
    private Long idReserva;

    @NotNull(message = "A data de saída é obrigatória")
    @Column(name = "data_saida", nullable = false)
    private LocalDateTime dataSaida;

    @NotNull(message = "A quilometragem de saída é obrigatória")
    @Column(name = "quilometragem_saida", nullable = false)
    private Double quilometragemSaida;

    @Column(name = "data_retorno")
    private LocalDateTime dataRetorno;

    @Column(name = "quilometragem_retorno")
    private Double quilometragemRetorno;

    @Column(name = "observacoes_veiculo", columnDefinition = "TEXT")
    private String observacoesVeiculo;

    protected RegistroUso() {
    }

    public RegistroUso(Veiculo veiculo, Usuario motorista, LocalDateTime dataSaida, Double quilometragemSaida) {
        this.veiculo = veiculo;
        this.motorista = motorista;
        this.dataSaida = dataSaida;
        this.quilometragemSaida = quilometragemSaida;
    }

    // ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // VEICULO
    public Veiculo getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }

    // MOTORISTA
    public Usuario getMotorista() {
        return motorista;
    }

    public void setMotorista(Usuario motorista) {
        this.motorista = motorista;
    }

    // ID_RESERVA
    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    // DATA_SAIDA
    public LocalDateTime getDataSaida() {
        return dataSaida;
    }

    public void setDataSaida(LocalDateTime dataSaida) {
        this.dataSaida = dataSaida;
    }

    // QUILOMETRAGEM_SAIDA
    public Double getQuilometragemSaida() {
        return quilometragemSaida;
    }

    public void setQuilometragemSaida(Double quilometragemSaida) {
        this.quilometragemSaida = quilometragemSaida;
    }

    // DATA_RETORNO
    public LocalDateTime getDataRetorno() {
        return dataRetorno;
    }

    public void setDataRetorno(LocalDateTime dataRetorno) {
        this.dataRetorno = dataRetorno;
    }

    // QUILOMETRAGEM_RETORNO
    public Double getQuilometragemRetorno() {
        return quilometragemRetorno;
    }

    public void setQuilometragemRetorno(Double quilometragemRetorno) {
        this.quilometragemRetorno = quilometragemRetorno;
    }

    // OBSERVACOES_VEICULO
    public String getObservacoesVeiculo() {
        return observacoesVeiculo;
    }

    public void setObservacoesVeiculo(String observacoesVeiculo) {
        this.observacoesVeiculo = observacoesVeiculo;
    }
}
