package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.StatusReserva;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.CarroChecklist;
import com.ctrlfleet.api.domain.model.ItemChecklist;
import com.ctrlfleet.api.domain.model.RegistroUso;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.dto.motorista.ChecklistItemResponseDTO;
import com.ctrlfleet.api.dto.motorista.FinalizarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.IniciarCorridaRequestDTO;
import com.ctrlfleet.api.dto.motorista.RegistrarChecklistSaidaRequestDTO;
import com.ctrlfleet.api.dto.motorista.ReservaMotoristaResponseDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
import com.ctrlfleet.api.repository.CarroChecklistRepository;
import com.ctrlfleet.api.repository.ItemChecklistRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.ReservaRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
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
    private static final long TIPO_INSPECAO_SAIDA_ID = 1L;
    private static final long TIPO_INSPECAO_RETORNO_ID = 2L;
    private static final Set<String> PALAVRAS_CHAVE_ITENS_CRITICOS = Set.of("freio", "pneu", "luz", "farol", "seta");

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RegistroUsoRepository registroUsoRepository;
    private final ItemChecklistRepository itemChecklistRepository;
    private final CarroChecklistRepository carroChecklistRepository;
    private final AuditoriaService auditoriaService;

    public MotoristaJornadaService(
            ReservaRepository reservaRepository,
            UsuarioRepository usuarioRepository,
            RegistroUsoRepository registroUsoRepository,
            ItemChecklistRepository itemChecklistRepository,
            CarroChecklistRepository carroChecklistRepository,
            AuditoriaService auditoriaService) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.registroUsoRepository = registroUsoRepository;
        this.itemChecklistRepository = itemChecklistRepository;
        this.carroChecklistRepository = carroChecklistRepository;
        this.auditoriaService = auditoriaService;
    }

    public List<ReservaMotoristaResponseDTO> listarReservasAprovadas(Long motoristaId) {
        validarMotorista(motoristaId);
        List<ChecklistItemResponseDTO> checklistSaida = listarChecklistSaida();

        return reservaRepository
                .listarAprovadasDisponiveisParaMotorista(motoristaId, StatusReserva.APROVADA)
                .stream()
                .map(reserva -> {
                    Double kmChecklist = registroUsoRepository
                            .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reserva.getId(), motoristaId)
                            .map(RegistroUso::getQuilometragemSaida)
                            .orElse(null);
                    return toReservaResponseDTO(
                            motoristaId, reserva, checklistSaida, Collections.emptyList(), kmChecklist);
                })
                .toList();
    }

    public List<ReservaMotoristaResponseDTO> listarReservasEmUso(Long motoristaId) {
        validarMotorista(motoristaId);
        List<ChecklistItemResponseDTO> checklistRetorno = listarChecklistRetorno();
        return reservaRepository
                .listarEmUsoPorMotorista(motoristaId, StatusReserva.EM_USO)
                .stream()
                .map(reserva -> {
                    Double kmSaidaAberto = registroUsoRepository
                            .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reserva.getId(), motoristaId)
                            .map(RegistroUso::getQuilometragemSaida)
                            .orElse(null);
                    return toReservaResponseDTO(
                            motoristaId, reserva, Collections.emptyList(), checklistRetorno, kmSaidaAberto);
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

    public List<ChecklistItemResponseDTO> listarChecklistSaida() {
        return itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(TIPO_INSPECAO_SAIDA_ID)
                .stream()
                .map(item -> new ChecklistItemResponseDTO(item.getId(), item.getNome(), isItemCritico(item)))
                .toList();
    }

    public List<ChecklistItemResponseDTO> listarChecklistRetorno() {
        return itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(TIPO_INSPECAO_RETORNO_ID)
                .stream()
                .map(item -> new ChecklistItemResponseDTO(item.getId(), item.getNome(), isItemCritico(item)))
                .toList();
    }

    @Transactional
    public RegistroUsoResponseDTO registrarChecklistSaida(Long reservaId, RegistrarChecklistSaidaRequestDTO dto) {
        Reserva reserva = reservaRepository
                .findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva não encontrada com id: " + reservaId));

        if (reserva.getStatusReserva() != StatusReserva.APROVADA) {
            throw new IllegalArgumentException("Checklist de saída só pode ser registrado em reservas aprovadas.");
        }

        Usuario motorista = validarMotorista(dto.getIdMotorista());
        validarQuilometragemSaida(reserva, dto.getQuilometragemSaida());
        List<ItemChecklist> itensObrigatorios =
                itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(TIPO_INSPECAO_SAIDA_ID);
        validarChecklistObrigatorio(dto.getItensChecklist(), itensObrigatorios);
        validarOcorrenciasCriticas(dto.getObservacoesChecklist(), itensObrigatorios);

        if (registroUsoRepository.existsByIdReservaAndDataRetornoIsNull(reserva.getId())) {
            boolean vinculadaAoMotorista = registroUsoRepository
                    .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motorista.getId())
                    .isPresent();
            if (!vinculadaAoMotorista) {
                throw new IllegalArgumentException("Esta reserva já possui checklist ou trajeto de outro motorista.");
            }
        }

        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motorista.getId())
                .orElseGet(() -> criarRegistroUso(reserva, motorista, dto.getQuilometragemSaida()));

        if (checklistSaidaConcluido(registro)) {
            throw new IllegalArgumentException("Checklist de saída já registrado para esta reserva.");
        }

        registro.setQuilometragemSaida(dto.getQuilometragemSaida());
        salvarChecklist(registro, itensObrigatorios, dto.getObservacoesChecklist());

        auditoriaService.registrar(
                "CHECKLIST_SAIDA_REGISTRADO",
                motorista.getNome(),
                "Reserva #" + reserva.getId(),
                "Checklist salvo",
                "success",
                null,
                "Checklist de saída registrado no uso #" + registro.getId());

        return toRegistroUsoResponseDTO(registro);
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

        if (!checklistSaidaConcluido(registro)) {
            throw new IllegalArgumentException("Conclua o checklist de saída antes de iniciar a corrida.");
        }

        if (reserva.getVeiculo().getStatus() != StatusVeiculo.DISPONIVEL) {
            throw new IllegalArgumentException("O veículo desta reserva não está disponível para saída.");
        }

        validarJanelaDeInicio(reserva);

        registro.setDataSaida(LocalDateTime.now());
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

        List<ItemChecklist> itensRetorno =
                itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(TIPO_INSPECAO_RETORNO_ID);
        validarChecklistObrigatorio(dto.getItensChecklist(), itensRetorno);
        validarOcorrenciasCriticas(dto.getObservacoesChecklist(), itensRetorno);
        salvarChecklist(registro, itensRetorno, dto.getObservacoesChecklist());

        registro.setDataRetorno(LocalDateTime.now());
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
                LocalDateTime.now(),
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

    private void validarJanelaDeInicio(Reserva reserva) {
        LocalDateTime agora = LocalDateTime.now();
        if (reserva.getDataHoraInicioPrevista() != null
                && agora.isBefore(reserva.getDataHoraInicioPrevista().minusMinutes(10))) {
            throw new IllegalArgumentException(
                    "Trajeto disponível somente a partir de " + reserva.getDataHoraInicioPrevista().minusMinutes(10) + ".");
        }
        if (reserva.getDataHoraFimEstimada() != null && agora.isAfter(reserva.getDataHoraFimEstimada())) {
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
        LocalDateTime agora = LocalDateTime.now();
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

    private boolean checklistSaidaConcluido(RegistroUso registro) {
        if (registro == null || registro.getId() == null) {
            return false;
        }
        List<ItemChecklist> itensObrigatorios =
                itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(TIPO_INSPECAO_SAIDA_ID);
        if (itensObrigatorios.isEmpty()) {
            return false;
        }
        long marcados = carroChecklistRepository.countByRegistroUsoId(registro.getId());
        return marcados >= itensObrigatorios.size();
    }

    private boolean checklistSaidaConcluido(Long reservaId, Long motoristaId) {
        return registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motoristaId)
                .map(this::checklistSaidaConcluido)
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
