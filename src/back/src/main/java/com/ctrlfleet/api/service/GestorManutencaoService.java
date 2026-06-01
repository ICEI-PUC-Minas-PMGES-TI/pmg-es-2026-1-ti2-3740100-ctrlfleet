package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.manutencao.DecisaoManutencaoRequestDTO;
import com.ctrlfleet.api.dto.manutencao.GestorManutencaoPainelDTO;
import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import com.ctrlfleet.api.repository.ManutencaoRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GestorManutencaoService {

    private final ManutencaoRepository manutencaoRepository;
    private final RegistroUsoRepository registroUsoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public GestorManutencaoService(
            ManutencaoRepository manutencaoRepository,
            RegistroUsoRepository registroUsoRepository,
            UsuarioRepository usuarioRepository,
            AuditoriaService auditoriaService) {
        this.manutencaoRepository = manutencaoRepository;
        this.registroUsoRepository = registroUsoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public GestorManutencaoPainelDTO montarPainel() {
        List<Manutencao> registros = manutencaoRepository.findAllByOrderByDataIdentificacaoDescIdDesc();
        registros.forEach(this::garantirDataAberturaPersistida);
        Map<Long, Double> kmPorVeiculo = resolverQuilometragens(registros);

        GestorManutencaoPainelDTO painel = new GestorManutencaoPainelDTO();
        painel.setPendentes(filtrarPorStatus(registros, kmPorVeiculo, StatusManutencao.PENDENTE));
        painel.setAgendadas(filtrarPorStatus(registros, kmPorVeiculo, StatusManutencao.AGENDADA));
        painel.setEmAndamento(filtrarPorStatus(registros, kmPorVeiculo, StatusManutencao.EM_ANDAMENTO));
        painel.setHistorico(registros.stream()
                .filter(item -> item.getStatus() == StatusManutencao.CONCLUIDA
                        || item.getStatus() == StatusManutencao.CANCELADA
                        || item.getStatus() == StatusManutencao.REPROVADA)
                .sorted(Comparator.comparing(
                                Manutencao::getDataIdentificacao,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Manutencao::getId, Comparator.reverseOrder()))
                .limit(24)
                .map(item -> enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId())))
                .toList());
        return painel;
    }

    @Transactional(readOnly = true)
    public long contarPendentes() {
        return manutencaoRepository.countByStatus(StatusManutencao.PENDENTE);
    }

    @Transactional
    public ManutencaoResponseDTO aprovar(Long manutencaoId, DecisaoManutencaoRequestDTO dto) {
        Manutencao manutencao = buscarPendente(manutencaoId);

        if (dto != null && dto.getPrioridade() != null) {
            manutencao.setPrioridade(dto.getPrioridade());
        } else if (manutencao.getPrioridade() == null) {
            manutencao.setPrioridade(PrioridadeAlerta.MEDIA);
        }

        manutencao.setStatus(StatusManutencao.AGENDADA);
        Veiculo veiculo = manutencao.getVeiculo();
        if (veiculo.getStatus() != StatusVeiculo.DESATIVADO) {
            veiculo.setStatus(StatusVeiculo.MANUTENCAO);
        }

        registrarDecisao("MANUTENCAO_APROVADA", manutencao, dto, "Agendada", "success");
        return enriquecerDto(manutencao, manutencao.getQuilometragemRegistro());
    }

    @Transactional
    public ManutencaoResponseDTO definirPrioridade(Long manutencaoId, DecisaoManutencaoRequestDTO dto) {
        Manutencao manutencao = buscarPendente(manutencaoId);

        if (dto == null || dto.getPrioridade() == null) {
            throw new IllegalArgumentException("A prioridade é obrigatória.");
        }

        manutencao.setPrioridade(dto.getPrioridade());
        registrarDecisao("MANUTENCAO_PRIORIDADE", manutencao, dto, "Prioridade atualizada", "info");
        return enriquecerDto(
                manutencao,
                registroUsoRepository
                        .buscarUltimaQuilometragemVeiculo(manutencao.getVeiculo().getId())
                        .orElse(manutencao.getQuilometragemRegistro()));
    }

    @Transactional
    public ManutencaoResponseDTO reprovar(Long manutencaoId, DecisaoManutencaoRequestDTO dto) {
        Manutencao manutencao = buscarPendente(manutencaoId);

        if (dto == null || dto.getMotivo() == null || dto.getMotivo().isBlank()) {
            throw new IllegalArgumentException("A justificativa da reprovação é obrigatória.");
        }

        manutencao.setStatus(StatusManutencao.REPROVADA);
        registrarDecisao("MANUTENCAO_REPROVADA", manutencao, dto, "Reprovada", "warning");
        return enriquecerDto(manutencao, manutencao.getQuilometragemRegistro());
    }

    private Manutencao buscarPendente(Long manutencaoId) {
        Manutencao manutencao = manutencaoRepository
                .findById(manutencaoId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada com id: " + manutencaoId));
        if (manutencao.getStatus() != StatusManutencao.PENDENTE) {
            throw new IllegalArgumentException("Apenas solicitações pendentes podem receber decisão do gestor.");
        }
        return manutencao;
    }

    private List<ManutencaoResponseDTO> filtrarPorStatus(
            List<Manutencao> registros, Map<Long, Double> kmPorVeiculo, StatusManutencao status) {
        return registros.stream()
                .filter(item -> item.getStatus() == status)
                .sorted(Comparator.comparing(
                                Manutencao::getDataIdentificacao,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Manutencao::getId, Comparator.reverseOrder()))
                .map(item -> enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId())))
                .toList();
    }

    private Map<Long, Double> resolverQuilometragens(List<Manutencao> registros) {
        Set<Long> veiculoIds =
                registros.stream().map(item -> item.getVeiculo().getId()).collect(Collectors.toSet());
        Map<Long, Double> kmPorVeiculo = new LinkedHashMap<>();
        for (Long veiculoId : veiculoIds) {
            kmPorVeiculo.put(
                    veiculoId,
                    registroUsoRepository.buscarUltimaQuilometragemVeiculo(veiculoId).orElse(null));
        }
        return kmPorVeiculo;
    }

    private void garantirDataAberturaPersistida(Manutencao manutencao) {
        if (manutencao.getDataIdentificacao() != null) {
            return;
        }
        var abertura = ManutencaoResponseDTO.resolverDataAbertura(manutencao);
        if (abertura != null) {
            manutencao.setDataIdentificacao(abertura);
            manutencaoRepository.save(manutencao);
        }
    }

    private ManutencaoResponseDTO enriquecerDto(Manutencao manutencao, Double quilometragemAtual) {
        ManutencaoResponseDTO dto = ManutencaoResponseDTO.fromEntity(manutencao, quilometragemAtual);
        if (manutencao.getQuilometragemRegistro() != null && quilometragemAtual != null) {
            dto.setKmRestantes(manutencao.getQuilometragemRegistro() - quilometragemAtual);
        }
        ManutencaoResponseDTO.aplicarIndicadoresCalendario(dto);
        return dto;
    }

    private void registrarDecisao(
            String acao, Manutencao manutencao, DecisaoManutencaoRequestDTO dto, String status, String severidade) {
        String ator = "Gestor";
        if (dto != null && dto.getIdGestor() != null) {
            ator = usuarioRepository.findById(dto.getIdGestor()).map(Usuario::getNome).orElse(ator);
        }
        String motivo = dto == null || dto.getMotivo() == null || dto.getMotivo().isBlank()
                ? "Sem observações"
                : dto.getMotivo().trim();
        Veiculo veiculo = manutencao.getVeiculo();
        auditoriaService.registrar(
                acao,
                ator,
                veiculo.getPlaca(),
                status,
                severidade,
                manutencao.getPrioridade() != null ? manutencao.getPrioridade().name() : null,
                motivo);
    }
}
