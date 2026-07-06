package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.RegistroChecklistTipo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroChecklistTipoRepository extends JpaRepository<RegistroChecklistTipo, Long> {
    boolean existsByRegistroUsoIdAndTipoInspecaoId(Long registroUsoId, Long tipoInspecaoId);
}
