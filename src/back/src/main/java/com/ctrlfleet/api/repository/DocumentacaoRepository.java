package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Documentacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentacaoRepository extends JpaRepository<Documentacao, Long> {

    List<Documentacao> findByVeiculoIdOrderByIdAsc(Long veiculoId);

    Optional<Documentacao> findByIdAndVeiculoId(Long id, Long veiculoId);

    Optional<Documentacao> findByVeiculoIdAndTipoDocumento(Long veiculoId, String tipoDocumento);

    @Query(
            value =
                    "select setval(pg_get_serial_sequence('documentacao', 'id_documento'),"
                            + " (select coalesce(max(id_documento), 0) + 1 from documentacao), false)",
            nativeQuery = true)
    Long sincronizarSequenceId();
}
