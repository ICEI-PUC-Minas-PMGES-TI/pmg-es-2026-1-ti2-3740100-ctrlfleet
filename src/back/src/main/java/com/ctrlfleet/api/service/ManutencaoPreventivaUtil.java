package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Regras compartilhadas de proximidade para manutenção preventiva. */
public final class ManutencaoPreventivaUtil {

    public static final int PREVENTIVE_DAYS_THRESHOLD = 45;
    public static final double PREVENTIVE_KM_THRESHOLD = 2000d;

    private ManutencaoPreventivaUtil() {}

    public static boolean isPreventivaProxima(ManutencaoResponseDTO dto, LocalDate hoje) {
        if (ManutencaoResponseDTO.calcularPreventivaAtrasada(dto)) {
            return true;
        }
        boolean porData = dto.getDataAgendada() != null
                && !dto.getDataAgendada().isBefore(hoje.minusDays(7))
                && !dto.getDataAgendada().isAfter(hoje.plusDays(PREVENTIVE_DAYS_THRESHOLD));
        boolean porKm = dto.getKmRestantes() != null && dto.getKmRestantes() <= PREVENTIVE_KM_THRESHOLD;
        return porData || porKm;
    }

    public static List<ManutencaoResponseDTO> extrairPreventivasProximas(
            List<Manutencao> registros, Map<Long, Double> kmPorVeiculo) {
        LocalDate hoje = LocalDate.now();
        Map<Long, ManutencaoResponseDTO> deduplicado = new LinkedHashMap<>();

        registros.stream()
                .filter(item -> item.getTipoManutencao() == TipoManutencao.PREVENTIVA
                        && item.getStatus() == StatusManutencao.AGENDADA)
                .sorted(Comparator.comparing(Manutencao::getDataRealizada, Comparator.nullsLast(Comparator.naturalOrder())))
                .forEach(item -> {
                    ManutencaoResponseDTO dto = enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId()));
                    if (!isPreventivaProxima(dto, hoje)) return;
                    deduplicado.putIfAbsent(item.getVeiculo().getId(), dto);
                });

        return deduplicado.values().stream()
                .sorted(Comparator.comparing(
                                ManutencaoResponseDTO::getDiasRestantes, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(
                                ManutencaoResponseDTO::getKmRestantes, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public static ManutencaoResponseDTO enriquecerDto(Manutencao manutencao, Double quilometragemAtual) {
        ManutencaoResponseDTO dto = ManutencaoResponseDTO.fromEntity(manutencao, quilometragemAtual);
        if (manutencao.getQuilometragemRegistro() != null && quilometragemAtual != null) {
            dto.setKmRestantes(manutencao.getQuilometragemRegistro() - quilometragemAtual);
        }
        ManutencaoResponseDTO.aplicarIndicadoresCalendario(dto);
        return dto;
    }
}
