package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.CarroChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CarroChecklistRepository extends JpaRepository<CarroChecklist, Long> {
    boolean existsByRegistroUsoIdAndItemId(Long registroUsoId, Long itemId);

    long countByRegistroUsoId(Long registroUsoId);

    @Query(
            """
            SELECT COUNT(cc) FROM CarroChecklist cc
            JOIN cc.item i
            WHERE cc.registroUso.id = :registroUsoId AND i.tipoInspecao.id = :tipoInspecaoId
            """)
    long countByRegistroUsoIdAndTipoInspecaoId(
            @Param("registroUsoId") Long registroUsoId, @Param("tipoInspecaoId") Long tipoInspecaoId);
}
