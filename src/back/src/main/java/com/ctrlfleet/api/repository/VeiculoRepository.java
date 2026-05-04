package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    Optional<Veiculo> findByPlaca(String placa);

    boolean existsByPlacaAndIdNot(String placa, Long id);

    @Query("SELECT v FROM Veiculo v WHERE v.status <> 'DESATIVADO'")
    List<Veiculo> findAllAtivos();
}