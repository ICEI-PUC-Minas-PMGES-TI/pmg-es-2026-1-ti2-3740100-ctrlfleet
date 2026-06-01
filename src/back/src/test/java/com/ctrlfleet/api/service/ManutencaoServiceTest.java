package com.ctrlfleet.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ctrlfleet.api.domain.enums.StatusManutencao;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.enums.TipoManutencao;
import com.ctrlfleet.api.domain.model.Manutencao;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.manutencao.ConcluirManutencaoRequestDTO;
import com.ctrlfleet.api.repository.AlertaRepository;
import com.ctrlfleet.api.repository.ManutencaoRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import com.ctrlfleet.api.repository.VeiculoRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ManutencaoServiceTest {

    private ManutencaoRepository manutencaoRepository;
    private RegistroUsoRepository registroUsoRepository;
    private VeiculoRepository veiculoRepository;
    private AuditoriaService auditoriaService;
    private MotoristaManutencaoService service;

    @BeforeEach
    void setUp() {
        manutencaoRepository = mock(ManutencaoRepository.class);
        AlertaRepository alertaRepository = mock(AlertaRepository.class);
        veiculoRepository = mock(VeiculoRepository.class);
        UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
        registroUsoRepository = mock(RegistroUsoRepository.class);
        auditoriaService = mock(AuditoriaService.class);

        service = new MotoristaManutencaoService(
                manutencaoRepository,
                alertaRepository,
                veiculoRepository,
                usuarioRepository,
                registroUsoRepository,
                auditoriaService);
    }

    @Test
    void concluirManutencaoPreencheDadosELiberaVeiculoSemImpedimentos() {
        Manutencao manutencao = manutencao(StatusManutencao.EM_ANDAMENTO, StatusVeiculo.MANUTENCAO);
        ConcluirManutencaoRequestDTO request = concluirRequest();

        when(manutencaoRepository.findById(55L)).thenReturn(Optional.of(manutencao));
        when(registroUsoRepository.existsByVeiculoIdAndDataRetornoIsNull(7L)).thenReturn(false);
        when(manutencaoRepository.existsByVeiculo_IdAndStatusInAndIdNot(eq(7L), any(), eq(55L)))
                .thenReturn(false);
        when(manutencaoRepository.save(any(Manutencao.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(registroUsoRepository.buscarUltimaQuilometragemVeiculo(7L)).thenReturn(Optional.of(45120d));

        var response = service.concluirManutencao(55L, request);

        assertThat(manutencao.getStatus()).isEqualTo(StatusManutencao.CONCLUIDA);
        assertThat(manutencao.getServicosRealizados()).isEqualTo("Troca de óleo, filtros e teste de rodagem.");
        assertThat(manutencao.getCustoTotal()).isEqualTo(850d);
        assertThat(manutencao.getDataConclusao()).isEqualTo(LocalDate.of(2026, 5, 28));
        assertThat(manutencao.getGarantia()).isEqualTo("90 dias");
        assertThat(manutencao.getComprovanteNf()).isEqualTo("NF-12345");
        assertThat(manutencao.getVeiculo().getStatus()).isEqualTo(StatusVeiculo.DISPONIVEL);
        assertThat(response.getStatus()).isEqualTo(StatusManutencao.CONCLUIDA);
        assertThat(response.getQuilometragemAtual()).isEqualTo(45120d);
        verify(veiculoRepository).save(manutencao.getVeiculo());
        verify(auditoriaService).registrar(
                eq("CONCLUIR_MANUTENCAO"),
                eq("Gestor"),
                eq("Manutenção #55"),
                eq("CONCLUIDA"),
                eq("success"),
                eq(null),
                any());
    }

    @Test
    void concluirManutencaoMantemVeiculoEmManutencaoQuandoExisteOutroImpedimento() {
        Manutencao manutencao = manutencao(StatusManutencao.EM_ANDAMENTO, StatusVeiculo.MANUTENCAO);

        when(manutencaoRepository.findById(55L)).thenReturn(Optional.of(manutencao));
        when(registroUsoRepository.existsByVeiculoIdAndDataRetornoIsNull(7L)).thenReturn(false);
        when(manutencaoRepository.existsByVeiculo_IdAndStatusInAndIdNot(eq(7L), any(), eq(55L)))
                .thenReturn(true);
        when(manutencaoRepository.save(any(Manutencao.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(registroUsoRepository.buscarUltimaQuilometragemVeiculo(7L)).thenReturn(Optional.empty());

        service.concluirManutencao(55L, concluirRequest());

        assertThat(manutencao.getStatus()).isEqualTo(StatusManutencao.CONCLUIDA);
        assertThat(manutencao.getVeiculo().getStatus()).isEqualTo(StatusVeiculo.MANUTENCAO);
        verify(veiculoRepository, never()).save(any());
    }

    @Test
    void concluirManutencaoRejeitaCustoNegativo() {
        Manutencao manutencao = manutencao(StatusManutencao.EM_ANDAMENTO, StatusVeiculo.MANUTENCAO);
        ConcluirManutencaoRequestDTO request = concluirRequest();
        request.setCustoTotal(-1d);

        when(manutencaoRepository.findById(55L)).thenReturn(Optional.of(manutencao));

        assertThatThrownBy(() -> service.concluirManutencao(55L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Custo total");
        verify(manutencaoRepository, never()).save(any());
    }

    @Test
    void concluirManutencaoExigeComprovante() {
        Manutencao manutencao = manutencao(StatusManutencao.EM_ANDAMENTO, StatusVeiculo.MANUTENCAO);
        ConcluirManutencaoRequestDTO request = concluirRequest();
        request.setComprovanteNf(" ");

        when(manutencaoRepository.findById(55L)).thenReturn(Optional.of(manutencao));

        assertThatThrownBy(() -> service.concluirManutencao(55L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Comprovante");
        verify(manutencaoRepository, never()).save(any());
    }

    private Manutencao manutencao(StatusManutencao statusManutencao, StatusVeiculo statusVeiculo) {
        Veiculo veiculo = new Veiculo("ABC1D23", "Onix", "Chevrolet", 2022, "Saúde");
        veiculo.setId(7L);
        veiculo.setStatus(statusVeiculo);

        Manutencao manutencao = new Manutencao();
        manutencao.setId(55L);
        manutencao.setVeiculo(veiculo);
        manutencao.setTipoManutencao(TipoManutencao.CORRETIVA);
        manutencao.setDescricaoProblema("Ruído no motor em marcha lenta.");
        manutencao.setStatus(statusManutencao);
        return manutencao;
    }

    private ConcluirManutencaoRequestDTO concluirRequest() {
        ConcluirManutencaoRequestDTO request = new ConcluirManutencaoRequestDTO();
        request.setServicosRealizados(" Troca de óleo, filtros e teste de rodagem. ");
        request.setCustoTotal(850d);
        request.setDataConclusao(LocalDate.of(2026, 5, 28));
        request.setGarantia(" 90 dias ");
        request.setComprovanteNf(" NF-12345 ");
        return request;
    }
}
