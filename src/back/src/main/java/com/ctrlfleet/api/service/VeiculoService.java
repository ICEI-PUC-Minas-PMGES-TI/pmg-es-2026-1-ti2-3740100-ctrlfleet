package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.repository.VeiculoRepository;
<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Autowired;
=======
import java.util.List;
import org.springframework.data.domain.Sort;
>>>>>>> 8b9b9f01c412e9f7fea8bb088b2835eb369de4cd
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VeiculoService {

<<<<<<< HEAD
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
=======
    private final VeiculoRepository veiculoRepository;

    public VeiculoService(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
    }

    @Transactional(readOnly = true)
    public List<Veiculo> listarTodos() {
        return veiculoRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }
}
>>>>>>> 8b9b9f01c412e9f7fea8bb088b2835eb369de4cd
