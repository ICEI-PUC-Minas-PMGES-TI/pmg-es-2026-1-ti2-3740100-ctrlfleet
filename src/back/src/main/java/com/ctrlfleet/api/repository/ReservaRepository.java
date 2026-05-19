package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Reserva;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query(
            """
            SELECT r
            FROM Reserva r
            JOIN FETCH r.usuario
            JOIN FETCH r.veiculo
            LEFT JOIN FETCH r.motorista
            ORDER BY r.datahoraSolicitacao DESC, r.id DESC
            """)
    List<Reserva> findAllDetailedOrderBySolicitacaoDesc();
}
