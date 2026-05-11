package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;

    public VeiculoService(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
    }

    @Transactional(readOnly = true)
    public List<Veiculo> listarTodos() {
        return veiculoRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }
}
