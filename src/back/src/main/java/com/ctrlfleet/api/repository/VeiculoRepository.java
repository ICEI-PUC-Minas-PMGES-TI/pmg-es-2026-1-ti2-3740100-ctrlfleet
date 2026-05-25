package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.Veiculo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    Optional<Veiculo> findByPlaca(String placa);

    List<Veiculo> findByMotorista_IdOrderByPlacaAsc(Long motoristaId);

    List<Veiculo> findByMotorista_IdAndStatusOrderByPlacaAsc(Long motoristaId, StatusVeiculo status);

    int countByMotorista_Id(Long motoristaId);

    @Query(
            value =
                    "select setval(pg_get_serial_sequence('veiculos', 'id'),"
                            + " (select coalesce(max(id), 0) + 1 from veiculos), false)",
            nativeQuery = true)
    Long sincronizarSequenceId();
}
