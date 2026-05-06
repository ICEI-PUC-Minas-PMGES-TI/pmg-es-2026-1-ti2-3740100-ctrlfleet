package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.RegistroUso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroUsoRepository extends JpaRepository<RegistroUso, Long> {

    List<RegistroUso> findByVeiculoIdOrderByDataSaidaDesc(Long veiculoId);
}
