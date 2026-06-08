package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.PrioridadeAlerta;
import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.model.Alerta;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.manutencao.AlertaResponseDTO;
import com.ctrlfleet.api.repository.AlertaRepository;
import com.ctrlfleet.api.repository.ManutencaoRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class AlertaPreventivosService {

    // Regras fixas: alerta se a última manutenção foi há mais de 90 dias
    // ou se o veículo nunca teve manutenção registrada
    private static final int LIMITE_DIAS = 90;

    private final VeiculoRepository veiculoRepository;
    private final ManutencaoRepository manutencaoRepository;
    private final AlertaRepository alertaRepository;

    public AlertaPreventivosService(VeiculoRepository veiculoRepository,
            ManutencaoRepository manutencaoRepository,
            AlertaRepository alertaRepository) {
        this.veiculoRepository = veiculoRepository;
        this.manutencaoRepository = manutencaoRepository;
        this.alertaRepository = alertaRepository;
    }

    /**
     * Verifica todos os veículos e gera alertas preventivos para os que
     * estão há mais de 90 dias sem manutenção concluída.
     * Evita duplicidade: não cria alerta se já existe um não lido para o veículo.
     */
    public List<AlertaResponseDTO> verificarEGerarAlertas() {
        List<Veiculo> veiculos = veiculoRepository.findAll();
        List<AlertaResponseDTO> alertasGerados = new ArrayList<>();

        for (Veiculo veiculo : veiculos) {
            // Pula veículos já bloqueados ou em manutenção ativa
            if (veiculo.getStatus() != null) {
                String status = veiculo.getStatus().name();
                if (status.equals("BLOQUEADO") || status.equals("MANUTENCAO"))
                    continue;
            }

            Optional<Manutencao> ultimaManutencao = manutencaoRepository
                    .findTopByVeiculo_IdAndStatusOrderByDataRealizadaDesc(
                            veiculo.getId(), StatusManutencao.CONCLUIDA);

            boolean precisaAlerta = false;
            String mensagem;

            if (ultimaManutencao.isEmpty()) {
                // Nunca teve manutenção registrada
                precisaAlerta = true;
                mensagem = "Veículo " + veiculo.getPlaca() + " (" + veiculo.getModelo()
                        + ") não possui manutenção preventiva registrada.";
            } else {
                LocalDate dataUltima = ultimaManutencao.get().getDataRealizada();
                if (dataUltima != null) {
                    long diasDesdeUltima = LocalDate.now().toEpochDay() - dataUltima.toEpochDay();
                    if (diasDesdeUltima >= LIMITE_DIAS) {
                        precisaAlerta = true;
                        mensagem = "Veículo " + veiculo.getPlaca() + " (" + veiculo.getModelo()
                                + ") está há " + diasDesdeUltima + " dias sem revisão preventiva.";
                    } else {
                        mensagem = null;
                    }
                } else {
                    mensagem = null;
                }
            }

            if (!precisaAlerta || mensagem == null)
                continue;

            // Evita duplicidade: checa se já existe alerta não lido para este veículo
            boolean jaTemAlerta = alertaRepository
                    .findByVeiculo_Motorista_IdAndLidoFalseOrderByDataGeracaoDesc(
                            veiculo.getId())
                    .stream()
                    .anyMatch(a -> a.getMensagem() != null
                            && a.getMensagem().contains(veiculo.getPlaca())
                            && a.getMensagem().contains("preventiv"));

            if (jaTemAlerta)
                continue;

            // Cria e salva o alerta
            Alerta alerta = new Alerta();
            alerta.setVeiculo(veiculo);
            alerta.setPrioridade(PrioridadeAlerta.MEDIA);
            alerta.setMensagem(mensagem);
            alerta.setDataGeracao(LocalDateTime.now());
            alerta.setLido(false);
            alertaRepository.save(alerta);

            alertasGerados.add(AlertaResponseDTO.fromEntity(alerta));
        }

        return alertasGerados;
    }

    /**
     * Lista todos os alertas preventivos não lidos do banco.
     */
    public List<AlertaResponseDTO> listarAlertasPreventivos() {
        return alertaRepository.findAll()
                .stream()
                .filter(a -> !a.isLido())
                .filter(a -> a.getMensagem() != null && a.getMensagem().toLowerCase().contains("preventiv"))
                .sorted((a, b) -> b.getDataGeracao().compareTo(a.getDataGeracao()))
                .map(AlertaResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Marca um alerta como lido.
     */
    public void marcarComoLido(Long alertaId) {
        alertaRepository.findById(alertaId).ifPresent(a -> {
            a.setLido(true);
            alertaRepository.save(a);
        });
    }
}