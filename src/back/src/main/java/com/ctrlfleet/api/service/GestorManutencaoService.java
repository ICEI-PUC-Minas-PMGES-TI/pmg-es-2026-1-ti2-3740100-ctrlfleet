package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.manutencao.AlertaResponseDTO;
import com.ctrlfleet.api.dto.manutencao.DecisaoManutencaoRequestDTO;
import com.ctrlfleet.api.dto.manutencao.GestorManutencaoPainelDTO;
import com.ctrlfleet.api.dto.manutencao.GestorPreventivaPainelDTO;
import com.ctrlfleet.api.dto.manutencao.GestorPreventivaResumoDTO;
import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import com.ctrlfleet.api.dto.manutencao.VeiculoParadoRevisaoDTO;
import com.ctrlfleet.api.repository.AlertaRepository;
import com.ctrlfleet.api.repository.ManutencaoRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
    private final VeiculoRepository veiculoRepository;
    private final AlertaRepository alertaRepository;
    private final AuditoriaService auditoriaService;

    public GestorManutencaoService(
            ManutencaoRepository manutencaoRepository,
            RegistroUsoRepository registroUsoRepository,
            UsuarioRepository usuarioRepository,
            VeiculoRepository veiculoRepository,
            AlertaRepository alertaRepository,
            AuditoriaService auditoriaService) {
        this.manutencaoRepository = manutencaoRepository;
        this.registroUsoRepository = registroUsoRepository;
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
        this.alertaRepository = alertaRepository;
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
    public GestorPreventivaPainelDTO montarPainelPreventiva() {
        List<Manutencao> preventivasAgendadas = manutencaoRepository
                .findByTipoManutencaoAndStatusOrderByDataRealizadaAscIdAsc(
                        TipoManutencao.PREVENTIVA, StatusManutencao.AGENDADA);
        preventivasAgendadas.forEach(this::garantirDataAberturaPersistida);

        List<Manutencao> emAndamento = manutencaoRepository.findByStatusOrderByDataIdentificacaoDescIdDesc(
                StatusManutencao.EM_ANDAMENTO);
        emAndamento.forEach(this::garantirDataAberturaPersistida);

        Map<Long, Double> kmPorVeiculo = resolverQuilometragensFrota(preventivasAgendadas, emAndamento);

        List<ManutencaoResponseDTO> preventivasProximas =
                ManutencaoPreventivaUtil.extrairPreventivasProximas(preventivasAgendadas, kmPorVeiculo);

        List<ManutencaoResponseDTO> preventivasAgendadasDto = preventivasAgendadas.stream()
                .map(item -> ManutencaoPreventivaUtil.enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId())))
                .toList();

        List<ManutencaoResponseDTO> emAndamentoDto = emAndamento.stream()
                .map(item -> ManutencaoPreventivaUtil.enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId())))
                .toList();

        List<VeiculoParadoRevisaoDTO> veiculosParados = montarVeiculosParadosRevisao(kmPorVeiculo);

        List<AlertaResponseDTO> alertasPreventivos = alertaRepository.findByLidoFalseOrderByDataGeracaoDesc().stream()
                .map(AlertaResponseDTO::fromEntity)
                .filter(AlertaResponseDTO::isPreventivo)
                .toList();

        GestorPreventivaResumoDTO resumo = new GestorPreventivaResumoDTO();
        resumo.setPreventivasProximas(preventivasProximas.size());
        resumo.setPreventivasAtrasadas(
                preventivasProximas.stream().filter(ManutencaoResponseDTO::isAtrasada).count());
        resumo.setPreventivasAgendadas(preventivasAgendadasDto.size());
        resumo.setVeiculosParados(veiculosParados.size());
        resumo.setEmAndamento(emAndamentoDto.size());
        resumo.setAlertasPreventivos(alertasPreventivos.size());

        GestorPreventivaPainelDTO painel = new GestorPreventivaPainelDTO();
        painel.setResumo(resumo);
        painel.setPreventivasProximas(preventivasProximas);
        painel.setPreventivasAgendadas(preventivasAgendadasDto);
        painel.setVeiculosParadosRevisao(veiculosParados);
        painel.setEmAndamento(emAndamentoDto);
        painel.setAlertasPreventivos(alertasPreventivos);
        return painel;
    }

    @Transactional
    public ManutencaoResponseDTO iniciar(Long manutencaoId, DecisaoManutencaoRequestDTO dto) {
        Manutencao manutencao = manutencaoRepository
                .findById(manutencaoId)
                .orElseThrow(() -> new IllegalArgumentException("Manutenção não encontrada com id: " + manutencaoId));
        if (manutencao.getStatus() != StatusManutencao.AGENDADA) {
            throw new IllegalArgumentException("Apenas manutenções agendadas podem ser iniciadas.");
        }

        manutencao.setStatus(StatusManutencao.EM_ANDAMENTO);
        Veiculo veiculo = manutencao.getVeiculo();
        if (veiculo.getStatus() != StatusVeiculo.DESATIVADO) {
            veiculo.setStatus(StatusVeiculo.MANUTENCAO);
        }

        registrarDecisao("MANUTENCAO_INICIADA", manutencao, dto, "Em andamento", "info");
        Double km = registroUsoRepository
                .buscarUltimaQuilometragemVeiculo(veiculo.getId())
                .orElse(manutencao.getQuilometragemRegistro());
        return ManutencaoPreventivaUtil.enriquecerDto(manutencao, km);
    }

    @Transactional
    public ManutencaoResponseDTO concluir(Long manutencaoId, DecisaoManutencaoRequestDTO dto) {
        Manutencao manutencao = manutencaoRepository
                .findById(manutencaoId)
                .orElseThrow(() -> new IllegalArgumentException("Manutenção não encontrada com id: " + manutencaoId));
        if (manutencao.getStatus() != StatusManutencao.EM_ANDAMENTO) {
            throw new IllegalArgumentException("Apenas manutenções em andamento podem ser concluídas.");
        }

        manutencao.setStatus(StatusManutencao.CONCLUIDA);
        if (manutencao.getDataRealizada() == null) {
            manutencao.setDataRealizada(LocalDate.now());
        }

        Veiculo veiculo = manutencao.getVeiculo();
        if (veiculo.getStatus() == StatusVeiculo.MANUTENCAO) {
            veiculo.setStatus(StatusVeiculo.DISPONIVEL);
        }

        registrarDecisao("MANUTENCAO_CONCLUIDA", manutencao, dto, "Concluída", "success");
        Double km = registroUsoRepository
                .buscarUltimaQuilometragemVeiculo(veiculo.getId())
                .orElse(manutencao.getQuilometragemRegistro());
        return ManutencaoPreventivaUtil.enriquecerDto(manutencao, km);
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
        return ManutencaoPreventivaUtil.enriquecerDto(manutencao, quilometragemAtual);
    }

    private Map<Long, Double> resolverQuilometragensFrota(
            List<Manutencao> preventivasAgendadas, List<Manutencao> emAndamento) {
        Set<Long> veiculoIds = preventivasAgendadas.stream()
                .map(item -> item.getVeiculo().getId())
                .collect(Collectors.toSet());
        emAndamento.stream().map(item -> item.getVeiculo().getId()).forEach(veiculoIds::add);
        veiculoRepository.findByStatusOrderByPlacaAsc(StatusVeiculo.MANUTENCAO).stream()
                .map(Veiculo::getId)
                .forEach(veiculoIds::add);

        Map<Long, Double> kmPorVeiculo = new LinkedHashMap<>();
        for (Long veiculoId : veiculoIds) {
            kmPorVeiculo.put(
                    veiculoId,
                    registroUsoRepository.buscarUltimaQuilometragemVeiculo(veiculoId).orElse(null));
        }
        return kmPorVeiculo;
    }

    private List<VeiculoParadoRevisaoDTO> montarVeiculosParadosRevisao(Map<Long, Double> kmPorVeiculo) {
        List<Veiculo> parados = veiculoRepository.findByStatusOrderByPlacaAsc(StatusVeiculo.MANUTENCAO);
        LocalDate hoje = LocalDate.now();

        return parados.stream()
                .map(veiculo -> {
                    VeiculoParadoRevisaoDTO dto = new VeiculoParadoRevisaoDTO();
                    dto.setIdVeiculo(veiculo.getId());
                    dto.setPlaca(veiculo.getPlaca());
                    dto.setMarca(veiculo.getMarca());
                    dto.setModelo(veiculo.getModelo());
                    dto.setStatusVeiculo(veiculo.getStatus());
                    if (veiculo.getMotorista() != null) {
                        dto.setNomeMotorista(veiculo.getMotorista().getNome());
                    }

                    Manutencao manutencaoAtiva = manutencaoRepository
                            .findByVeiculo_IdAndStatusInOrderByDataIdentificacaoDescIdDesc(
                                    veiculo.getId(),
                                    List.of(StatusManutencao.EM_ANDAMENTO, StatusManutencao.AGENDADA))
                            .stream()
                            .findFirst()
                            .orElse(null);

                    if (manutencaoAtiva != null) {
                        Double km = kmPorVeiculo.computeIfAbsent(
                                veiculo.getId(),
                                id -> registroUsoRepository
                                        .buscarUltimaQuilometragemVeiculo(id)
                                        .orElse(null));
                        dto.setManutencaoAtiva(ManutencaoPreventivaUtil.enriquecerDto(manutencaoAtiva, km));
                        dto.setMotivoParada(resolverMotivoParada(manutencaoAtiva));
                        LocalDateTime abertura = ManutencaoResponseDTO.resolverDataAbertura(manutencaoAtiva);
                        if (abertura != null) {
                            dto.setDiasParado((int) ChronoUnit.DAYS.between(abertura.toLocalDate(), hoje));
                        }
                    } else {
                        dto.setMotivoParada("Veículo indisponível para revisão");
                    }

                    return dto;
                })
                .sorted(Comparator.comparing(
                                VeiculoParadoRevisaoDTO::getDiasParado, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(VeiculoParadoRevisaoDTO::getPlaca))
                .toList();
    }

    private String resolverMotivoParada(Manutencao manutencao) {
        if (manutencao.getStatus() == StatusManutencao.EM_ANDAMENTO) {
            return manutencao.getTipoManutencao() == TipoManutencao.PREVENTIVA
                    ? "Preventiva em execução na oficina"
                    : "Corretiva em execução na oficina";
        }
        return manutencao.getTipoManutencao() == TipoManutencao.PREVENTIVA
                ? "Aguardando início da preventiva agendada"
                : "Aguardando início da manutenção agendada";
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
