package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManutencaoRepository extends JpaRepository<Manutencao, Long> {

    List<Manutencao> findAllByOrderByDataIdentificacaoDescIdDesc();

    List<Manutencao> findByVeiculo_Motorista_IdOrderByDataIdentificacaoDescIdDesc(Long motoristaId);

    List<Manutencao> findByMotorista_IdOrderByDataIdentificacaoDescIdDesc(Long motoristaId);

    List<Manutencao> findByVeiculo_Motorista_IdAndTipoManutencaoAndStatusOrderByDataRealizadaAsc(
            Long motoristaId, TipoManutencao tipoManutencao, StatusManutencao status);

    boolean existsByVeiculo_IdAndStatusInAndIdNot(
            Long veiculoId, Collection<StatusManutencao> statuses, Long manutencaoId);
}
