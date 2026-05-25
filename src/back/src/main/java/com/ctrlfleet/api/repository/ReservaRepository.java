package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.enums.StatusReserva;
import com.ctrlfleet.api.domain.model.Reserva;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findAllByOrderByDataHoraInicioPrevistaDesc();

    List<Reserva> findByStatusReservaOrderByDataHoraInicioPrevistaDesc(StatusReserva statusReserva);

    List<Reserva> findByUsuario_IdOrderByDataHoraInicioPrevistaDesc(Long usuarioId);

    List<Reserva> findByUsuario_IdAndStatusReservaOrderByDataHoraInicioPrevistaDesc(
            Long usuarioId, StatusReserva statusReserva);

    @Query("""
            select r
            from Reserva r
            where r.statusReserva = :status
              and (
                not exists (
                  select 1 from RegistroUso ru
                  where ru.idReserva = r.id and ru.dataRetorno is null
                )
                or exists (
                  select 1 from RegistroUso ru
                  where ru.idReserva = r.id
                    and ru.motorista.id = :motoristaId
                    and ru.dataRetorno is null
                )
              )
            order by r.dataHoraInicioPrevista asc
            """)
    List<Reserva> listarAprovadasDisponiveisParaMotorista(
            @Param("motoristaId") Long motoristaId, @Param("status") StatusReserva status);

    @Query("""
            select r
            from Reserva r
            where r.statusReserva = :status
              and exists (
                select 1 from RegistroUso ru
                where ru.idReserva = r.id
                  and ru.motorista.id = :motoristaId
                  and ru.dataRetorno is null
              )
            order by r.dataHoraInicioPrevista asc
            """)
    List<Reserva> listarEmUsoPorMotorista(
            @Param("motoristaId") Long motoristaId, @Param("status") StatusReserva status);
}
