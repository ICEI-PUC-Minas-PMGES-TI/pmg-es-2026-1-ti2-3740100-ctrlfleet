package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Veiculo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    Optional<Veiculo> findByPlaca(String placa);
}
