package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.StatusReserva;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.reserva.DecisaoReservaRequestDTO;
import com.ctrlfleet.api.dto.reserva.ReservaRequestDTO;
import com.ctrlfleet.api.dto.reserva.ReservaResponseDTO;
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
    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;
    private final AuditoriaService auditoriaService;

    public ReservaService(
            ReservaRepository reservaRepository,
            UsuarioRepository usuarioRepository,
            VeiculoRepository veiculoRepository,
            AuditoriaService auditoriaService) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listar(String status) {
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
        Veiculo veiculo = veiculoRepository.findById(dto.getIdVeiculo())
                .orElseThrow(() -> new IllegalArgumentException("Veiculo nao encontrado com id: " + dto.getIdVeiculo()));

        LocalDateTime inicio = parseDateTime(dto.getDataHoraInicioPrevista(), "dataHoraInicioPrevista");
        LocalDateTime fim = parseDateTime(dto.getDataHoraFimEstimada(), "dataHoraFimEstimada");
        if (!fim.isAfter(inicio)) {
            throw new IllegalArgumentException("Fim estimado deve ser posterior ao inicio previsto");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(solicitante);
        reserva.setVeiculo(veiculo);
        reserva.setDataHoraSolicitacao(LocalDateTime.now());
        reserva.setDataHoraInicioPrevista(inicio);
        reserva.setDataHoraFimEstimada(fim);
        reserva.setOrigem(dto.getOrigem().trim());
        reserva.setDestino(dto.getDestino().trim());
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
        return ReservaResponseDTO.fromEntity(salva);
    }

    @Transactional
    public ReservaResponseDTO aprovar(Long reservaId, DecisaoReservaRequestDTO dto) {
        Reserva reserva = buscarSolicitada(reservaId);
        reserva.setStatusReserva(StatusReserva.APROVADA);
        registrarDecisao("RESERVA_APROVADA", reserva, dto, "Aprovada", "success");
        return ReservaResponseDTO.fromEntity(reserva);
    }

    @Transactional
    public ReservaResponseDTO reprovar(Long reservaId, DecisaoReservaRequestDTO dto) {
        Reserva reserva = buscarSolicitada(reservaId);
        reserva.setStatusReserva(StatusReserva.REPROVADA);
        registrarDecisao("RESERVA_REPROVADA", reserva, dto, "Reprovada", "warning");
        return ReservaResponseDTO.fromEntity(reserva);
    }

    @Transactional
    public ReservaResponseDTO cancelar(Long reservaId, DecisaoReservaRequestDTO dto) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada com id: " + reservaId));
        if (reserva.getStatusReserva() == StatusReserva.CONCLUIDA || reserva.getStatusReserva() == StatusReserva.EM_USO) {
            throw new IllegalArgumentException("Reserva em uso ou concluida nao pode ser cancelada");
        }
        reserva.setStatusReserva(StatusReserva.CANCELADA);
        registrarDecisao("RESERVA_CANCELADA", reserva, dto, "Cancelada", "warning");
        return ReservaResponseDTO.fromEntity(reserva);
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
