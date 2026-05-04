package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Usuario;Postman Logo
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);
}
