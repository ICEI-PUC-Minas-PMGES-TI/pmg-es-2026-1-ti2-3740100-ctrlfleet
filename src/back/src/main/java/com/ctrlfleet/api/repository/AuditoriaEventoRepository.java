package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.AuditoriaEvento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditoriaEventoRepository extends JpaRepository<AuditoriaEvento, Long> {

    @Query("""
        SELECT e FROM AuditoriaEvento e
        WHERE (:acao IS NULL OR LOWER(e.acao) LIKE LOWER(CONCAT('%', :acao, '%')))
          AND (:severidade IS NULL OR e.severidade = :severidade)
          AND (:ator IS NULL OR LOWER(e.ator) LIKE LOWER(CONCAT('%', :ator, '%')))
        ORDER BY e.criadoEm DESC
    """)
    List<AuditoriaEvento> filtrar(
        @Param("acao") String acao,
        @Param("severidade") String severidade,
        @Param("ator") String ator
    );
}