package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Alerta;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.manutencao.AlertaResponseDTO;
import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import com.ctrlfleet.api.dto.manutencao.MotoristaManutencaoPainelDTO;
import com.ctrlfleet.api.dto.manutencao.SolicitarManutencaoRequestDTO;
import com.ctrlfleet.api.repository.AlertaRepository;
import com.ctrlfleet.api.repository.ManutencaoRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MotoristaManutencaoService {

    private static final int PREVENTIVE_DAYS_THRESHOLD = 45;
    private static final double PREVENTIVE_KM_THRESHOLD = 2000d;

    private final ManutencaoRepository manutencaoRepository;
    private final AlertaRepository alertaRepository;
    private final VeiculoRepository veiculoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RegistroUsoRepository registroUsoRepository;
    private final AuditoriaService auditoriaService;

    public MotoristaManutencaoService(
            ManutencaoRepository manutencaoRepository,
            AlertaRepository alertaRepository,
            VeiculoRepository veiculoRepository,
            UsuarioRepository usuarioRepository,
            RegistroUsoRepository registroUsoRepository,
            AuditoriaService auditoriaService) {
        this.manutencaoRepository = manutencaoRepository;
        this.alertaRepository = alertaRepository;
        this.veiculoRepository = veiculoRepository;
        this.usuarioRepository = usuarioRepository;
        this.registroUsoRepository = registroUsoRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public MotoristaManutencaoPainelDTO montarPainel(Long motoristaId) {
        validarMotoristaAtivo(motoristaId);

        List<Manutencao> registros =
                manutencaoRepository.findByVeiculo_Motorista_IdOrderByDataIdentificacaoDescIdDesc(motoristaId);
        registros.forEach(this::garantirDataAberturaPersistida);
        Map<Long, Double> kmPorVeiculo = resolverQuilometragens(registros);

        MotoristaManutencaoPainelDTO painel = new MotoristaManutencaoPainelDTO();
        painel.setPreventivasProximas(extrairPreventivasProximas(registros, kmPorVeiculo));
        painel.setAlertasPreventivos(extrairAlertasPreventivos(motoristaId));
        painel.setSolicitacoes(filtrarPorStatus(registros, kmPorVeiculo, StatusManutencao.PENDENTE));
        painel.setEmAndamento(filtrarPorStatus(registros, kmPorVeiculo, StatusManutencao.EM_ANDAMENTO));
        painel.setHistorico(
                registros.stream()
                        .filter(item -> item.getStatus() == StatusManutencao.CONCLUIDA
                                || item.getStatus() == StatusManutencao.CANCELADA
                                || item.getStatus() == StatusManutencao.REPROVADA)
                        .sorted(Comparator.comparing(
                                        Manutencao::getDataIdentificacao,
                                        Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(Manutencao::getId, Comparator.reverseOrder()))
                        .limit(12)
                        .map(item -> enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId())))
                        .toList());
        return painel;
    }

    @Transactional
    public ManutencaoResponseDTO solicitarManutencao(Long motoristaId, SolicitarManutencaoRequestDTO request) {
        Usuario motorista = validarMotoristaAtivo(motoristaId);
        Veiculo veiculo = veiculoRepository
                .findByIdAndMotorista_Id(request.getIdVeiculo(), motoristaId)
                .orElseThrow(() -> new IllegalArgumentException("Veículo não vinculado ao seu perfil."));

        String descricao = request.getDescricaoProblema().trim();
        if (descricao.length() < 15) {
            throw new IllegalArgumentException("Descreva o problema com pelo menos 15 caracteres.");
        }

        Manutencao manutencao = new Manutencao();
        manutencao.setVeiculo(veiculo);
        manutencao.setMotorista(motorista);
        manutencao.setTipoManutencao(TipoManutencao.CORRETIVA);
        manutencao.setDescricaoProblema(descricao);
        manutencao.setQuilometragemRegistro(request.getQuilometragemAtual());
        manutencao.setStatus(StatusManutencao.PENDENTE);
        manutencao.setDataIdentificacao(LocalDateTime.now());
        manutencao.setEmergencia(request.isEmergencia());
        manutencao.setPrioridade(request.isEmergencia() ? PrioridadeAlerta.CRITICA : PrioridadeAlerta.ALTA);

        Manutencao salva = manutencaoRepository.save(manutencao);

        Alerta alerta = new Alerta();
        alerta.setVeiculo(veiculo);
        alerta.setPrioridade(manutencao.getPrioridade());
        alerta.setMensagem(request.isEmergencia()
                ? "Solicitação de manutenção de emergência — " + veiculo.getPlaca() + ": " + resumir(descricao)
                : "Nova solicitação corretiva — " + veiculo.getPlaca() + ": " + resumir(descricao));
        alerta.setDataGeracao(LocalDateTime.now());
        alerta.setLido(false);
        alertaRepository.save(alerta);

        auditoriaService.registrar(
                "SOLICITAR_MANUTENCAO",
                motorista.getNome(),
                veiculo.getPlaca(),
                "PENDENTE",
                request.isEmergencia() ? "CRITICA" : "ALTA",
                null,
                descricao);

        return enriquecerDto(salva, request.getQuilometragemAtual());
    }

    private List<ManutencaoResponseDTO> extrairPreventivasProximas(
            List<Manutencao> registros, Map<Long, Double> kmPorVeiculo) {
        LocalDate hoje = LocalDate.now();
        Map<Long, ManutencaoResponseDTO> deduplicado = new LinkedHashMap<>();

        registros.stream()
                .filter(item -> item.getTipoManutencao() == TipoManutencao.PREVENTIVA
                        && item.getStatus() == StatusManutencao.AGENDADA)
                .sorted(Comparator.comparing(Manutencao::getDataRealizada, Comparator.nullsLast(Comparator.naturalOrder())))
                .forEach(item -> {
                    ManutencaoResponseDTO dto = enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId()));
                    if (!isPreventivaProxima(dto, hoje)) return;
                    deduplicado.putIfAbsent(item.getVeiculo().getId(), dto);
                });

        return deduplicado.values().stream()
                .sorted(Comparator.comparing(ManutencaoResponseDTO::getDiasRestantes, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(ManutencaoResponseDTO::getKmRestantes, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private List<AlertaResponseDTO> extrairAlertasPreventivos(Long motoristaId) {
        return alertaRepository.findByVeiculo_Motorista_IdAndLidoFalseOrderByDataGeracaoDesc(motoristaId).stream()
                .map(AlertaResponseDTO::fromEntity)
                .filter(AlertaResponseDTO::isPreventivo)
                .toList();
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
        Set<Long> veiculoIds = registros.stream()
                .map(item -> item.getVeiculo().getId())
                .collect(Collectors.toSet());
        Map<Long, Double> kmPorVeiculo = new LinkedHashMap<>();
        for (Long veiculoId : veiculoIds) {
            kmPorVeiculo.put(
                    veiculoId,
                    registroUsoRepository.buscarUltimaQuilometragemVeiculo(veiculoId).orElse(null));
        }
        return kmPorVeiculo;
    }

    private ManutencaoResponseDTO enriquecerDto(Manutencao manutencao, Double quilometragemAtual) {
        ManutencaoResponseDTO dto = ManutencaoResponseDTO.fromEntity(manutencao, quilometragemAtual);
        if (manutencao.getQuilometragemRegistro() != null && quilometragemAtual != null) {
            dto.setKmRestantes(manutencao.getQuilometragemRegistro() - quilometragemAtual);
        }
        ManutencaoResponseDTO.aplicarIndicadoresCalendario(dto);
        return dto;
    }

    private boolean isPreventivaProxima(ManutencaoResponseDTO dto, LocalDate hoje) {
        if (ManutencaoResponseDTO.calcularPreventivaAtrasada(dto)) {
            return true;
        }
        boolean porData = dto.getDataAgendada() != null
                && !dto.getDataAgendada().isBefore(hoje.minusDays(7))
                && !dto.getDataAgendada().isAfter(hoje.plusDays(PREVENTIVE_DAYS_THRESHOLD));
        boolean porKm = dto.getKmRestantes() != null && dto.getKmRestantes() <= PREVENTIVE_KM_THRESHOLD;
        return porData || porKm;
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

    private Usuario validarMotoristaAtivo(Long motoristaId) {
        Usuario motorista = usuarioRepository
                .findById(motoristaId)
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado com id: " + motoristaId));

        if (motorista.getPapel() != PapelUsuario.ROLE_MOTORISTA) {
            throw new IllegalArgumentException("Usuário informado não é motorista.");
        }
        if (!"ATIVO".equalsIgnoreCase(motorista.getStatus())) {
            throw new IllegalArgumentException("Motorista precisa estar ativo.");
        }
        return motorista;
    }

    private String resumir(String descricao) {
        String texto = descricao.trim();
        return texto.length() <= 120 ? texto : texto.substring(0, 117) + "...";
    }
}
