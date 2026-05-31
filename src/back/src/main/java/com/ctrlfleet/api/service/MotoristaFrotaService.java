package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.motorista.MotoristaResumoDTO;
import com.ctrlfleet.api.dto.veiculo.DocumentacaoResponseDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoResponseDTO;
import com.ctrlfleet.api.repository.DocumentacaoRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MotoristaFrotaService {

    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;
    private final DocumentacaoRepository documentacaoRepository;
    private final RegistroUsoRepository registroUsoRepository;

    public MotoristaFrotaService(
            UsuarioRepository usuarioRepository,
            VeiculoRepository veiculoRepository,
            DocumentacaoRepository documentacaoRepository,
            RegistroUsoRepository registroUsoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
        this.documentacaoRepository = documentacaoRepository;
        this.registroUsoRepository = registroUsoRepository;
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

        return veiculos.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public VeiculoResponseDTO buscarVeiculoDoMotorista(Long motoristaId, Long veiculoId) {
        validarMotoristaAtivo(motoristaId);

        Veiculo veiculo = veiculoRepository
                .findByIdAndMotorista_Id(veiculoId, motoristaId)
                .orElseThrow(() -> new IllegalArgumentException("Veiculo nao vinculado ao motorista informado"));

        return toResponse(veiculo);
    }

    private VeiculoResponseDTO toResponse(Veiculo veiculo) {
        List<DocumentacaoResponseDTO> documentos =
                documentacaoRepository.findByVeiculoIdOrderByIdAsc(veiculo.getId()).stream()
                        .map(DocumentacaoResponseDTO::fromEntity)
                        .toList();
        VeiculoResponseDTO dto = VeiculoResponseDTO.fromEntity(veiculo, documentos);
        registroUsoRepository
                .buscarUltimaQuilometragemVeiculo(veiculo.getId())
                .ifPresent(dto::setQuilometragemAtual);
        return dto;
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
