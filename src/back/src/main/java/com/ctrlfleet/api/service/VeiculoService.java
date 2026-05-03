package com.ctrlfleet.api.service;

import com.ctrlfleet.api.Veiculo;
import com.ctrlfleet.api.dto.VeiculoEditDTO;
import com.ctrlfleet.api.dto.VeiculoResponseDTO;
import com.ctrlfleet.api.exception.RecursoNaoEncontradoException;
import com.ctrlfleet.api.exception.RegraDeNegocioException;
import com.ctrlfleet.api.repository.VeiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VeiculoService {

    private final VeiculoRepository repository;

    public VeiculoService(VeiculoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public VeiculoResponseDTO buscarPorId(Long id) {
        Veiculo veiculo = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Veículo com ID " + id + " não encontrado."));
        return toResponse(veiculo);
    }

    @Transactional
    public VeiculoResponseDTO editar(Long id, VeiculoEditDTO dto) {
        Veiculo veiculo = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Veículo com ID " + id + " não encontrado."));

        String placaNova = dto.getPlaca().toUpperCase().trim();
        if (!veiculo.getPlaca().equalsIgnoreCase(placaNova)) {
            if (repository.existsByPlacaAndIdNot(placaNova, id)) {
                throw new RegraDeNegocioException(
                        "Já existe um veículo cadastrado com a placa '" + placaNova + "'.");
            }
        }

        veiculo.setPlaca(placaNova);
        veiculo.setModelo(dto.getModelo());
        veiculo.setMarca(dto.getMarca());
        veiculo.setAno(dto.getAno());
        veiculo.setStatus(dto.getStatus());

        Veiculo salvo = repository.save(veiculo);
        return toResponse(salvo);
    }

    private VeiculoResponseDTO toResponse(Veiculo v) {
        return new VeiculoResponseDTO(
                v.getId(),
                v.getPlaca(),
                v.getModelo(),
                v.getMarca(),
                v.getAno(),
                v.getStatus()
        );
    }
}