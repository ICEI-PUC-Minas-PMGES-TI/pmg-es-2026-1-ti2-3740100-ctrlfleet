package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
    Optional<Veiculo> findByPlaca(String placa);
}
=======

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {
}
>>>>>>> 8b9b9f01c412e9f7fea8bb088b2835eb369de4cd
