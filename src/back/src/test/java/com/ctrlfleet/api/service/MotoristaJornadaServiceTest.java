package com.ctrlfleet.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import com.ctrlfleet.api.dto.motorista.IniciarTrajetoRequestDTO;
import com.ctrlfleet.api.repository.CarroChecklistRepository;
import com.ctrlfleet.api.repository.ItemChecklistRepository;
import com.ctrlfleet.api.repository.RegistroUsoRepository;
import com.ctrlfleet.api.repository.ReservaRepository;
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
    private CarroChecklistRepository carroChecklistRepository;
    private AuditoriaService auditoriaService;
    private MotoristaJornadaService service;

    @BeforeEach
    void setUp() {
        reservaRepository = mock(ReservaRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        registroUsoRepository = mock(RegistroUsoRepository.class);
        itemChecklistRepository = mock(ItemChecklistRepository.class);
        carroChecklistRepository = mock(CarroChecklistRepository.class);
        auditoriaService = mock(AuditoriaService.class);

        service = new MotoristaJornadaService(
                reservaRepository,
                usuarioRepository,
                registroUsoRepository,
                itemChecklistRepository,
                carroChecklistRepository,
                auditoriaService);
    }

    @Test
    void iniciarTrajetoCriaRegistroEAtualizaReservaEVeiculo() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        Usuario motorista = motoristaAtivo();
        List<ItemChecklist> checklist = List.of(item(1L, "Freios"), item(2L, "Documentos"));
        IniciarTrajetoRequestDTO dto = request(List.of(1L, 2L), Map.of(), 12500.0);

        prepararCenario(reserva, motorista, checklist);
        when(registroUsoRepository.save(any(RegistroUso.class))).thenAnswer(invocation -> {
            RegistroUso registro = invocation.getArgument(0);
            registro.setId(44L);
            return registro;
        });

        var response = service.iniciarTrajeto(10L, dto);

        assertThat(response.getId()).isEqualTo(44L);
        assertThat(response.getQuilometragemSaida()).isEqualTo(12500.0);
        assertThat(reserva.getStatusReserva()).isEqualTo(StatusReserva.EM_USO);
        assertThat(reserva.getVeiculo().getStatus()).isEqualTo(StatusVeiculo.EM_USO);
        verify(carroChecklistRepository, times(2)).save(any());
        verify(auditoriaService).registrar(
                any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void iniciarTrajetoBloqueiaChecklistIncompleto() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        prepararCenario(reserva, motoristaAtivo(), List.of(item(1L, "Freios"), item(2L, "Documentos")));

        assertThatThrownBy(() -> service.iniciarTrajeto(10L, request(List.of(1L), Map.of(), 12500.0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Todos os itens obrigatórios");
    }

    @Test
    void iniciarTrajetoBloqueiaHorarioFuturo() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().plusHours(1), LocalDateTime.now().plusHours(3));
        prepararCenario(reserva, motoristaAtivo(), List.of(item(1L, "Freios")));

        assertThatThrownBy(() -> service.iniciarTrajeto(10L, request(List.of(1L), Map.of(), 12500.0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("disponível somente");
    }

    @Test
    void iniciarTrajetoBloqueiaOcorrenciaEmItemCritico() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        prepararCenario(reserva, motoristaAtivo(), List.of(item(1L, "Freios")));

        assertThatThrownBy(() -> service.iniciarTrajeto(10L, request(List.of(1L), Map.of(1L, "ruído"), 12500.0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Item crítico");
    }

    private void prepararCenario(Reserva reserva, Usuario motorista, List<ItemChecklist> checklist) {
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(motorista));
        when(registroUsoRepository.existsByIdReservaAndDataRetornoIsNull(10L)).thenReturn(false);
        when(registroUsoRepository.buscarUltimaQuilometragemVeiculo(reserva.getVeiculo().getId()))
                .thenReturn(Optional.of(12000.0));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(1L)).thenReturn(checklist);
        when(carroChecklistRepository.existsByRegistroUsoIdAndItemId(any(), any())).thenReturn(false);
    }

    private IniciarTrajetoRequestDTO request(List<Long> itens, Map<Long, String> observacoes, Double quilometragem) {
        IniciarTrajetoRequestDTO dto = new IniciarTrajetoRequestDTO();
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
}
