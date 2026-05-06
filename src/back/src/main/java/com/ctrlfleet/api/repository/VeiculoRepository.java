package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
}
