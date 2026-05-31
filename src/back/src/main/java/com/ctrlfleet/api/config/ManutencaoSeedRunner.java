package com.ctrlfleet.api.config;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.repository.ManutencaoRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ManutencaoSeedRunner implements ApplicationRunner {

    private final ManutencaoRepository manutencaoRepository;
    private final VeiculoRepository veiculoRepository;

    public ManutencaoSeedRunner(ManutencaoRepository manutencaoRepository, VeiculoRepository veiculoRepository) {
        this.manutencaoRepository = manutencaoRepository;
        this.veiculoRepository = veiculoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (manutencaoRepository.count() > 0) {
            return;
        }

        List<SeedRecord> seeds = List.of(
                new SeedRecord(7L, TipoManutencao.CORRETIVA, StatusManutencao.EM_ANDAMENTO, "Troca da correia dentada e tensores após ruído anormal no motor.", LocalDate.of(2026, 4, 12), 87850d, 1840d, "Mecânica Central LTDA", false, PrioridadeAlerta.ALTA),
                new SeedRecord(8L, TipoManutencao.CORRETIVA, StatusManutencao.EM_ANDAMENTO, "Reparo no sistema de injeção eletrônica.", LocalDate.of(2026, 4, 20), 51120d, 920d, "Auto Center Brasil", false, PrioridadeAlerta.ALTA),
                new SeedRecord(1L, TipoManutencao.PREVENTIVA, StatusManutencao.CONCLUIDA, "Revisão de 15.000 km — troca de óleo, filtros e checagem geral.", LocalDate.of(2026, 3, 4), 14980d, 480d, "Concessionária GM", false, PrioridadeAlerta.BAIXA),
                new SeedRecord(5L, TipoManutencao.PREVENTIVA, StatusManutencao.CONCLUIDA, "Revisão dos 60.000 km e troca de pastilhas de freio.", LocalDate.of(2026, 2, 18), 60050d, 1320d, "Concessionária GM", false, PrioridadeAlerta.BAIXA),
                new SeedRecord(6L, TipoManutencao.CORRETIVA, StatusManutencao.CONCLUIDA, "Substituição da bateria após falha em partida fria.", LocalDate.of(2026, 3, 22), 27500d, 690d, "Baterias Express", false, PrioridadeAlerta.MEDIA),
                new SeedRecord(9L, TipoManutencao.CORRETIVA, StatusManutencao.CANCELADA, "Diagnóstico de falha geral no motor — viabilidade de reparo em análise.", LocalDate.of(2026, 1, 10), 141900d, 0d, "Mecânica Central LTDA", false, PrioridadeAlerta.ALTA),
                new SeedRecord(2L, TipoManutencao.PREVENTIVA, StatusManutencao.CONCLUIDA, "Alinhamento, balanceamento e rodízio de pneus.", LocalDate.of(2026, 4, 2), 8100d, 240d, "Pneus & Cia", false, PrioridadeAlerta.BAIXA),
                new SeedRecord(3L, TipoManutencao.PREVENTIVA, StatusManutencao.AGENDADA, "Revisão programada dos 45.000 km.", LocalDate.of(2026, 4, 25), 46900d, 560d, "Concessionária GM", false, PrioridadeAlerta.BAIXA),
                new SeedRecord(1L, TipoManutencao.PREVENTIVA, StatusManutencao.AGENDADA, "Revisão programada dos 60.000 km — fluido de freio e filtros.", LocalDate.of(2026, 6, 15), 60000d, null, null, false, PrioridadeAlerta.BAIXA));

        for (SeedRecord seed : seeds) {
            veiculoRepository.findById(seed.veiculoId).ifPresent(veiculo -> manutencaoRepository.save(buildManutencao(seed, veiculo)));
        }
    }

    private Manutencao buildManutencao(SeedRecord seed, Veiculo veiculo) {
        Manutencao manutencao = new Manutencao();
        manutencao.setVeiculo(veiculo);
        manutencao.setTipoManutencao(seed.tipo);
        manutencao.setStatus(seed.status);
        manutencao.setDescricaoProblema(seed.descricao);
        manutencao.setDataRealizada(seed.data);
        manutencao.setQuilometragemRegistro(seed.km);
        manutencao.setCustoTotal(seed.custo);
        manutencao.setOficinaExecutor(seed.oficina);
        manutencao.setEmergencia(seed.emergencia);
        manutencao.setPrioridade(seed.prioridade);
        return manutencao;
    }

    private record SeedRecord(
            Long veiculoId,
            TipoManutencao tipo,
            StatusManutencao status,
            String descricao,
            LocalDate data,
            Double km,
            Double custo,
            String oficina,
            boolean emergencia,
            PrioridadeAlerta prioridade) {}
}
