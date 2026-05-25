package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.CarroChecklist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarroChecklistRepository extends JpaRepository<CarroChecklist, Long> {
    boolean existsByRegistroUsoIdAndItemId(Long registroUsoId, Long itemId);
}
