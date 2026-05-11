package com.ctrlfleet.api.dto.veiculo;

import com.ctrlfleet.api.domain.model.Documentacao;
import java.math.BigDecimal;
import java.time.LocalDate;

public class DocumentacaoResponseDTO {

    private Long id;
    private String tipoDocumento;
    private LocalDate dataVencimento;
    private BigDecimal valorPago;
    private String statusPagamento;

    public static DocumentacaoResponseDTO fromEntity(Documentacao documentacao) {
        DocumentacaoResponseDTO dto = new DocumentacaoResponseDTO();
        dto.id = documentacao.getId();
        dto.tipoDocumento = documentacao.getTipoDocumento();
        dto.dataVencimento = documentacao.getDataVencimento();
        dto.valorPago = documentacao.getValorPago();
        dto.statusPagamento = documentacao.getStatusPagamento();
        return dto;
    }

    public Long getId() {
        return id;
    }

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
