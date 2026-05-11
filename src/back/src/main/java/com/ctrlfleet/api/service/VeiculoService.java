package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Documentacao;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.veiculo.DocumentacaoRequestDTO;
import com.ctrlfleet.api.dto.veiculo.DocumentacaoResponseDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoRequestDTO;
import com.ctrlfleet.api.dto.veiculo.VeiculoResponseDTO;
import com.ctrlfleet.api.repository.DocumentacaoRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;
    private final DocumentacaoRepository documentacaoRepository;

    public VeiculoService(VeiculoRepository veiculoRepository, DocumentacaoRepository documentacaoRepository) {
        this.veiculoRepository = veiculoRepository;
        this.documentacaoRepository = documentacaoRepository;
    }

    @Transactional(readOnly = true)
    public List<VeiculoResponseDTO> listarTodos() {
        return veiculoRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VeiculoResponseDTO buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public VeiculoResponseDTO salvar(VeiculoRequestDTO dto) {
        String placa = dto.getPlaca() == null ? "" : dto.getPlaca().trim().toUpperCase();
        if (placa.isBlank()) {
            throw new IllegalArgumentException("Placa e obrigatoria");
        }

        if (veiculoRepository.findByPlaca(placa).isPresent()) {
            throw new IllegalArgumentException("Ja existe um veiculo com esta placa.");
        }

        veiculoRepository.sincronizarSequenceId();

        Veiculo veiculo = new Veiculo();
        veiculo.setPlaca(placa);
        veiculo.setMarca(dto.getMarca().trim());
        veiculo.setModelo(dto.getModelo().trim());
        veiculo.setSecretaria(dto.getSecretaria().trim());
        veiculo.setAno(dto.getAno());
        if (dto.getStatus() != null) {
            veiculo.setStatus(dto.getStatus());
        }

        Veiculo salvo = veiculoRepository.save(veiculo);
        if (dto.getDocumentos() != null) {
            dto.getDocumentos().forEach(documento -> salvarDocumento(salvo, documento));
        }

        return toResponse(salvo);
    }

    @Transactional
    public VeiculoResponseDTO atualizar(Long id, VeiculoRequestDTO dto) {
        Veiculo veiculo = buscarEntidade(id);
        String placa = dto.getPlaca() == null ? "" : dto.getPlaca().trim().toUpperCase();
        if (placa.isBlank()) {
            throw new IllegalArgumentException("Placa e obrigatoria");
        }

        veiculoRepository
                .findByPlaca(placa)
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(
                        existente -> {
                            throw new IllegalArgumentException("Ja existe um veiculo com esta placa.");
                        });

        veiculo.setPlaca(placa);
        veiculo.setMarca(dto.getMarca().trim());
        veiculo.setModelo(dto.getModelo().trim());
        veiculo.setSecretaria(dto.getSecretaria().trim());
        veiculo.setAno(dto.getAno());
        if (dto.getStatus() != null) {
            veiculo.setStatus(dto.getStatus());
        }

        Veiculo salvo = veiculoRepository.save(veiculo);
        if (dto.getDocumentos() != null) {
            dto.getDocumentos().forEach(documento -> salvarOuAtualizarDocumento(salvo, documento));
        }

        return toResponse(salvo);
    }

    @Transactional
    public VeiculoResponseDTO desativar(Long id) {
        Veiculo veiculo = buscarEntidade(id);
        preencherSecretariaPadraoSeNecessario(veiculo);
        veiculo.setStatus(com.ctrlfleet.api.domain.enums.StatusVeiculo.DESATIVADO);
        return toResponse(veiculoRepository.save(veiculo));
    }

    @Transactional
    public DocumentacaoResponseDTO cadastrarDocumentacao(Long veiculoId, DocumentacaoRequestDTO dto) {
        return DocumentacaoResponseDTO.fromEntity(salvarDocumento(buscarEntidade(veiculoId), dto));
    }

    @Transactional
    public DocumentacaoResponseDTO editarDocumentacao(Long veiculoId, Long documentoId, DocumentacaoRequestDTO dto) {
        buscarEntidade(veiculoId);
        var documentacao = documentacaoRepository
                .findByIdAndVeiculoId(documentoId, veiculoId)
                .orElseThrow(() -> new IllegalArgumentException("Documentacao nao encontrada"));

        aplicarDadosDocumento(documentacao, dto);
        return DocumentacaoResponseDTO.fromEntity(documentacaoRepository.save(documentacao));
    }

    private Veiculo buscarEntidade(Long id) {
        return veiculoRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veiculo nao encontrado"));
    }

    private Documentacao salvarDocumento(Veiculo veiculo, DocumentacaoRequestDTO dto) {
        var documentacao = new Documentacao();
        documentacao.setVeiculo(veiculo);
        aplicarDadosDocumento(documentacao, dto);
        documentacaoRepository.sincronizarSequenceId();
        return documentacaoRepository.save(documentacao);
    }

    private Documentacao salvarOuAtualizarDocumento(Veiculo veiculo, DocumentacaoRequestDTO dto) {
        String tipoDocumento = dto.getTipoDocumento().trim().toUpperCase();
        var documentacao =
                documentacaoRepository
                        .findByVeiculoIdAndTipoDocumento(veiculo.getId(), tipoDocumento)
                        .orElseGet(
                                () -> {
                                    var novo = new Documentacao();
                                    novo.setVeiculo(veiculo);
                                    return novo;
                                });
        aplicarDadosDocumento(documentacao, dto);
        if (documentacao.getId() == null) {
            documentacaoRepository.sincronizarSequenceId();
        }
        return documentacaoRepository.save(documentacao);
    }

    private void aplicarDadosDocumento(Documentacao documentacao, DocumentacaoRequestDTO dto) {
        documentacao.setTipoDocumento(dto.getTipoDocumento().trim().toUpperCase());
        documentacao.setDataVencimento(dto.getDataVencimento());
        documentacao.setValorPago(dto.getValorPago());
        documentacao.setStatusPagamento(
                dto.getStatusPagamento() == null || dto.getStatusPagamento().isBlank()
                        ? "PENDENTE"
                        : dto.getStatusPagamento().trim().toUpperCase());
    }

    private void preencherSecretariaPadraoSeNecessario(Veiculo veiculo) {
        if (veiculo.getSecretaria() == null || veiculo.getSecretaria().isBlank()) {
            veiculo.setSecretaria("Garagem Central");
        }
    }

    private VeiculoResponseDTO toResponse(Veiculo veiculo) {
        List<DocumentacaoResponseDTO> documentos =
                documentacaoRepository.findByVeiculoIdOrderByIdAsc(veiculo.getId()).stream()
                        .map(DocumentacaoResponseDTO::fromEntity)
                        .toList();
        return VeiculoResponseDTO.fromEntity(veiculo, documentos);
    }
}
