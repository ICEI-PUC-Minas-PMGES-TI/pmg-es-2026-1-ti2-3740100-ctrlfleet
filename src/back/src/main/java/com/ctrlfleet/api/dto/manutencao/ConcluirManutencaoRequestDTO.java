package com.ctrlfleet.api.dto.manutencao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class ConcluirManutencaoRequestDTO {

    @NotBlank(message = "Detalhe os servicos realizados.")
    private String servicosRealizados;

    @NotNull(message = "Custo total e obrigatorio.")
    @PositiveOrZero(message = "Custo total nao pode ser negativo.")
    private Double custoTotal;

    @NotNull(message = "Data de conclusao e obrigatoria.")
    private LocalDate dataConclusao;

    private String garantia;

    @NotBlank(message = "Comprovante ou NF e obrigatorio.")
    private String comprovanteNf;

    public String getServicosRealizados() {
        return servicosRealizados;
    }

    public void setServicosRealizados(String servicosRealizados) {
        this.servicosRealizados = servicosRealizados;
    }

    public Double getCustoTotal() {
        return custoTotal;
    }

    public void setCustoTotal(Double custoTotal) {
        this.custoTotal = custoTotal;
    }

    public LocalDate getDataConclusao() {
        return dataConclusao;
    }

    public void setDataConclusao(LocalDate dataConclusao) {
        this.dataConclusao = dataConclusao;
    }

    public String getGarantia() {
        return garantia;
    }

    public void setGarantia(String garantia) {
        this.garantia = garantia;
    }

    public String getComprovanteNf() {
        return comprovanteNf;
    }

    public void setComprovanteNf(String comprovanteNf) {
        this.comprovanteNf = comprovanteNf;
    }
}
