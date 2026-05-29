package com.ctrlfleet.api.repository;

import com.ctrlfleet.api.domain.model.TipoInspecao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoInspecaoRepository extends JpaRepository<TipoInspecao, Long> {
    List<TipoInspecao> findByFaseOrderByIdAsc(String fase);
}
