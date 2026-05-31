package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Alerta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    List<Alerta> findByVeiculo_Motorista_IdAndLidoFalseOrderByDataGeracaoDesc(Long motoristaId);
}
