package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.RegistroUso;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.dto.registrouso.FinalizarCorridaRequestDTO;
import com.ctrlfleet.api.dto.registrouso.RegistroUsoResponseDTO;
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
public class RegistroUsoService {

    private final RegistroUsoRepository registroUsoRepository;
    private final ReservaRepository reservaRepository;
    private final VeiculoRepository veiculoRepository;
    private final UsuarioRepository usuarioRepository;

    public RegistroUsoService(
            RegistroUsoRepository registroUsoRepository,
            ReservaRepository reservaRepository,
            VeiculoRepository veiculoRepository,
            UsuarioRepository usuarioRepository) {
        this.registroUsoRepository = registroUsoRepository;
        this.reservaRepository = reservaRepository;
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
     * Lista os eventos associados a uma reserva, permitindo montar uma timeline operacional.
     */
    public List<RegistroUsoResponseDTO> listarPorReserva(Long reservaId) {
        List<RegistroUso> registros =
                registroUsoRepository.findByIdReservaOrderByDataSaidaDesc(reservaId);

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

        validarVeiculoPodeSerFinalizado(veiculo);
        validarMotoristaAtivo(motorista);
        validarQuilometragens(dto);

        if (dataRetorno.isBefore(dataSaida)) {
            throw new IllegalArgumentException(
                    "A data de retorno deve ser posterior à data de saída");
        }

        if (dataRetorno.isAfter(LocalDateTime.now().plusMinutes(1))) {
            throw new IllegalArgumentException(
                    "A data de retorno não pode estar no futuro");
        }

        RegistroUso registro =
                new RegistroUso(veiculo, motorista, dataSaida, dto.getQuilometragemSaida());
        registro.setDataRetorno(dataRetorno);
        registro.setQuilometragemRetorno(dto.getQuilometragemRetorno());
        registro.setIdReserva(dto.getIdReserva());
        registro.setObservacoesVeiculo(
                dto.getObservacoesVeiculo() != null ? dto.getObservacoesVeiculo().trim() : null);

        RegistroUso salvo = registroUsoRepository.save(registro);
        veiculo.setStatus(StatusVeiculo.DISPONIVEL);
        veiculoRepository.save(veiculo);
        return toResponseDTO(salvo);
    }

    private void validarVeiculoPodeSerFinalizado(Veiculo veiculo) {
        if (veiculo.getStatus() == StatusVeiculo.DESATIVADO) {
            throw new IllegalArgumentException("Não é possível finalizar uso de veículo desativado");
        }
        if (veiculo.getStatus() == StatusVeiculo.MANUTENCAO) {
            throw new IllegalArgumentException("Não é possível finalizar uso de veículo em manutenção");
        }
    }

    private void validarMotoristaAtivo(Usuario motorista) {
        if (!"ATIVO".equalsIgnoreCase(motorista.getStatus())) {
            throw new IllegalArgumentException("Motorista precisa estar ativo para finalizar o uso");
        }
    }

    private void validarQuilometragens(FinalizarCorridaRequestDTO dto) {
        if (dto.getQuilometragemSaida() < 0 || dto.getQuilometragemRetorno() < 0) {
            throw new IllegalArgumentException("Quilometragens não podem ser negativas");
        }
        if (dto.getQuilometragemRetorno() < dto.getQuilometragemSaida()) {
            throw new IllegalArgumentException(
                    "A quilometragem de retorno deve ser maior ou igual à de saída");
        }
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
        Double quilometragemPercorrida = null;
        if (registro.getQuilometragemRetorno() != null && registro.getQuilometragemSaida() != null) {
            quilometragemPercorrida =
                    registro.getQuilometragemRetorno() - registro.getQuilometragemSaida();
        }

        Veiculo veiculo = registro.getVeiculo();
        Usuario motorista = registro.getMotorista();
        String modeloVeiculo = null;
        if (veiculo != null) {
            String marca = veiculo.getMarca() != null ? veiculo.getMarca().trim() : "";
            String modelo = veiculo.getModelo() != null ? veiculo.getModelo().trim() : "";
            modeloVeiculo = (marca + " " + modelo).trim();
            if (modeloVeiculo.isEmpty()) {
                modeloVeiculo = null;
            }
        }

        String origem = null;
        String destino = null;
        String statusReserva = null;
        if (registro.getIdReserva() != null) {
            Reserva reserva = reservaRepository.findById(registro.getIdReserva()).orElse(null);
            if (reserva != null) {
                origem = reserva.getOrigem();
                destino = reserva.getDestino();
                statusReserva =
                        reserva.getStatusReserva() != null ? reserva.getStatusReserva().name() : null;
            }
        }

        return new RegistroUsoResponseDTO(
                registro.getId(),
                veiculo != null ? veiculo.getId() : null,
                veiculo != null ? veiculo.getPlaca() : null,
                modeloVeiculo,
                motorista != null ? motorista.getId() : null,
                motorista != null ? motorista.getNome() : null,
                registro.getIdReserva(),
                origem,
                destino,
                registro.getDataSaida(),
                registro.getQuilometragemSaida(),
                registro.getDataRetorno(),
                registro.getQuilometragemRetorno(),
                registro.getObservacoesVeiculo(),
                quilometragemPercorrida,
                statusReserva);
    }
}
