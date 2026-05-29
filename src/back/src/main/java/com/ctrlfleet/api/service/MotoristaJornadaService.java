package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.StatusReserva;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.CarroChecklist;
import com.ctrlfleet.api.domain.model.ItemChecklist;
import com.ctrlfleet.api.domain.model.RegistroUso;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.TipoInspecao;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.dto.motorista.ChecklistItemResponseDTO;
import com.ctrlfleet.api.dto.motorista.ChecklistJornadaStatusDTO;
import com.ctrlfleet.api.dto.motorista.ChecklistTipoProgressoDTO;
import com.ctrlfleet.api.dto.motorista.ChecklistTipoResponseDTO;
import com.ctrlfleet.api.dto.motorista.FinalizarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.IniciarCorridaRequestDTO;
import com.ctrlfleet.api.dto.motorista.RegistrarChecklistParcialRequestDTO;
import com.ctrlfleet.api.dto.motorista.RegistrarChecklistSaidaRequestDTO;
import com.ctrlfleet.api.dto.motorista.ReservaMotoristaResponseDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
import com.ctrlfleet.api.repository.CarroChecklistRepository;
import com.ctrlfleet.api.repository.ItemChecklistRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.ReservaRepository;
import com.ctrlfleet.api.repository.TipoInspecaoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.util.HorarioOperacional;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MotoristaJornadaService {
    private static final String FASE_CHECKLIST_SAIDA = "SAIDA";
    private static final String FASE_CHECKLIST_RETORNO = "RETORNO";
    private static final int CHECKLIST_JANELA_MINUTOS = 15;
    private static final Set<String> PALAVRAS_CHAVE_ITENS_CRITICOS = Set.of("freio", "pneu", "luz", "farol", "seta");

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RegistroUsoRepository registroUsoRepository;
    private final ItemChecklistRepository itemChecklistRepository;
    private final TipoInspecaoRepository tipoInspecaoRepository;
    private final CarroChecklistRepository carroChecklistRepository;
    private final AuditoriaService auditoriaService;

    public MotoristaJornadaService(
            ReservaRepository reservaRepository,
            UsuarioRepository usuarioRepository,
            RegistroUsoRepository registroUsoRepository,
            ItemChecklistRepository itemChecklistRepository,
            TipoInspecaoRepository tipoInspecaoRepository,
            CarroChecklistRepository carroChecklistRepository,
            AuditoriaService auditoriaService) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.registroUsoRepository = registroUsoRepository;
        this.itemChecklistRepository = itemChecklistRepository;
        this.tipoInspecaoRepository = tipoInspecaoRepository;
        this.carroChecklistRepository = carroChecklistRepository;
        this.auditoriaService = auditoriaService;
    }

    public List<ReservaMotoristaResponseDTO> listarReservasAprovadas(Long motoristaId) {
        validarMotorista(motoristaId);

        return reservaRepository
                .listarAprovadasDisponiveisParaMotorista(motoristaId, StatusReserva.APROVADA)
                .stream()
                .map(reserva -> {
                    Double kmChecklist = registroUsoRepository
                            .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reserva.getId(), motoristaId)
                            .map(RegistroUso::getQuilometragemSaida)
                            .orElse(null);
                    return toReservaResponseDTO(
                            motoristaId, reserva, Collections.emptyList(), Collections.emptyList(), kmChecklist);
                })
                .toList();
    }

    public List<ReservaMotoristaResponseDTO> listarReservasEmUso(Long motoristaId) {
        validarMotorista(motoristaId);
        return reservaRepository
                .listarEmUsoPorMotorista(motoristaId, StatusReserva.EM_USO)
                .stream()
                .map(reserva -> {
                    Double kmSaidaAberto = registroUsoRepository
                            .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reserva.getId(), motoristaId)
                            .map(RegistroUso::getQuilometragemSaida)
                            .orElse(null);
                    return toReservaResponseDTO(
                            motoristaId, reserva, Collections.emptyList(), Collections.emptyList(), kmSaidaAberto);
                })
                .toList();
    }

    public List<ReservaMotoristaResponseDTO> listarReservasConcluidas(Long motoristaId) {
        validarMotorista(motoristaId);
        return reservaRepository
                .listarConcluidasPorMotorista(motoristaId, StatusReserva.CONCLUIDA)
                .stream()
                .map(reserva -> toReservaResponseDTO(motoristaId, reserva, Collections.emptyList(), Collections.emptyList(), null))
                .toList();
    }

    public List<RegistroUsoResponseDTO> listarHistorico(Long motoristaId) {
        validarMotorista(motoristaId);
        return registroUsoRepository.findByMotoristaIdOrderByDataSaidaDesc(motoristaId).stream()
                .map(this::toRegistroUsoResponseDTO)
                .toList();
    }

    public ChecklistJornadaStatusDTO obterStatusChecklistSaida(Long reservaId, Long motoristaId) {
        Reserva reserva = buscarReserva(reservaId);
        validarMotorista(motoristaId);
        RegistroUso registro = obterOuCriarRegistroAberto(reserva, motoristaId, null);
        return montarStatusJornada(registro, FASE_CHECKLIST_SAIDA);
    }

    public ChecklistJornadaStatusDTO obterStatusChecklistRetorno(Long reservaId, Long motoristaId) {
        Reserva reserva = buscarReserva(reservaId);
        validarMotorista(motoristaId);
        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motoristaId)
                .orElseThrow(() -> new IllegalArgumentException("Não existe trajeto aberto para esta reserva."));
        return montarStatusJornada(registro, FASE_CHECKLIST_RETORNO);
    }

    public ChecklistTipoResponseDTO buscarChecklistPorTipo(Long tipoInspecaoId) {
        return listarChecklistPorTipo(tipoInspecaoId);
    }

    public List<ChecklistItemResponseDTO> listarChecklistSaida() {
        return tiposDaFase(FASE_CHECKLIST_SAIDA).stream()
                .flatMap(tipo -> listarChecklistPorTipo(tipo.getId()).getItens().stream())
                .toList();
    }

    public List<ChecklistItemResponseDTO> listarChecklistRetorno() {
        return tiposDaFase(FASE_CHECKLIST_RETORNO).stream()
                .flatMap(tipo -> listarChecklistPorTipo(tipo.getId()).getItens().stream())
                .toList();
    }

    private ChecklistTipoResponseDTO listarChecklistPorTipo(long tipoInspecaoId) {
        TipoInspecao tipo = tipoInspecaoRepository
                .findById(tipoInspecaoId)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de inspeção não encontrado: " + tipoInspecaoId));

        List<ChecklistItemResponseDTO> itens = itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(tipoInspecaoId)
                .stream()
                .map(item -> new ChecklistItemResponseDTO(item.getId(), item.getNome(), isItemCritico(item)))
                .toList();

        return new ChecklistTipoResponseDTO(tipo.getId(), tipo.getNome(), tipo.getDescricao(), itens);
    }

    @Transactional
    public RegistroUsoResponseDTO registrarChecklistParcialSaida(
            Long reservaId, Long tipoInspecaoId, RegistrarChecklistParcialRequestDTO dto) {
        Reserva reserva = buscarReserva(reservaId);
        if (reserva.getStatusReserva() != StatusReserva.APROVADA) {
            throw new IllegalArgumentException("Checklist de saída só pode ser registrado em reservas aprovadas.");
        }
        validarJanelaChecklistSaida(reserva);

        TipoInspecao tipo = tipoInspecaoRepository
                .findById(tipoInspecaoId)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de checklist não encontrado."));
        if (!FASE_CHECKLIST_SAIDA.equalsIgnoreCase(tipo.getFase())) {
            throw new IllegalArgumentException("Tipo informado não pertence ao checklist de saída.");
        }

        Usuario motorista = validarMotorista(dto.getIdMotorista());
        RegistroUso registro = obterOuCriarRegistroAberto(reserva, motorista.getId(), dto.getQuilometragemSaida());

        if (dto.getQuilometragemSaida() != null) {
            validarQuilometragemSaida(reserva, dto.getQuilometragemSaida());
            registro.setQuilometragemSaida(dto.getQuilometragemSaida());
        }

        List<ItemChecklist> itensDoTipo = itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(tipoInspecaoId);
        validarChecklistObrigatorio(dto.getItensChecklist(), itensDoTipo);
        validarOcorrenciasCriticas(dto.getObservacoesChecklist(), itensDoTipo);
        salvarChecklist(registro, itensDoTipo, dto.getObservacoesChecklist());

        auditoriaService.registrar(
                "CHECKLIST_PARCIAL_SAIDA",
                motorista.getNome(),
                "Reserva #" + reserva.getId(),
                tipo.getNome(),
                "success",
                null,
                "Checklist " + tipo.getNome() + " registrado no uso #" + registro.getId());

        return toRegistroUsoResponseDTO(registro);
    }

    @Transactional
    public RegistroUsoResponseDTO registrarChecklistParcialRetorno(
            Long reservaId, Long tipoInspecaoId, RegistrarChecklistParcialRequestDTO dto) {
        Reserva reserva = buscarReserva(reservaId);
        if (reserva.getStatusReserva() != StatusReserva.EM_USO) {
            throw new IllegalArgumentException("Checklist de retorno só pode ser registrado em reservas em uso.");
        }

        TipoInspecao tipo = tipoInspecaoRepository
                .findById(tipoInspecaoId)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de checklist não encontrado."));
        if (!FASE_CHECKLIST_RETORNO.equalsIgnoreCase(tipo.getFase())) {
            throw new IllegalArgumentException("Tipo informado não pertence ao checklist de retorno.");
        }

        Usuario motorista = validarMotorista(dto.getIdMotorista());
        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motorista.getId())
                .orElseThrow(() -> new IllegalArgumentException("Não existe trajeto aberto para esta reserva."));

        List<ItemChecklist> itensDoTipo = itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(tipoInspecaoId);
        validarChecklistObrigatorio(dto.getItensChecklist(), itensDoTipo);
        validarOcorrenciasCriticas(dto.getObservacoesChecklist(), itensDoTipo);
        salvarChecklist(registro, itensDoTipo, dto.getObservacoesChecklist());

        return toRegistroUsoResponseDTO(registro);
    }

    @Transactional
    public RegistroUsoResponseDTO registrarQuilometragemSaida(
            Long reservaId, Long motoristaId, Double quilometragemSaida) {
        Reserva reserva = buscarReserva(reservaId);
        validarJanelaChecklistSaida(reserva);
        validarMotorista(motoristaId);
        validarQuilometragemSaida(reserva, quilometragemSaida);
        RegistroUso registro = obterOuCriarRegistroAberto(reserva, motoristaId, quilometragemSaida);
        registro.setQuilometragemSaida(quilometragemSaida);
        return toRegistroUsoResponseDTO(registro);
    }

    @Transactional
    public RegistroUsoResponseDTO registrarChecklistSaidaFinal(Long reservaId, Long motoristaId) {
        Reserva reserva = buscarReserva(reservaId);
        if (reserva.getStatusReserva() != StatusReserva.APROVADA) {
            throw new IllegalArgumentException("Checklist de saída só pode ser registrado em reservas aprovadas.");
        }
        validarJanelaChecklistSaida(reserva);
        Usuario motorista = validarMotorista(motoristaId);
        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motorista.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Preencha todos os tipos de checklist e a quilometragem antes de registrar."));

        if (registro.isChecklistSaidaRegistrado()) {
            return toRegistroUsoResponseDTO(registro);
        }

        if (!checklistSaidaPreenchido(registro)) {
            throw new IllegalArgumentException(
                    "Conclua todos os tipos de checklist e informe a quilometragem de saída antes de registrar.");
        }

        registro.setChecklistSaidaRegistrado(true);
        registroUsoRepository.save(registro);

        auditoriaService.registrar(
                "CHECKLIST_SAIDA_REGISTRADO",
                motorista.getNome(),
                "Reserva #" + reserva.getId(),
                "Checklist de saída",
                "success",
                null,
                "Checklist de saída registrado no uso #" + registro.getId());

        return toRegistroUsoResponseDTO(registro);
    }

    @Transactional
    @Deprecated
    public RegistroUsoResponseDTO registrarChecklistSaida(Long reservaId, RegistrarChecklistSaidaRequestDTO dto) {
        throw new IllegalArgumentException(
                "Use o preenchimento por tipo de checklist: Limpeza, Mecânica, Iluminação e Combustível.");
    }

    @Transactional
    public RegistroUsoResponseDTO iniciarTrajeto(Long reservaId, IniciarCorridaRequestDTO dto) {
        Reserva reserva = reservaRepository
                .findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva não encontrada com id: " + reservaId));

        if (reserva.getStatusReserva() != StatusReserva.APROVADA) {
            throw new IllegalArgumentException("Apenas reservas aprovadas podem iniciar corrida.");
        }

        Usuario motorista = validarMotorista(dto.getIdMotorista());
        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motorista.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Registre o checklist de saída antes de iniciar a corrida."));

        if (!registro.isChecklistSaidaRegistrado()) {
            throw new IllegalArgumentException("Registre o checklist de saída antes de iniciar a corrida.");
        }

        if (reserva.getVeiculo().getStatus() != StatusVeiculo.DISPONIVEL) {
            throw new IllegalArgumentException("O veículo desta reserva não está disponível para saída.");
        }

        validarHorarioReservaAtiva(reserva);

        registro.setDataSaida(HorarioOperacional.agora());
        reserva.setStatusReserva(StatusReserva.EM_USO);
        reserva.getVeiculo().setStatus(StatusVeiculo.EM_USO);

        auditoriaService.registrar(
                "TRAJETO_INICIADO",
                motorista.getNome(),
                "Reserva #" + reserva.getId(),
                "Em uso",
                "success",
                null,
                "Corrida iniciada — registro de uso #" + registro.getId());

        return toRegistroUsoResponseDTO(registro);
    }

    @Transactional
    public RegistroUsoResponseDTO finalizarTrajeto(Long reservaId, FinalizarTrajetoRequestDTO dto) {
        Reserva reserva = reservaRepository
                .findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva não encontrada com id: " + reservaId));

        if (reserva.getStatusReserva() != StatusReserva.EM_USO) {
            throw new IllegalArgumentException("Apenas reservas em uso podem ser concluídas.");
        }

        Usuario motorista = validarMotorista(dto.getIdMotorista());
        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motorista.getId())
                .orElseThrow(() -> new IllegalArgumentException("Não existe trajeto aberto para esta reserva e motorista."));

        if (dto.getQuilometragemRetorno() < registro.getQuilometragemSaida()) {
            throw new IllegalArgumentException("Quilometragem de retorno deve ser maior ou igual à de saída.");
        }

        validarChecklistRetornoCompleto(registro);
        if (dto.getItensChecklist() != null && !dto.getItensChecklist().isEmpty()) {
            List<ItemChecklist> itensInformados = itemChecklistRepository.findByIdIn(dto.getItensChecklist());
            validarChecklistObrigatorio(dto.getItensChecklist(), itensInformados);
            validarOcorrenciasCriticas(dto.getObservacoesChecklist(), itensInformados);
            salvarChecklist(registro, itensInformados, dto.getObservacoesChecklist());
        }

        registro.setDataRetorno(HorarioOperacional.agora());
        registro.setQuilometragemRetorno(dto.getQuilometragemRetorno());
        registro.setObservacoesVeiculo(
                dto.getObservacoesVeiculo() == null || dto.getObservacoesVeiculo().isBlank()
                        ? null
                        : dto.getObservacoesVeiculo().trim());
        reserva.setStatusReserva(StatusReserva.CONCLUIDA);
        reserva.getVeiculo().setStatus(StatusVeiculo.DISPONIVEL);

        auditoriaService.registrar(
                "TRAJETO_FINALIZADO",
                motorista.getNome(),
                "Reserva #" + reserva.getId(),
                "Concluída",
                "success",
                null,
                "Registro de uso #" + registro.getId() + " finalizado e veículo " + reserva.getVeiculo().getPlaca() + " liberado");

        return toRegistroUsoResponseDTO(registro);
    }

    private Usuario validarMotorista(Long motoristaId) {
        Usuario motorista = usuarioRepository
                .findById(motoristaId)
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado com id: " + motoristaId));

        if (motorista.getPapel() == null || !"ROLE_MOTORISTA".equals(motorista.getPapel().name())) {
            throw new IllegalArgumentException("Usuário informado não possui perfil de motorista.");
        }
        if (!"ATIVO".equalsIgnoreCase(motorista.getStatus())) {
            throw new IllegalArgumentException("Motorista precisa estar ativo para iniciar trajeto.");
        }
        return motorista;
    }

    private RegistroUso criarRegistroUso(Reserva reserva, Usuario motorista, Double quilometragemSaida) {
        RegistroUso registro = new RegistroUso(
                reserva.getVeiculo(),
                motorista,
                HorarioOperacional.agora(),
                quilometragemSaida);
        registro.setIdReserva(reserva.getId());
        return registroUsoRepository.save(registro);
    }

    private void validarChecklistObrigatorio(List<Long> itensSelecionados, List<ItemChecklist> itensObrigatorios) {
        Set<Long> selecionados = new HashSet<>(itensSelecionados == null ? List.of() : itensSelecionados);
        List<Long> obrigatorios = itensObrigatorios.stream().map(ItemChecklist::getId).toList();

        if (!selecionados.containsAll(obrigatorios)) {
            throw new IllegalArgumentException("Todos os itens obrigatórios do checklist devem ser marcados.");
        }
        if (!new HashSet<>(obrigatorios).containsAll(selecionados)) {
            throw new IllegalArgumentException("Checklist contém itens inválidos para o tipo de inspeção.");
        }
    }

    private void validarOcorrenciasCriticas(Map<Long, String> observacoes, List<ItemChecklist> itensObrigatorios) {
        if (observacoes == null || observacoes.isEmpty()) {
            return;
        }

        for (ItemChecklist item : itensObrigatorios) {
            String observacao = observacoes.get(item.getId());
            if (isItemCritico(item) && observacao != null && !observacao.isBlank()) {
                throw new IllegalArgumentException(
                        "Item crítico com ocorrência informada: " + item.getNome() + ". Acione o gestor antes da saída.");
            }
        }
    }

    private void validarJanelaChecklistSaida(Reserva reserva) {
        LocalDateTime agora = HorarioOperacional.agora();
        if (reserva.getDataHoraInicioPrevista() != null
                && agora.isBefore(reserva.getDataHoraInicioPrevista().minusMinutes(CHECKLIST_JANELA_MINUTOS))) {
            throw new IllegalArgumentException(
                    "Checklist disponível somente a partir de "
                            + reserva.getDataHoraInicioPrevista().minusMinutes(CHECKLIST_JANELA_MINUTOS) + ".");
        }
        validarHorarioReservaAtiva(reserva);
    }

    private void validarHorarioReservaAtiva(Reserva reserva) {
        if (HorarioOperacional.reservaEncerrada(reserva.getDataHoraFimEstimada())) {
            throw new IllegalArgumentException("O horário previsto desta reserva já foi encerrado. Solicite nova aprovação.");
        }
    }

    private void validarQuilometragemSaida(Reserva reserva, Double quilometragemSaida) {
        if (quilometragemSaida == null || quilometragemSaida < 0) {
            throw new IllegalArgumentException("Informe uma quilometragem de saída válida.");
        }

        registroUsoRepository.buscarUltimaQuilometragemVeiculo(reserva.getVeiculo().getId())
                .ifPresent(ultima -> {
                    if (quilometragemSaida < ultima) {
                        throw new IllegalArgumentException(
                                "Quilometragem de saída deve ser maior ou igual à última registrada para o veículo ("
                                        + ultima + " km).");
                    }
                });
    }

    private boolean isItemCritico(ItemChecklist item) {
        if (item == null || item.getNome() == null) return false;
        String nome = item.getNome().toLowerCase();
        return PALAVRAS_CHAVE_ITENS_CRITICOS.stream().anyMatch(nome::contains);
    }

    private void salvarChecklist(
            RegistroUso registro, List<ItemChecklist> itensObrigatorios, Map<Long, String> observacoes) {
        LocalDateTime agora = HorarioOperacional.agora();
        for (ItemChecklist item : itensObrigatorios) {
            if (carroChecklistRepository.existsByRegistroUsoIdAndItemId(registro.getId(), item.getId())) {
                continue;
            }
            String observacao = observacoes == null ? null : observacoes.get(item.getId());
            carroChecklistRepository.save(
                    new CarroChecklist(
                            registro,
                            item,
                            agora,
                            observacao == null || observacao.isBlank() ? null : observacao.trim()));
        }
    }

    private Reserva buscarReserva(Long reservaId) {
        return reservaRepository
                .findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva não encontrada com id: " + reservaId));
    }

    private List<TipoInspecao> tiposDaFase(String fase) {
        return tipoInspecaoRepository.findByFaseOrderByIdAsc(fase).stream()
                .filter(tipo -> !itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(tipo.getId()).isEmpty())
                .toList();
    }

    private RegistroUso obterOuCriarRegistroAberto(Reserva reserva, Long motoristaId, Double quilometragemInicial) {
        Usuario motorista = validarMotorista(motoristaId);

        if (registroUsoRepository.existsByIdReservaAndDataRetornoIsNull(reserva.getId())) {
            boolean vinculadaAoMotorista = registroUsoRepository
                    .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reserva.getId(), motorista.getId())
                    .isPresent();
            if (!vinculadaAoMotorista) {
                throw new IllegalArgumentException("Esta reserva já possui checklist ou trajeto de outro motorista.");
            }
        }

        return registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reserva.getId(), motorista.getId())
                .orElseGet(() -> criarRegistroUso(
                        reserva,
                        motorista,
                        quilometragemInicial != null ? quilometragemInicial : 0.0));
    }

    private ChecklistJornadaStatusDTO montarStatusJornada(RegistroUso registro, String fase) {
        List<ChecklistTipoProgressoDTO> tipos = tiposDaFase(fase).stream()
                .map(tipo -> {
                    List<ItemChecklist> itens =
                            itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(tipo.getId());
                    int total = itens.size();
                    long concluidos = registro.getId() == null
                            ? 0
                            : carroChecklistRepository.countByRegistroUsoIdAndTipoInspecaoId(
                                    registro.getId(), tipo.getId());
                    boolean concluido = total > 0 && concluidos >= total;
                    return new ChecklistTipoProgressoDTO(
                            tipo.getId(), tipo.getNome(), tipo.getDescricao(), total, (int) concluidos, concluido);
                })
                .toList();

        boolean preenchimentoCompleto =
                FASE_CHECKLIST_SAIDA.equals(fase)
                        ? checklistSaidaPreenchido(registro)
                        : checklistRetornoConcluido(registro);
        boolean checklistRegistrado =
                FASE_CHECKLIST_SAIDA.equals(fase) && registro.isChecklistSaidaRegistrado();

        Double km = registro.getQuilometragemSaida();
        Double ultimaKmVeiculo = registro.getVeiculo() == null
                ? null
                : registroUsoRepository
                        .buscarUltimaQuilometragemVeiculo(registro.getVeiculo().getId())
                        .orElse(null);
        return new ChecklistJornadaStatusDTO(
                km, ultimaKmVeiculo, preenchimentoCompleto, checklistRegistrado, tipos);
    }

    private boolean tipoConcluido(RegistroUso registro, Long tipoInspecaoId) {
        List<ItemChecklist> itens = itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(tipoInspecaoId);
        if (itens.isEmpty()) {
            return true;
        }
        long marcados = carroChecklistRepository.countByRegistroUsoIdAndTipoInspecaoId(registro.getId(), tipoInspecaoId);
        return marcados >= itens.size();
    }

    private boolean checklistSaidaPreenchido(RegistroUso registro) {
        if (registro == null || registro.getId() == null) {
            return false;
        }
        Double km = registro.getQuilometragemSaida();
        if (km == null || km <= 0) {
            return false;
        }
        List<TipoInspecao> tipos = tiposDaFase(FASE_CHECKLIST_SAIDA);
        if (tipos.isEmpty()) {
            return false;
        }
        return tipos.stream().allMatch(tipo -> tipoConcluido(registro, tipo.getId()));
    }

    private boolean checklistRetornoConcluido(RegistroUso registro) {
        if (registro == null || registro.getId() == null) {
            return false;
        }
        List<TipoInspecao> tipos = tiposDaFase(FASE_CHECKLIST_RETORNO);
        if (tipos.isEmpty()) {
            return false;
        }
        return tipos.stream().allMatch(tipo -> tipoConcluido(registro, tipo.getId()));
    }

    private void validarChecklistRetornoCompleto(RegistroUso registro) {
        if (!checklistRetornoConcluido(registro)) {
            throw new IllegalArgumentException("Conclua todos os tipos de checklist de retorno antes de encerrar.");
        }
    }

    private boolean checklistSaidaConcluido(Long reservaId, Long motoristaId) {
        return registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motoristaId)
                .map(RegistroUso::isChecklistSaidaRegistrado)
                .orElse(false);
    }

    private ReservaMotoristaResponseDTO toReservaResponseDTO(
            Long motoristaId,
            Reserva reserva,
            List<ChecklistItemResponseDTO> checklistSaida,
            List<ChecklistItemResponseDTO> checklistRetorno,
            Double quilometragemSaidaTrajeto) {
        boolean checklistConcluido = checklistSaidaConcluido(reserva.getId(), motoristaId);
        return new ReservaMotoristaResponseDTO(
                reserva.getId(),
                reserva.getUsuario().getId(),
                reserva.getUsuario().getNome(),
                reserva.getVeiculo().getId(),
                reserva.getVeiculo().getPlaca(),
                reserva.getVeiculo().getMarca() + " " + reserva.getVeiculo().getModelo(),
                reserva.getOrigem(),
                reserva.getDestino(),
                reserva.getOrigemLat(),
                reserva.getOrigemLng(),
                reserva.getDestinoLat(),
                reserva.getDestinoLng(),
                reserva.getJustificativa(),
                reserva.getVeiculo() != null && reserva.getVeiculo().getTipoVeiculo() != null
                        ? reserva.getVeiculo().getTipoVeiculo().name()
                        : null,
                reserva.getStatusReserva().name(),
                reserva.getDataHoraInicioPrevista(),
                reserva.getDataHoraFimEstimada(),
                registroUsoRepository.buscarUltimaQuilometragemVeiculo(reserva.getVeiculo().getId()).orElse(null),
                checklistSaida,
                checklistRetorno,
                quilometragemSaidaTrajeto,
                checklistConcluido);
    }

    private RegistroUsoResponseDTO toRegistroUsoResponseDTO(RegistroUso registro) {
        Reserva reserva = registro.getIdReserva() == null
                ? null
                : reservaRepository.findById(registro.getIdReserva()).orElse(null);

        return new RegistroUsoResponseDTO(
                registro.getId(),
                registro.getVeiculo().getId(),
                registro.getVeiculo().getPlaca(),
                registro.getVeiculo().getMarca() + " " + registro.getVeiculo().getModelo(),
                registro.getMotorista().getId(),
                registro.getMotorista().getNome(),
                registro.getIdReserva(),
                reserva == null ? null : reserva.getOrigem(),
                reserva == null ? null : reserva.getDestino(),
                registro.getDataSaida(),
                registro.getQuilometragemSaida(),
                registro.getDataRetorno(),
                registro.getQuilometragemRetorno(),
                registro.getObservacoesVeiculo());
    }
}
