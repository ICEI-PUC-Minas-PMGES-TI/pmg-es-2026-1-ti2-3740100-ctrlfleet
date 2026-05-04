package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.repository.VeiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VeiculoService {

    @Autowired
    private VeiculoRepository veiculoRepository;

    @Transactional
    public Veiculo salvar(Veiculo veiculo) {
        // Validação de placa única
        if (veiculoRepository.findByPlaca(veiculo.getPlaca()).isPresent()) {
            throw new RuntimeException("Já existe um veículo com esta placa.");
        }
        return veiculoRepository.save(veiculo);
    }
}