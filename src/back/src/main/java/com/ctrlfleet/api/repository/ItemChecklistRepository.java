package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.ItemChecklist;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemChecklistRepository extends JpaRepository<ItemChecklist, Long> {
    List<ItemChecklist> findByTipoInspecaoIdOrderByIdAsc(Long tipoInspecaoId);

    List<ItemChecklist> findByIdIn(Collection<Long> ids);
}
