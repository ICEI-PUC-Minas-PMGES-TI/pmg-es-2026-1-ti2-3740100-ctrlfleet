package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Alerta;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.manutencao.AlertaResponseDTO;
import com.ctrlfleet.api.dto.manutencao.ConcluirManutencaoRequestDTO;
import com.ctrlfleet.api.dto.manutencao.EncaminharOficinaRequestDTO;
import com.ctrlfleet.api.dto.manutencao.ManutencaoResponseDTO;
import com.ctrlfleet.api.dto.manutencao.MotoristaManutencaoPainelDTO;
import com.ctrlfleet.api.dto.manutencao.SolicitarManutencaoRequestDTO;
import com.ctrlfleet.api.repository.AlertaRepository;
import com.ctrlfleet.api.repository.ManutencaoRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MotoristaManutencaoService {

    private static final int PREVENTIVE_DAYS_THRESHOLD = 45;
    private static final double PREVENTIVE_KM_THRESHOLD = 2000d;
    private static final List<StatusManutencao> STATUS_MANUTENCAO_ABERTA = List.of(StatusManutencao.PENDENTE,
            StatusManutencao.EM_ANDAMENTO);

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

    @Transactional(readOnly = true)
    public MotoristaManutencaoPainelDTO montarPainel(Long motoristaId) {
        validarMotoristaAtivo(motoristaId);

        List<Manutencao> registros = manutencaoRepository
                .findByVeiculo_Motorista_IdOrderByDataIdentificacaoDescIdDesc(motoristaId);
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

    @Transactional(readOnly = true)
    public List<ManutencaoResponseDTO> listarManutencoes() {
        List<Manutencao> registros = manutencaoRepository.findAllByOrderByDataIdentificacaoDescIdDesc();
        Map<Long, Double> kmPorVeiculo = resolverQuilometragens(registros);
        return registros.stream()
                .map(item -> enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId())))
                .toList();
    }

    @Transactional
    public ManutencaoResponseDTO concluirManutencao(Long manutencaoId, ConcluirManutencaoRequestDTO request) {
        Manutencao manutencao = manutencaoRepository
                .findById(manutencaoId)
                .orElseThrow(() -> new IllegalArgumentException("Manutenção não encontrada com id: " + manutencaoId));

        if (manutencao.getStatus() == StatusManutencao.CONCLUIDA) {
            throw new IllegalArgumentException("Manutenção já concluída.");
        }
        if (manutencao.getStatus() == StatusManutencao.CANCELADA
                || manutencao.getStatus() == StatusManutencao.REPROVADA) {
            throw new IllegalArgumentException("Manutenção cancelada ou reprovada não pode ser concluída.");
        }

        String servicosRealizados = trimObrigatorio(
                request.getServicosRealizados(), "Detalhe os serviços realizados.");
        if (request.getCustoTotal() == null || request.getCustoTotal() < 0) {
            throw new IllegalArgumentException("Custo total não pode ser negativo.");
        }
        if (request.getDataConclusao() == null) {
            throw new IllegalArgumentException("Data de conclusão é obrigatória.");
        }
        String comprovanteNf = trimObrigatorio(request.getComprovanteNf(), "Comprovante ou NF é obrigatório.");

        manutencao.setServicosRealizados(servicosRealizados);
        manutencao.setCustoTotal(request.getCustoTotal());
        manutencao.setDataConclusao(request.getDataConclusao());
        manutencao.setGarantia(trimOuNulo(request.getGarantia()));
        manutencao.setComprovanteNf(comprovanteNf);
        manutencao.setStatus(StatusManutencao.CONCLUIDA);

        liberarVeiculoSePossivel(manutencao);
        Manutencao salva = manutencaoRepository.save(manutencao);

        auditoriaService.registrar(
                "CONCLUIR_MANUTENCAO",
                "Gestor",
                "Manutenção #" + salva.getId(),
                "CONCLUIDA",
                "success",
                null,
                "Veículo " + salva.getVeiculo().getPlaca() + " concluído com custo total "
                        + request.getCustoTotal());

        Double quilometragemAtual = registroUsoRepository
                .buscarUltimaQuilometragemVeiculo(salva.getVeiculo().getId())
                .orElse(null);
        return enriquecerDto(salva, quilometragemAtual);
    }

    private List<ManutencaoResponseDTO> extrairPreventivasProximas(
            List<Manutencao> registros, Map<Long, Double> kmPorVeiculo) {
        LocalDate hoje = LocalDate.now();
        Map<Long, ManutencaoResponseDTO> deduplicado = new LinkedHashMap<>();

        registros.stream()
                .filter(item -> item.getTipoManutencao() == TipoManutencao.PREVENTIVA
                        && item.getStatus() == StatusManutencao.AGENDADA)
                .sorted(Comparator.comparing(Manutencao::getDataRealizada,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .forEach(item -> {
                    ManutencaoResponseDTO dto = enriquecerDto(item, kmPorVeiculo.get(item.getVeiculo().getId()));
                    if (!isPreventivaProxima(dto, hoje))
                        return;
                    deduplicado.putIfAbsent(item.getVeiculo().getId(), dto);
                });

        return deduplicado.values().stream()
                .sorted(Comparator
                        .comparing(ManutencaoResponseDTO::getDiasRestantes,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(ManutencaoResponseDTO::getKmRestantes,
                                Comparator.nullsLast(Comparator.naturalOrder())))
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
        LocalDate hoje = LocalDate.now();

        if (manutencao.getDataRealizada() != null) {
            long dias = ChronoUnit.DAYS.between(hoje, manutencao.getDataRealizada());
            dto.setDiasRestantes((int) dias);
        }

        if (manutencao.getQuilometragemRegistro() != null && quilometragemAtual != null) {
            dto.setKmRestantes(manutencao.getQuilometragemRegistro() - quilometragemAtual);
        }

        dto.setProximidadeLabel(montarProximidadeLabel(dto));
        return dto;
    }

    private boolean isPreventivaProxima(ManutencaoResponseDTO dto, LocalDate hoje) {
        boolean porData = dto.getDataAgendada() != null
                && !dto.getDataAgendada().isBefore(hoje.minusDays(7))
                && !dto.getDataAgendada().isAfter(hoje.plusDays(PREVENTIVE_DAYS_THRESHOLD));
        boolean porKm = dto.getKmRestantes() != null && dto.getKmRestantes() <= PREVENTIVE_KM_THRESHOLD;
        return porData || porKm;
    }

    private String montarProximidadeLabel(ManutencaoResponseDTO dto) {
        List<String> partes = new ArrayList<>();
        if (dto.getDiasRestantes() != null) {
            if (dto.getDiasRestantes() < 0) {
                partes.add("Agendada há " + Math.abs(dto.getDiasRestantes()) + " dia(s)");
            } else if (dto.getDiasRestantes() == 0) {
                partes.add("Prevista para hoje");
            } else {
                partes.add("Em " + dto.getDiasRestantes() + " dia(s)");
            }
        }
        if (dto.getKmRestantes() != null) {
            if (dto.getKmRestantes() <= 0) {
                partes.add("Quilometragem atingida");
            } else {
                partes.add(String.format(Locale.forLanguageTag("pt-BR"), "%.0f km restantes", dto.getKmRestantes()));
            }
        }
        return partes.isEmpty() ? "Próxima da data prevista" : String.join(" · ", partes);
    }

    private void liberarVeiculoSePossivel(Manutencao manutencao) {
        Veiculo veiculo = manutencao.getVeiculo();
        if (veiculo.getStatus() == StatusVeiculo.DESATIVADO || veiculo.getStatus() == StatusVeiculo.EM_USO) {
            return;
        }

        boolean temUsoAberto = registroUsoRepository.existsByVeiculoIdAndDataRetornoIsNull(veiculo.getId());
        boolean temOutraManutencaoAberta = manutencaoRepository.existsByVeiculo_IdAndStatusInAndIdNot(
                veiculo.getId(), STATUS_MANUTENCAO_ABERTA, manutencao.getId());

        if (!temUsoAberto && !temOutraManutencaoAberta) {
            veiculo.setStatus(StatusVeiculo.DISPONIVEL);
            veiculoRepository.save(veiculo);
        }
    }

    private String trimObrigatorio(String valor, String mensagem) {
        String texto = trimOuNulo(valor);
        if (texto == null) {
            throw new IllegalArgumentException(mensagem);
        }
        return texto;
    }

    private String trimOuNulo(String valor) {
        if (valor == null) {
            return null;
        }
        String texto = valor.trim();
        return texto.isEmpty() ? null : texto;
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

    @Transactional
    public ManutencaoResponseDTO encaminharParaOficina(Long id, EncaminharOficinaRequestDTO request) {
        Manutencao manutencao = manutencaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Manutenção não encontrada com ID: " + id));

        if (manutencao.getStatus() != StatusManutencao.PENDENTE) {
            throw new IllegalStateException("Apenas manutenções PENDENTES podem ser encaminhadas para a oficina.");
        }

        Usuario gestor = usuarioRepository.findById(request.getIdGestor())
                .orElseThrow(
                        () -> new IllegalArgumentException("Gestor não encontrado com ID: " + request.getIdGestor()));

        // Atualiza os dados da manutenção conforme os requisitos exatos da issue
        manutencao.setStatus(StatusManutencao.EM_ANDAMENTO);
        manutencao.setOficinaExecutor(request.getOficinaExecutor().trim());
        manutencao.setPrazoPrevistoDias(request.getPrazoPrevistoDias()); // Registra o prazo pedido na OS

        // Atualiza o status do veículo usando o Enum correto do projeto
        Veiculo veiculo = manutencao.getVeiculo();
        if (veiculo.getStatus() != StatusVeiculo.DESATIVADO) {
            veiculo.setStatus(StatusVeiculo.MANUTENCAO); // Corrigido de EM_MANUTENCAO para MANUTENCAO
            veiculoRepository.save(veiculo);
        }

        Manutencao salva = manutencaoRepository.save(manutencao);

        auditoriaService.registrar(
                "ENCAMINHAR_MANUTENCAO",
                gestor.getNome(),
                veiculo.getPlaca(),
                "EM_ANDAMENTO",
                "INFO",
                null,
                "Manutenção #" + id + " encaminhada para oficina: " + request.getOficinaExecutor() + " com prazo de "
                        + request.getPrazoPrevistoDias() + " dias.");

        Double kmAtual = registroUsoRepository.buscarUltimaQuilometragemVeiculo(veiculo.getId()).orElse(null);
        return enriquecerDto(salva, kmAtual);
    }
}