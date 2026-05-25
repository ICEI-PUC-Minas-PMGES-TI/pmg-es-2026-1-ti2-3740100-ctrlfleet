package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.motorista.MotoristaResumoDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoResponseDTO;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MotoristaFrotaService {

    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;

    public MotoristaFrotaService(UsuarioRepository usuarioRepository, VeiculoRepository veiculoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
    }

    @Transactional(readOnly = true)
    public List<MotoristaResumoDTO> listarAtivos() {
        return usuarioRepository.findByPapelAndStatusOrderByNomeAsc(PapelUsuario.ROLE_MOTORISTA, "ATIVO").stream()
                .map(usuario -> {
                    int total = veiculoRepository.countByMotorista_Id(usuario.getId());
                    return MotoristaResumoDTO.from(usuario, total);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VeiculoResponseDTO> listarVeiculosDoMotorista(Long motoristaId, boolean apenasDisponiveis) {
        validarMotoristaAtivo(motoristaId);

        List<Veiculo> veiculos = apenasDisponiveis
                ? veiculoRepository.findByMotorista_IdAndStatusOrderByPlacaAsc(motoristaId, StatusVeiculo.DISPONIVEL)
                : veiculoRepository.findByMotorista_IdOrderByPlacaAsc(motoristaId);

        return veiculos.stream().map(VeiculoResponseDTO::fromEntity).toList();
    }

    private void validarMotoristaAtivo(Long motoristaId) {
        Usuario motorista = usuarioRepository
                .findById(motoristaId)
                .orElseThrow(() -> new IllegalArgumentException("Motorista nao encontrado com id: " + motoristaId));

        if (motorista.getPapel() != PapelUsuario.ROLE_MOTORISTA) {
            throw new IllegalArgumentException("Usuario informado nao e motorista");
        }
        if (!"ATIVO".equalsIgnoreCase(motorista.getStatus())) {
            throw new IllegalArgumentException("Motorista precisa estar ativo para reserva");
        }
    }
}
