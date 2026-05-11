package com.ctrlfleet.api.dto.veiculo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class DocumentacaoRequestDTO {

    @NotBlank(message = "tipoDocumento e obrigatorio")
    private String tipoDocumento;

    @NotNull(message = "dataVencimento e obrigatoria")
    private LocalDate dataVencimento;

    private BigDecimal valorPago;
    private String statusPagamento;

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public BigDecimal getValorPago() {
        return valorPago;
    }

    public String getStatusPagamento() {
        return statusPagamento;
    }
}
