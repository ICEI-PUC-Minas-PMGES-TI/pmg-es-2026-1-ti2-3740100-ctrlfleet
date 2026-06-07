package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManutencaoRepository extends JpaRepository<Manutencao, Long> {

    List<Manutencao> findByVeiculo_Motorista_IdOrderByDataIdentificacaoDescIdDesc(Long motoristaId);

    List<Manutencao> findByMotorista_IdOrderByDataIdentificacaoDescIdDesc(Long motoristaId);

    List<Manutencao> findByVeiculo_Motorista_IdAndTipoManutencaoAndStatusOrderByDataRealizadaAsc(
            Long motoristaId, TipoManutencao tipoManutencao, StatusManutencao status);

    List<Manutencao> findAllByOrderByDataIdentificacaoDescIdDesc();

    List<Manutencao> findByTipoManutencaoAndStatusOrderByDataRealizadaAscIdAsc(
            TipoManutencao tipoManutencao, StatusManutencao status);

    List<Manutencao> findByStatusOrderByDataIdentificacaoDescIdDesc(StatusManutencao status);

    List<Manutencao> findByVeiculo_IdAndStatusInOrderByDataIdentificacaoDescIdDesc(
            Long veiculoId, List<StatusManutencao> statuses);

    long countByStatus(StatusManutencao status);
}
