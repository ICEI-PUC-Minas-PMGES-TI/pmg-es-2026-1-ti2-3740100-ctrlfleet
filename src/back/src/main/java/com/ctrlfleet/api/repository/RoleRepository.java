package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNome(String nome);
}
