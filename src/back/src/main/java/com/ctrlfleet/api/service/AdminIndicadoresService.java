package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.enums.StatusReserva;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.Documentacao;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.indicadores.AdminIndicadoresDTO;
import com.ctrlfleet.api.dto.manutencao.IndicadoresManutencaoDTO;
import com.ctrlfleet.api.repository.DocumentacaoRepository;
import com.ctrlfleet.api.repository.ReservaRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminIndicadoresService {

    private final VeiculoRepository veiculoRepository;
    private final DocumentacaoRepository documentacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final GestorManutencaoService gestorManutencaoService;

    public AdminIndicadoresService(
            VeiculoRepository veiculoRepository,
            DocumentacaoRepository documentacaoRepository,
            UsuarioRepository usuarioRepository,
            ReservaRepository reservaRepository,
            GestorManutencaoService gestorManutencaoService) {
        this.veiculoRepository = veiculoRepository;
        this.documentacaoRepository = documentacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
        this.gestorManutencaoService = gestorManutencaoService;
    }

    @Transactional(readOnly = true)
    public AdminIndicadoresDTO calcular(LocalDate inicio, LocalDate fim) {
        LocalDate hoje = LocalDate.now();
        LocalDate periodoInicio = inicio != null ? inicio : hoje.withDayOfMonth(1);
        LocalDate periodoFim = fim != null ? fim : hoje;

        AdminIndicadoresDTO dto = new AdminIndicadoresDTO();
        dto.setPeriodoInicio(periodoInicio);
        dto.setPeriodoFim(periodoFim);

        calcularFrota(dto, hoje);
        calcularPessoas(dto, hoje);
        calcularManutencao(dto, periodoInicio, periodoFim);
        calcularReservas(dto, periodoInicio, periodoFim);

        return dto;
    }

    private void calcularFrota(AdminIndicadoresDTO dto, LocalDate hoje) {
        List<Veiculo> veiculos = veiculoRepository.findAll();
        long totaisAtivos = veiculos.stream()
                .filter(v -> v.getStatus() != StatusVeiculo.DESATIVADO)
                .count();
        long disponiveis = veiculos.stream()
                .filter(v -> v.getStatus() == StatusVeiculo.DISPONIVEL)
                .count();

        dto.setVeiculosDisponiveis(disponiveis);
        dto.setVeiculosTotaisAtivos(totaisAtivos);
        dto.setTaxaDisponibilidadeOperacional(
                totaisAtivos == 0 ? 0d : (disponiveis * 100.0 / totaisAtivos));

        List<Documentacao> docs = documentacaoRepository.findAll();
        long totalDocs = docs.size();
        long vigentes = docs.stream()
                .filter(d -> d.getDataVencimento() != null && !d.getDataVencimento().isBefore(hoje))
                .count();

        dto.setTotalDocumentos(totalDocs);
        dto.setDocumentosVigentes(vigentes);
        dto.setIndiceRegularidadeDocumental(
                totalDocs == 0 ? 100d : (vigentes * 100.0 / totalDocs));
    }

    private void calcularPessoas(AdminIndicadoresDTO dto, LocalDate hoje) {
        List<Usuario> todos = usuarioRepository.findAllWithMotorista();

        long naoInativos = todos.stream()
                .filter(u -> !"INATIVO".equals(u.getStatus()))
                .count();
        long ativos = todos.stream()
                .filter(u -> "ATIVO".equals(u.getStatus()))
                .count();

        dto.setUsuariosAtivos(ativos);
        dto.setUsuariosNaoInativos(naoInativos);
        dto.setTaxaContasRegularizadas(
                naoInativos == 0 ? 0d : (ativos * 100.0 / naoInativos));

        List<Usuario> motoristas = todos.stream()
                .filter(u -> "motorista".equals(u.getTipoCadastro()))
                .toList();
        long totalMotoristas = motoristas.size();
        long aptos = motoristas.stream()
                .filter(u -> "ATIVO".equals(u.getStatus())
                        && u.getMotorista() != null
                        && u.getMotorista().getValidadeCnh() != null
                        && !u.getMotorista().getValidadeCnh().isBefore(hoje))
                .count();

        dto.setTotalMotoristas(totalMotoristas);
        dto.setMotoristasAptos(aptos);
        dto.setTaxaMotoristasAptos(
                totalMotoristas == 0 ? 0d : (aptos * 100.0 / totalMotoristas));
    }

    private void calcularManutencao(AdminIndicadoresDTO dto, LocalDate inicio, LocalDate fim) {
        IndicadoresManutencaoDTO m = gestorManutencaoService.calcularIndicadores(inicio, fim);
        dto.setTaxaConclusaoManutencoes(m.getTaxaConclusao());
        dto.setManutencoesConcluidas(m.getTotalConcluidas());
        dto.setManutencoesAbertas(m.getTotalAbertas());
        dto.setIndiceAderenciaPreventiva(m.getIndiceAderenciaPreventiva());
        dto.setVeiculosAtivosManutencao(m.getVeiculosAtivos());
        dto.setVeiculosSemPreventivaCritica(
                m.getVeiculosAtivos() - m.getVeiculosComPreventivaCritica());
    }

    private void calcularReservas(AdminIndicadoresDTO dto, LocalDate inicio, LocalDate fim) {
        LocalDateTime dtInicio = inicio.atStartOfDay();
        LocalDateTime dtFim = fim.atTime(LocalTime.MAX);

        List<Reserva> todas = reservaRepository.findAllByOrderByDataHoraInicioPrevistaDesc();
        List<Reserva> periodo = todas.stream()
                .filter(r -> r.getDataHoraSolicitacao() != null
                        && !r.getDataHoraSolicitacao().isBefore(dtInicio)
                        && !r.getDataHoraSolicitacao().isAfter(dtFim))
                .toList();

        long aprovadas = periodo.stream()
                .filter(r -> r.getStatusReserva() == StatusReserva.APROVADA)
                .count();
        long reprovadas = periodo.stream()
                .filter(r -> r.getStatusReserva() == StatusReserva.REPROVADA)
                .count();
        long analisadas = aprovadas + reprovadas;

        dto.setReservasAprovadas(aprovadas);
        dto.setReservasAnalisadas(analisadas);
        dto.setTaxaAprovacaoReservas(
                analisadas == 0 ? 0d : (aprovadas * 100.0 / analisadas));

        long concluidas = periodo.stream()
                .filter(r -> r.getStatusReserva() == StatusReserva.CONCLUIDA)
                .count();
        long emUso = periodo.stream()
                .filter(r -> r.getStatusReserva() == StatusReserva.EM_USO)
                .count();
        long elegiveis = aprovadas + emUso + concluidas;

        dto.setReservasConcluidas(concluidas);
        dto.setReservasElegiveisParaConclusao(elegiveis);
        dto.setTaxaConclusaoViagens(
                elegiveis == 0 ? 0d : (concluidas * 100.0 / elegiveis));
    }
}
