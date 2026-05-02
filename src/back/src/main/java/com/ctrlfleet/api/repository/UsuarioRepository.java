package com.ctrlfleet.api.domain.repository;

import com.ctrlfleet.api.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
