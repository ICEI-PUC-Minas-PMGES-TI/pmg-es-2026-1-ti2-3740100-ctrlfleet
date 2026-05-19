package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
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

    private static final String STATUS_PADRAO = "SOLICITADA";

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;

    public ReservaService(
            ReservaRepository reservaRepository,
            UsuarioRepository usuarioRepository,
            VeiculoRepository veiculoRepository) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarTodas() {
        return reservaRepository.findAllDetailedOrderBySolicitacaoDesc().stream()
                .map(ReservaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public ReservaResponseDTO criar(ReservaRequestDTO dto) {
        Usuario usuario = buscarUsuario(dto.getIdUsuario(), "Usuário solicitante");
        Veiculo veiculo = buscarVeiculo(dto.getIdVeiculo());
        Usuario motorista = buscarUsuario(dto.getIdMotorista(), "Motorista");

        if (motorista.getPapel() != PapelUsuario.ROLE_MOTORISTA) {
            throw new IllegalArgumentException("O usuário selecionado não possui perfil de motorista");
        }

        LocalDateTime inicio = parseDateTime(dto.getDatahoraInicioPrevista(), "datahoraInicioPrevista");
        LocalDateTime fim = parseDateTime(dto.getDatahoraFimEstimada(), "datahoraFimEstimada");

        if (!fim.isAfter(inicio)) {
            throw new IllegalArgumentException("O fim estimado deve ser posterior ao início previsto");
        }

        String status =
                dto.getStatusReserva() == null || dto.getStatusReserva().isBlank()
                        ? STATUS_PADRAO
                        : dto.getStatusReserva().trim().toUpperCase();

        Reserva reserva =
                new Reserva(
                        usuario,
                        veiculo,
                        motorista,
                        LocalDateTime.now(),
                        inicio,
                        fim,
                        dto.getOrigem().trim(),
                        dto.getDestino().trim(),
                        status);

        return ReservaResponseDTO.fromEntity(reservaRepository.save(reserva));
    }

    private Usuario buscarUsuario(Long id, String label) {
        return usuarioRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException(label + " não encontrado com id: " + id));
    }

    private Veiculo buscarVeiculo(Long id) {
        return veiculoRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veículo não encontrado com id: " + id));
    }

    private LocalDateTime parseDateTime(String raw, String campo) {
        try {
            return LocalDateTime.parse(raw.trim());
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                    campo + " inválida; use formato ISO 8601 (ex: 2026-05-06T14:30)");
        }
    }
}
