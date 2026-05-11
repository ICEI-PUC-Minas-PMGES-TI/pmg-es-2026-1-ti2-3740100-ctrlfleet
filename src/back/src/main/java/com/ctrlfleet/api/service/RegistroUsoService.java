package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.RegistroUso;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.registrouso.FinalizarCorridaRequestDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistroUsoService {

    private final RegistroUsoRepository registroUsoRepository;
    private final VeiculoRepository veiculoRepository;
    private final UsuarioRepository usuarioRepository;

    public RegistroUsoService(
            RegistroUsoRepository registroUsoRepository,
            VeiculoRepository veiculoRepository,
            UsuarioRepository usuarioRepository) {
        this.registroUsoRepository = registroUsoRepository;
        this.veiculoRepository = veiculoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Lista todos os registros de uso de um veículo, ordenados por data de saída (mais recente
     * primeiro).
     */
    public List<RegistroUsoResponseDTO> listarPorVeiculo(Long veiculoId) {
        List<RegistroUso> registros =
                registroUsoRepository.findByVeiculoIdOrderByDataSaidaDesc(veiculoId);

        return registros.stream().map(this::toResponseDTO).toList();
    }

    /**
     * Gera o registro de uso automaticamente ao finalizar a corrida. Recebe os dados de saída e
     * retorno e persiste o registro completo.
     */
    @Transactional
    public RegistroUsoResponseDTO finalizarCorrida(FinalizarCorridaRequestDTO dto) {

        Veiculo veiculo =
                veiculoRepository
                        .findById(dto.getIdVeiculo())
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Veículo não encontrado com id: "
                                                        + dto.getIdVeiculo()));

        Usuario motorista =
                usuarioRepository
                        .findById(dto.getIdMotorista())
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Motorista não encontrado com id: "
                                                        + dto.getIdMotorista()));

        LocalDateTime dataSaida = parseDateTime(dto.getDataSaida(), "dataSaida");
        LocalDateTime dataRetorno = parseDateTime(dto.getDataRetorno(), "dataRetorno");

        if (dataRetorno.isBefore(dataSaida)) {
            throw new IllegalArgumentException(
                    "A data de retorno deve ser posterior à data de saída");
        }

        if (dto.getQuilometragemRetorno() < dto.getQuilometragemSaida()) {
            throw new IllegalArgumentException(
                    "A quilometragem de retorno deve ser maior ou igual à de saída");
        }

        RegistroUso registro =
                new RegistroUso(veiculo, motorista, dataSaida, dto.getQuilometragemSaida());
        registro.setDataRetorno(dataRetorno);
        registro.setQuilometragemRetorno(dto.getQuilometragemRetorno());
        registro.setIdReserva(dto.getIdReserva());
        registro.setObservacoesVeiculo(
                dto.getObservacoesVeiculo() != null ? dto.getObservacoesVeiculo().trim() : null);

        RegistroUso salvo = registroUsoRepository.save(registro);
        return toResponseDTO(salvo);
    }

    private LocalDateTime parseDateTime(String raw, String campo) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(campo + " é obrigatória");
        }
        try {
            return LocalDateTime.parse(raw.trim());
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                    campo + " inválida; use formato ISO 8601 (ex: 2026-05-06T14:30:00)");
        }
    }

    private RegistroUsoResponseDTO toResponseDTO(RegistroUso registro) {
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
