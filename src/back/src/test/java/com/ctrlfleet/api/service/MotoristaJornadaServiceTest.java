package com.ctrlfleet.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ctrlfleet.api.domain.enums.PapelUsuario;
import com.ctrlfleet.api.domain.enums.StatusReserva;
import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.model.ItemChecklist;
import com.ctrlfleet.api.domain.model.RegistroUso;
import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.TipoInspecao;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.motorista.FinalizarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.IniciarCorridaRequestDTO;
import com.ctrlfleet.api.dto.motorista.RegistrarChecklistParcialRequestDTO;
import com.ctrlfleet.api.repository.CarroChecklistRepository;
import com.ctrlfleet.api.repository.ItemChecklistRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.ReservaRepository;
import com.ctrlfleet.api.repository.TipoInspecaoRepository;
import com.ctrlfleet.api.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class MotoristaJornadaServiceTest {

    private ReservaRepository reservaRepository;
    private UsuarioRepository usuarioRepository;
    private RegistroUsoRepository registroUsoRepository;
    private ItemChecklistRepository itemChecklistRepository;
    private TipoInspecaoRepository tipoInspecaoRepository;
    private CarroChecklistRepository carroChecklistRepository;
    private AuditoriaService auditoriaService;
    private MotoristaJornadaService service;

    @BeforeEach
    void setUp() {
        reservaRepository = mock(ReservaRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        registroUsoRepository = mock(RegistroUsoRepository.class);
        itemChecklistRepository = mock(ItemChecklistRepository.class);
        tipoInspecaoRepository = mock(TipoInspecaoRepository.class);
        carroChecklistRepository = mock(CarroChecklistRepository.class);
        auditoriaService = mock(AuditoriaService.class);

        when(tipoInspecaoRepository.findByFaseOrderByIdAsc("SAIDA"))
                .thenReturn(List.of(tipo(4L, "Limpeza", "SAIDA"), tipo(5L, "Mecânica", "SAIDA")));
        when(tipoInspecaoRepository.findByFaseOrderByIdAsc("RETORNO"))
                .thenReturn(List.of(tipo(8L, "Estado do veículo", "RETORNO")));

        service = new MotoristaJornadaService(
                reservaRepository,
                usuarioRepository,
                registroUsoRepository,
                itemChecklistRepository,
                tipoInspecaoRepository,
                carroChecklistRepository,
                auditoriaService);
    }

    @Test
    void registrarChecklistParcialSaidaSalvaUmTipoPorVez() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        Usuario motorista = motoristaAtivo();
        List<ItemChecklist> itensLimpeza = List.of(item(1L, "Limpeza interna"), item(2L, "Limpeza externa"));
        RegistrarChecklistParcialRequestDTO dto = parcialRequest(List.of(1L, 2L), Map.of(), 12500.0);

        prepararCenario(reserva, motorista);
        when(tipoInspecaoRepository.findById(4L)).thenReturn(Optional.of(tipo(4L, "Limpeza", "SAIDA")));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(4L)).thenReturn(itensLimpeza);
        when(registroUsoRepository.existsByIdReservaAndDataRetornoIsNull(10L)).thenReturn(false);
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.empty());
        when(registroUsoRepository.save(any(RegistroUso.class))).thenAnswer(invocation -> {
            RegistroUso registro = invocation.getArgument(0);
            registro.setId(44L);
            return registro;
        });
        when(carroChecklistRepository.countByRegistroUsoIdAndTipoInspecaoId(44L, 4L)).thenReturn(2L);
        when(carroChecklistRepository.countByRegistroUsoIdAndTipoInspecaoId(44L, 5L)).thenReturn(0L);

        var response = service.registrarChecklistParcialSaida(10L, 4L, dto);

        assertThat(response.getId()).isEqualTo(44L);
        verify(carroChecklistRepository, times(2)).save(any());
    }

    @Test
    void iniciarTrajetoExigeTodosTiposDeSaidaConcluidos() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        Usuario motorista = motoristaAtivo();
        RegistroUso registro = registroAberto(reserva, motorista, 12500.0);

        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(motorista));
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.of(registro));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(4L))
                .thenReturn(List.of(item(1L, "Limpeza interna")));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(5L))
                .thenReturn(List.of(item(2L, "Pneus")));
        when(carroChecklistRepository.countByRegistroUsoIdAndTipoInspecaoId(99L, 4L)).thenReturn(1L);
        when(carroChecklistRepository.countByRegistroUsoIdAndTipoInspecaoId(99L, 5L)).thenReturn(0L);

        IniciarCorridaRequestDTO dto = new IniciarCorridaRequestDTO();
        dto.setIdMotorista(5L);

        assertThatThrownBy(() -> service.iniciarTrajeto(10L, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("checklist");
    }

    private void prepararCenario(Reserva reserva, Usuario motorista) {
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(motorista));
        when(registroUsoRepository.buscarUltimaQuilometragemVeiculo(reserva.getVeiculo().getId()))
                .thenReturn(Optional.of(12000.0));
        when(carroChecklistRepository.existsByRegistroUsoIdAndItemId(any(), any())).thenReturn(false);
    }

    private RegistrarChecklistParcialRequestDTO parcialRequest(
            List<Long> itens, Map<Long, String> observacoes, Double quilometragem) {
        RegistrarChecklistParcialRequestDTO dto = new RegistrarChecklistParcialRequestDTO();
        dto.setIdMotorista(5L);
        dto.setQuilometragemSaida(quilometragem);
        dto.setItensChecklist(itens);
        dto.setObservacoesChecklist(observacoes);
        return dto;
    }

    private Reserva reservaAprovada(LocalDateTime inicio, LocalDateTime fim) {
        Veiculo veiculo = new Veiculo("ABC1D23", "Onix", "Chevrolet", 2022, "Saúde");
        veiculo.setId(7L);
        veiculo.setStatus(StatusVeiculo.DISPONIVEL);

        Reserva reserva = new Reserva();
        ReflectionTestUtils.setField(reserva, "id", 10L);
        reserva.setUsuario(new Usuario(3L, "Solicitante", "solicitante@email.com", "123"));
        reserva.setVeiculo(veiculo);
        reserva.setOrigem("Garagem Central");
        reserva.setDestino("Almoxarifado");
        reserva.setStatusReserva(StatusReserva.APROVADA);
        reserva.setDataHoraSolicitacao(LocalDateTime.now().minusDays(1));
        reserva.setDataHoraInicioPrevista(inicio);
        reserva.setDataHoraFimEstimada(fim);
        return reserva;
    }

    private Usuario motoristaAtivo() {
        Usuario usuario = new Usuario(5L, "Motorista", "motorista@email.com", "123");
        usuario.setPapel(PapelUsuario.ROLE_MOTORISTA);
        usuario.setStatus("ATIVO");
        return usuario;
    }

    private ItemChecklist item(Long id, String nome) {
        ItemChecklist item = new ItemChecklist();
        ReflectionTestUtils.setField(item, "id", id);
        ReflectionTestUtils.setField(item, "nome", nome);
        return item;
    }

    private TipoInspecao tipo(Long id, String nome, String fase) {
        TipoInspecao tipo = new TipoInspecao();
        ReflectionTestUtils.setField(tipo, "id", id);
        ReflectionTestUtils.setField(tipo, "nome", nome);
        ReflectionTestUtils.setField(tipo, "descricao", "Descrição");
        ReflectionTestUtils.setField(tipo, "fase", fase);
        return tipo;
    }

    private RegistroUso registroAberto(Reserva reserva, Usuario motorista, double kmSaida) {
        RegistroUso registro =
                new RegistroUso(reserva.getVeiculo(), motorista, LocalDateTime.now().minusHours(1), kmSaida);
        registro.setIdReserva(10L);
        registro.setId(99L);
        return registro;
    }
}
