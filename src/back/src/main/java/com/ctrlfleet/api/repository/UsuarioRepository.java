package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.model.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    @Query("SELECT DISTINCT u FROM Usuario u LEFT JOIN FETCH u.motorista ORDER BY u.id")
    List<Usuario> findAllWithMotorista();

    @Query(
            "SELECT u FROM Usuario u LEFT JOIN FETCH u.motorista WHERE u.papel = :papel AND u.status = :status ORDER BY u.nome")
    List<Usuario> findByPapelAndStatusOrderByNomeAsc(
            @Param("papel") PapelUsuario papel, @Param("status") String status);
}
