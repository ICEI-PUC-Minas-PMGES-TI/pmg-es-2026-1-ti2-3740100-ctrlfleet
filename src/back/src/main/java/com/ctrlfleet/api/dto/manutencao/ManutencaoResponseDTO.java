package com.ctrlfleet.api.dto.manutencao;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ManutencaoResponseDTO {

    private Long id;
    private Long idVeiculo;
    private String placa;
    private String marca;
    private String modelo;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private LocalDate dataAgendada;
    private LocalDateTime dataIdentificacao;
    private Double quilometragemRegistro;
    private Double quilometragemAtual;
    private Double kmRestantes;
    private Integer diasRestantes;
    private Double custoTotal;
    private String oficinaExecutor;
    private StatusManutencao status;
    private boolean emergencia;
    private PrioridadeAlerta prioridade;
    private String proximidadeLabel;
    private boolean atrasada;
    private String nomeMotorista;

    public static ManutencaoResponseDTO fromEntity(Manutencao manutencao, Double quilometragemAtual) {
        ManutencaoResponseDTO dto = new ManutencaoResponseDTO();
        dto.id = manutencao.getId();
        dto.idVeiculo = manutencao.getVeiculo().getId();
        dto.placa = manutencao.getVeiculo().getPlaca();
        dto.marca = manutencao.getVeiculo().getMarca();
        dto.modelo = manutencao.getVeiculo().getModelo();
        if (manutencao.getMotorista() != null) {
            dto.nomeMotorista = manutencao.getMotorista().getNome();
        } else if (manutencao.getVeiculo().getMotorista() != null) {
            dto.nomeMotorista = manutencao.getVeiculo().getMotorista().getNome();
        }
        dto.tipoManutencao = manutencao.getTipoManutencao();
        dto.descricaoProblema = manutencao.getDescricaoProblema();
        dto.dataAgendada = manutencao.getDataRealizada();
        dto.dataIdentificacao = resolverDataAbertura(manutencao);
        dto.quilometragemRegistro = manutencao.getQuilometragemRegistro();
        dto.quilometragemAtual = quilometragemAtual;
        dto.custoTotal = manutencao.getCustoTotal();
        dto.oficinaExecutor = manutencao.getOficinaExecutor();
        dto.status = manutencao.getStatus();
        dto.emergencia = manutencao.isEmergencia();
        dto.prioridade = manutencao.getPrioridade();
        return dto;
    }

    /**
     * Data de abertura da solicitação. Preventivas sem registro usam data anterior ao agendamento.
     */
    public static LocalDateTime resolverDataAbertura(Manutencao manutencao) {
        if (manutencao.getDataIdentificacao() != null) {
            return manutencao.getDataIdentificacao();
        }
        if (manutencao.getDataRealizada() == null) {
            return null;
        }
        if (manutencao.getTipoManutencao() == TipoManutencao.PREVENTIVA) {
            return LocalDateTime.of(manutencao.getDataRealizada().minusDays(21), LocalTime.of(9, 0));
        }
        if (manutencao.getTipoManutencao() == TipoManutencao.CORRETIVA) {
            return LocalDateTime.of(manutencao.getDataRealizada(), LocalTime.of(8, 0));
        }
        return null;
    }

    /** Indicadores de calendário (dias restantes, atraso, proximidade). */
    public static void aplicarIndicadoresCalendario(ManutencaoResponseDTO dto) {
        LocalDate hoje = LocalDate.now();
        if (dto.getDataAgendada() != null) {
            dto.setDiasRestantes((int) ChronoUnit.DAYS.between(hoje, dto.getDataAgendada()));
        }
        dto.setAtrasada(calcularPreventivaAtrasada(dto));
        dto.setProximidadeLabel(montarProximidadeLabel(dto));
    }

    public static boolean calcularPreventivaAtrasada(ManutencaoResponseDTO dto) {
        if (dto.getTipoManutencao() != TipoManutencao.PREVENTIVA || dto.getDataAgendada() == null) {
            return false;
        }
        StatusManutencao status = dto.getStatus();
        if (status == StatusManutencao.CONCLUIDA
                || status == StatusManutencao.CANCELADA
                || status == StatusManutencao.REPROVADA) {
            return false;
        }
        return dto.getDataAgendada().isBefore(LocalDate.now());
    }

    private static String montarProximidadeLabel(ManutencaoResponseDTO dto) {
        List<String> partes = new ArrayList<>();
        if (dto.getDiasRestantes() != null) {
            if (dto.isAtrasada()) {
                partes.add("Atrasada há " + Math.abs(dto.getDiasRestantes()) + " dia(s)");
            } else if (dto.getDiasRestantes() == 0) {
                partes.add("Prevista para hoje");
            } else {
                partes.add("Em " + dto.getDiasRestantes() + " dia(s)");
            }
        }
        if (dto.getKmRestantes() != null) {
            if (dto.getKmRestantes() <= 0) {
                partes.add("Quilometragem atingida");
            } else {
                partes.add(String.format(Locale.forLanguageTag("pt-BR"), "%.0f km restantes", dto.getKmRestantes()));
            }
        }
        return partes.isEmpty() ? "Próxima da data prevista" : String.join(" · ", partes);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Long idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public TipoManutencao getTipoManutencao() {
        return tipoManutencao;
    }

    public void setTipoManutencao(TipoManutencao tipoManutencao) {
        this.tipoManutencao = tipoManutencao;
    }

    public String getDescricaoProblema() {
        return descricaoProblema;
    }

    public void setDescricaoProblema(String descricaoProblema) {
        this.descricaoProblema = descricaoProblema;
    }

    public LocalDate getDataAgendada() {
        return dataAgendada;
    }

    public void setDataAgendada(LocalDate dataAgendada) {
        this.dataAgendada = dataAgendada;
    }

    public LocalDateTime getDataIdentificacao() {
        return dataIdentificacao;
    }

    public void setDataIdentificacao(LocalDateTime dataIdentificacao) {
        this.dataIdentificacao = dataIdentificacao;
    }

    public Double getQuilometragemRegistro() {
        return quilometragemRegistro;
    }

    public void setQuilometragemRegistro(Double quilometragemRegistro) {
        this.quilometragemRegistro = quilometragemRegistro;
    }

    public Double getQuilometragemAtual() {
        return quilometragemAtual;
    }

    public void setQuilometragemAtual(Double quilometragemAtual) {
        this.quilometragemAtual = quilometragemAtual;
    }

    public Double getKmRestantes() {
        return kmRestantes;
    }

    public void setKmRestantes(Double kmRestantes) {
        this.kmRestantes = kmRestantes;
    }

    public Integer getDiasRestantes() {
        return diasRestantes;
    }

    public void setDiasRestantes(Integer diasRestantes) {
        this.diasRestantes = diasRestantes;
    }

    public Double getCustoTotal() {
        return custoTotal;
    }

    public void setCustoTotal(Double custoTotal) {
        this.custoTotal = custoTotal;
    }

    public String getOficinaExecutor() {
        return oficinaExecutor;
    }

    public void setOficinaExecutor(String oficinaExecutor) {
        this.oficinaExecutor = oficinaExecutor;
    }

    public StatusManutencao getStatus() {
        return status;
    }

    public void setStatus(StatusManutencao status) {
        this.status = status;
    }

    public boolean isEmergencia() {
        return emergencia;
    }

    public void setEmergencia(boolean emergencia) {
        this.emergencia = emergencia;
    }

    public PrioridadeAlerta getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeAlerta prioridade) {
        this.prioridade = prioridade;
    }

    public String getProximidadeLabel() {
        return proximidadeLabel;
    }

    public void setProximidadeLabel(String proximidadeLabel) {
        this.proximidadeLabel = proximidadeLabel;
    }

    public boolean isAtrasada() {
        return atrasada;
    }

    public void setAtrasada(boolean atrasada) {
        this.atrasada = atrasada;
    }

    public String getNomeMotorista() {
        return nomeMotorista;
    }

    public void setNomeMotorista(String nomeMotorista) {
        this.nomeMotorista = nomeMotorista;
    }
}
