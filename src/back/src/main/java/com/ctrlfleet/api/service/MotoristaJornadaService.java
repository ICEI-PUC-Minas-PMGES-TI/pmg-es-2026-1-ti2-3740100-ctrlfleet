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
import com.ctrlfleet.api.dto.motorista.IniciarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.ReservaMotoristaResponseDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
import com.ctrlfleet.api.repository.CarroChecklistRepository;
import com.ctrlfleet.api.repository.ItemChecklistRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.ReservaRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MotoristaJornadaService {
    private static final long TIPO_INSPECAO_SAIDA_ID = 1L;

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
                .map(reserva -> toReservaResponseDTO(reserva, checklistSaida))
                .toList();
    }

    public List<ReservaMotoristaResponseDTO> listarReservasEmUso(Long motoristaId) {
        validarMotorista(motoristaId);
        return reservaRepository
                .listarEmUsoPorMotorista(motoristaId, StatusReserva.EM_USO)
                .stream()
                .map(reserva -> toReservaResponseDTO(reserva, List.of()))
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
                .map(item -> new ChecklistItemResponseDTO(item.getId(), item.getNome()))
                .toList();
    }

    @Transactional
    public RegistroUsoResponseDTO iniciarTrajeto(Long reservaId, IniciarTrajetoRequestDTO dto) {
        Reserva reserva = reservaRepository
                .findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada com id: " + reservaId));

        if (reserva.getStatusReserva() != StatusReserva.APROVADA
                && reserva.getStatusReserva() != StatusReserva.EM_USO) {
            throw new IllegalArgumentException("Apenas reservas aprovadas podem iniciar trajeto");
        }

        Usuario motorista = validarMotorista(dto.getIdMotorista());
        List<ItemChecklist> itensObrigatorios =
                itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(TIPO_INSPECAO_SAIDA_ID);
        validarChecklistObrigatorio(dto.getItensChecklist(), itensObrigatorios);

        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndDataRetornoIsNull(reserva.getId())
                .map(existente -> validarRegistroExistente(existente, motorista.getId()))
                .orElseGet(() -> criarRegistroUso(reserva, motorista, dto.getQuilometragemSaida()));

        salvarChecklist(registro, itensObrigatorios, dto.getObservacoesChecklist());

        reserva.setStatusReserva(StatusReserva.EM_USO);
        reserva.getVeiculo().setStatus(StatusVeiculo.EM_USO);

        auditoriaService.registrar(
                "TRAJETO_INICIADO",
                motorista.getNome(),
                "Reserva #" + reserva.getId(),
                "Em uso",
                "success",
                null,
                "Registro de uso #" + registro.getId() + " criado/ativado para o veiculo " + reserva.getVeiculo().getPlaca());

        return toRegistroUsoResponseDTO(registro);
    }

    @Transactional
    public RegistroUsoResponseDTO finalizarTrajeto(Long reservaId, FinalizarTrajetoRequestDTO dto) {
        Reserva reserva = reservaRepository
                .findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada com id: " + reservaId));

        if (reserva.getStatusReserva() != StatusReserva.EM_USO) {
            throw new IllegalArgumentException("Apenas reservas em uso podem ser concluidas");
        }

        Usuario motorista = validarMotorista(dto.getIdMotorista());
        RegistroUso registro = registroUsoRepository
                .findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(reservaId, motorista.getId())
                .orElseThrow(() -> new IllegalArgumentException("Nao existe trajeto aberto para esta reserva e motorista"));

        if (dto.getQuilometragemRetorno() < registro.getQuilometragemSaida()) {
            throw new IllegalArgumentException("Quilometragem de retorno deve ser maior ou igual a de saida");
        }

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
                "Concluida",
                "success",
                null,
                "Registro de uso #" + registro.getId() + " finalizado e veiculo " + reserva.getVeiculo().getPlaca() + " liberado");

        return toRegistroUsoResponseDTO(registro);
    }

    private Usuario validarMotorista(Long motoristaId) {
        Usuario motorista = usuarioRepository
                .findById(motoristaId)
                .orElseThrow(() -> new IllegalArgumentException("Motorista nao encontrado com id: " + motoristaId));

        if (motorista.getPapel() == null || !"ROLE_MOTORISTA".equals(motorista.getPapel().name())) {
            throw new IllegalArgumentException("Usuario informado nao possui perfil de motorista");
        }
        if (!"ATIVO".equalsIgnoreCase(motorista.getStatus())) {
            throw new IllegalArgumentException("Motorista precisa estar ativo para iniciar trajeto");
        }
        return motorista;
    }

    private RegistroUso validarRegistroExistente(RegistroUso registro, Long motoristaId) {
        if (!registro.getMotorista().getId().equals(motoristaId)) {
            throw new IllegalArgumentException("Reserva ja possui trajeto aberto por outro motorista");
        }
        return registro;
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
            throw new IllegalArgumentException("Todos os itens obrigatorios do checklist de saida devem ser marcados");
        }
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

    private ReservaMotoristaResponseDTO toReservaResponseDTO(
            Reserva reserva, List<ChecklistItemResponseDTO> checklistSaida) {
        return new ReservaMotoristaResponseDTO(
                reserva.getId(),
                reserva.getUsuario().getId(),
                reserva.getUsuario().getNome(),
                reserva.getVeiculo().getId(),
                reserva.getVeiculo().getPlaca(),
                reserva.getVeiculo().getMarca() + " " + reserva.getVeiculo().getModelo(),
                reserva.getOrigem(),
                reserva.getDestino(),
                reserva.getStatusReserva().name(),
                reserva.getDataHoraInicioPrevista(),
                reserva.getDataHoraFimEstimada(),
                checklistSaida);
    }

    private RegistroUsoResponseDTO toRegistroUsoResponseDTO(RegistroUso registro) {
        return new RegistroUsoResponseDTO(
                registro.getId(),
                registro.getVeiculo().getId(),
                registro.getVeiculo().getPlaca(),
                registro.getMotorista().getId(),
                registro.getMotorista().getNome(),
                registro.getIdReserva(),
                registro.getDataSaida(),
                registro.getQuilometragemSaida(),
                registro.getDataRetorno(),
                registro.getQuilometragemRetorno(),
                registro.getObservacoesVeiculo());
    }
}
