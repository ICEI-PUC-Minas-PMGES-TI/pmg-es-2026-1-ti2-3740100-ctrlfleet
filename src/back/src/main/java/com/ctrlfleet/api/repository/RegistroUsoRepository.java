package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.RegistroUso;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistroUsoRepository extends JpaRepository<RegistroUso, Long> {

    List<RegistroUso> findByVeiculoIdOrderByDataSaidaDesc(Long veiculoId);

    List<RegistroUso> findByMotoristaIdOrderByDataSaidaDesc(Long motoristaId);

    Optional<RegistroUso> findFirstByIdReservaAndDataRetornoIsNull(Long idReserva);

    Optional<RegistroUso> findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(Long idReserva, Long motoristaId);

    boolean existsByIdReservaAndDataRetornoIsNull(Long idReserva);

    @Query("""
            select max(coalesce(ru.quilometragemRetorno, ru.quilometragemSaida))
            from RegistroUso ru
            where ru.veiculo.id = :veiculoId
            """)
    Optional<Double> buscarUltimaQuilometragemVeiculo(@Param("veiculoId") Long veiculoId);
}
