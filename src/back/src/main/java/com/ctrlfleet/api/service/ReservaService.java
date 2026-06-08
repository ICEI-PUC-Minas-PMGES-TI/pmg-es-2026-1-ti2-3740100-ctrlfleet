package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.enums.StatusReserva;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.reserva.DecisaoReservaRequestDTO;
import com.ctrlfleet.api.dto.reserva.ReservaRequestDTO;
import com.ctrlfleet.api.dto.reserva.ReservaResponseDTO;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.ReservaRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final RegistroUsoRepository registroUsoRepository;
    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;
    private final AuditoriaService auditoriaService;
    private final NotificationEmailService notificationEmailService;

    public ReservaService(
            ReservaRepository reservaRepository,
            RegistroUsoRepository registroUsoRepository,
            UsuarioRepository usuarioRepository,
            VeiculoRepository veiculoRepository,
            AuditoriaService auditoriaService,
            NotificationEmailService notificationEmailService) {
        this.reservaRepository = reservaRepository;
        this.registroUsoRepository = registroUsoRepository;
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
        this.auditoriaService = auditoriaService;
        this.notificationEmailService = notificationEmailService;
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listar(String status, Long idUsuario) {
        if (idUsuario != null) {
            if (status == null || status.isBlank()) {
                return reservaRepository.findByUsuario_IdOrderByDataHoraInicioPrevistaDesc(idUsuario).stream()
                        .map(ReservaResponseDTO::fromEntity)
                        .toList();
            }
            StatusReserva statusReserva = parseStatus(status);
            return reservaRepository
                    .findByUsuario_IdAndStatusReservaOrderByDataHoraInicioPrevistaDesc(idUsuario, statusReserva)
                    .stream()
                    .map(ReservaResponseDTO::fromEntity)
                    .toList();
        }
        if (status == null || status.isBlank()) {
            return reservaRepository.findAllByOrderByDataHoraInicioPrevistaDesc().stream()
                    .map(ReservaResponseDTO::fromEntity)
                    .toList();
        }
        StatusReserva statusReserva = parseStatus(status);
        return reservaRepository.findByStatusReservaOrderByDataHoraInicioPrevistaDesc(statusReserva).stream()
                .map(ReservaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public ReservaResponseDTO criar(ReservaRequestDTO dto) {
        Usuario solicitante = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Solicitante nao encontrado com id: " + dto.getIdUsuario()));
        String matriculaInformada = dto.getMatriculaSolicitante() == null
                ? ""
                : dto.getMatriculaSolicitante().trim();
        if (matriculaInformada.isEmpty()) {
            throw new IllegalArgumentException("Matricula do solicitante e obrigatoria");
        }
        if (solicitante.getMatricula() == null
                || !matriculaInformada.equalsIgnoreCase(solicitante.getMatricula().trim())) {
            throw new IllegalArgumentException("Matricula informada nao confere com o solicitante");
        }
        if (dto.getIdMotorista() == null) {
            throw new IllegalArgumentException("Motorista e obrigatorio");
        }

        Usuario motorista = usuarioRepository.findById(dto.getIdMotorista())
                .orElseThrow(() -> new IllegalArgumentException("Motorista nao encontrado com id: " + dto.getIdMotorista()));
        if (motorista.getPapel() != PapelUsuario.ROLE_MOTORISTA
                || !"ATIVO".equalsIgnoreCase(motorista.getStatus())) {
            throw new IllegalArgumentException("Motorista informado invalido ou inativo");
        }

        Veiculo veiculo = veiculoRepository.findById(dto.getIdVeiculo())
                .orElseThrow(() -> new IllegalArgumentException("Veiculo nao encontrado com id: " + dto.getIdVeiculo()));

        if (veiculo.getMotorista() == null
                || !motorista.getId().equals(veiculo.getMotorista().getId())) {
            throw new IllegalArgumentException("Veiculo nao esta vinculado ao motorista selecionado");
        }
        if (veiculo.getStatus() != StatusVeiculo.DISPONIVEL) {
            throw new IllegalArgumentException("Veiculo selecionado nao esta disponivel");
        }

        LocalDateTime inicio = parseDateTime(dto.getDataHoraInicioPrevista(), "dataHoraInicioPrevista");
        LocalDateTime fim = parseDateTime(dto.getDataHoraFimEstimada(), "dataHoraFimEstimada");
        if (!fim.isAfter(inicio)) {
            throw new IllegalArgumentException("Fim estimado deve ser posterior ao inicio previsto");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(solicitante);
        reserva.setMatriculaSolicitante(solicitante.getMatricula().trim());
        reserva.setVeiculo(veiculo);
        reserva.setDataHoraSolicitacao(LocalDateTime.now());
        reserva.setDataHoraInicioPrevista(inicio);
        reserva.setDataHoraFimEstimada(fim);
        String justificativa = dto.getJustificativa() == null ? "" : dto.getJustificativa().trim();
        if (justificativa.isEmpty()) {
            throw new IllegalArgumentException("Justificativa e obrigatoria");
        }

        reserva.setOrigem(dto.getOrigem().trim());
        reserva.setDestino(dto.getDestino().trim());
        reserva.setJustificativa(justificativa);
        reserva.setOrigemLat(dto.getOrigemLat());
        reserva.setOrigemLng(dto.getOrigemLng());
        reserva.setDestinoLat(dto.getDestinoLat());
        reserva.setDestinoLng(dto.getDestinoLng());
        reserva.setStatusReserva(StatusReserva.SOLICITADA);

        Reserva salva = reservaRepository.save(reserva);
        auditoriaService.registrar(
                "RESERVA_CRIADA",
                solicitante.getNome(),
                "Reserva #" + salva.getId(),
                "Solicitada",
                "info",
                null,
                "Solicitante criou reserva para o veiculo " + veiculo.getPlaca());
        notificationEmailService.enviarReservaCriada(salva);
        return ReservaResponseDTO.fromEntity(salva);
    }

    @Transactional //Adicionei um teste para ver se o texto do motivo veio nulo ou vazio (isBlank()). Se veio vazio, o sistema joga um erro na tela e não deixa reprovar sem justificativa.
    public ReservaResponseDTO aprovar(Long reservaId, DecisaoReservaRequestDTO dto) {
        Reserva reserva = buscarSolicitada(reservaId);
        
        boolean conflito = reservaRepository.existeReservaConcorrente(
                reserva.getVeiculo(), 
                reserva.getDataHoraInicioPrevista(), 
                reserva.getDataHoraFimEstimada()
        );
        if (conflito) {
            throw new IllegalArgumentException("Não é possível aprovar: o veículo já possui uma reserva ativa neste horário.");
        }

        reserva.setStatusReserva(StatusReserva.APROVADA);
        Reserva salva = reservaRepository.save(reserva);
        registrarDecisao("RESERVA_APROVADA", salva, dto, "Aprovada", "success");
        notificationEmailService.enviarReservaAprovadaSolicitante(salva);
        notificationEmailService.enviarReservaAprovadaMotorista(salva);
        return ReservaResponseDTO.fromEntity(salva);
    }

    @Transactional //Adicionei um teste para ver se o texto do motivo veio nulo ou vazio (isBlank()). Se veio vazio, o sistema joga um erro na tela e não deixa reprovar sem justificativa.
    public ReservaResponseDTO reprovar(Long reservaId, DecisaoReservaRequestDTO dto) {
        Reserva reserva = buscarSolicitada(reservaId);
        
        if (dto == null || dto.getMotivo() == null || dto.getMotivo().isBlank()) {
            throw new IllegalArgumentException("O motivo da reprovação é obrigatório.");
        }

        reserva.setStatusReserva(StatusReserva.REPROVADA);
        Reserva salva = reservaRepository.save(reserva);
        String motivo = dto == null ? null : dto.getMotivo();
        registrarDecisao("RESERVA_REPROVADA", salva, dto, "Reprovada", "warning");
        notificationEmailService.enviarReservaReprovada(salva, motivo);
        return ReservaResponseDTO.fromEntity(salva);
    }   

    @Transactional
    public ReservaResponseDTO cancelar(Long reservaId, DecisaoReservaRequestDTO dto) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada com id: " + reservaId));
        if (reserva.getStatusReserva() == StatusReserva.CONCLUIDA || reserva.getStatusReserva() == StatusReserva.EM_USO) {
            throw new IllegalArgumentException("Reserva em uso ou concluida nao pode ser cancelada");
        }
        reserva.setStatusReserva(StatusReserva.CANCELADA);
        Reserva salva = reservaRepository.save(reserva);
        String motivo = dto == null ? null : dto.getMotivo();
        registrarDecisao("RESERVA_CANCELADA", salva, dto, "Cancelada", "warning");
        notificationEmailService.enviarReservaCancelada(salva, motivo);
        return ReservaResponseDTO.fromEntity(salva);
    }

    @Transactional
    public void excluirDoHistorico(Long reservaId, Long idUsuario) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada com id: " + reservaId));

        if (reserva.getStatusReserva() != StatusReserva.CANCELADA) {
            throw new IllegalArgumentException("Apenas reservas canceladas podem ser removidas do historico");
        }

        if (idUsuario != null && !idUsuario.equals(reserva.getUsuario().getId())) {
            throw new IllegalArgumentException("Reserva nao pertence ao solicitante informado");
        }

        if (registroUsoRepository.existsByIdReserva(reservaId)) {
            throw new IllegalArgumentException("Reserva com registro de uso nao pode ser removida do historico");
        }

        auditoriaService.registrar(
                "RESERVA_EXCLUIDA_HISTORICO",
                reserva.getUsuario().getNome(),
                "Reserva #" + reserva.getId(),
                "Removida",
                "info",
                null,
                "Solicitante removeu reserva cancelada do historico");

        reservaRepository.delete(reserva);
    }

    private Reserva buscarSolicitada(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada com id: " + reservaId));
        if (reserva.getStatusReserva() != StatusReserva.SOLICITADA) {
            throw new IllegalArgumentException("Apenas reservas solicitadas podem receber decisao do gestor");
        }
        return reserva;
    }

    private void registrarDecisao(
            String acao, Reserva reserva, DecisaoReservaRequestDTO dto, String status, String severidade) {
        String ator = "Gestor";
        if (dto != null && dto.getIdGestor() != null) {
            ator = usuarioRepository.findById(dto.getIdGestor()).map(Usuario::getNome).orElse(ator);
        }
        String motivo = dto == null || dto.getMotivo() == null || dto.getMotivo().isBlank()
                ? "Sem observacoes"
                : dto.getMotivo().trim();
        auditoriaService.registrar(
                acao,
                ator,
                "Reserva #" + reserva.getId(),
                status,
                severidade,
                null,
                motivo);
    }

    private StatusReserva parseStatus(String raw) {
        try {
            return StatusReserva.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status de reserva invalido");
        }
    }

    private LocalDateTime parseDateTime(String raw, String campo) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(campo + " e obrigatorio");
        }
        try {
            return LocalDateTime.parse(raw.trim());
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(campo + " invalido; use formato ISO 8601");
        }
    }
}
