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
import com.ctrlfleet.api.dto.motorista.FinalizarTrajetoRequestDTO;
import com.ctrlfleet.api.dto.motorista.IniciarCorridaRequestDTO;
import com.ctrlfleet.api.dto.motorista.RegistrarChecklistSaidaRequestDTO;
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
    void registrarChecklistSaidaSalvaSemIniciarCorrida() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        Usuario motorista = motoristaAtivo();
        List<ItemChecklist> checklist = List.of(item(1L, "Freios"), item(2L, "Documentos"));
        RegistrarChecklistSaidaRequestDTO dto = checklistRequest(List.of(1L, 2L), Map.of(), 12500.0);

        prepararCenario(reserva, motorista, checklist);
        when(registroUsoRepository.existsByIdReservaAndDataRetornoIsNull(10L)).thenReturn(false);
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.empty());
        when(registroUsoRepository.save(any(RegistroUso.class))).thenAnswer(invocation -> {
            RegistroUso registro = invocation.getArgument(0);
            registro.setId(44L);
            return registro;
        });
        when(carroChecklistRepository.countByRegistroUsoId(44L)).thenReturn(2L);

        var response = service.registrarChecklistSaida(10L, dto);

        assertThat(response.getId()).isEqualTo(44L);
        assertThat(reserva.getStatusReserva()).isEqualTo(StatusReserva.APROVADA);
        assertThat(reserva.getVeiculo().getStatus()).isEqualTo(StatusVeiculo.DISPONIVEL);
        verify(carroChecklistRepository, times(2)).save(any());
    }

    @Test
    void iniciarTrajetoExigeChecklistPreviamenteRegistrado() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        prepararCenario(reserva, motoristaAtivo(), List.of(item(1L, "Freios")));
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.empty());

        IniciarCorridaRequestDTO dto = new IniciarCorridaRequestDTO();
        dto.setIdMotorista(5L);

        assertThatThrownBy(() -> service.iniciarTrajeto(10L, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("checklist");
    }

    @Test
    void iniciarTrajetoAtualizaReservaEVeiculoAposChecklist() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        Usuario motorista = motoristaAtivo();
        RegistroUso registro = registroAberto(reserva, motorista, 12500.0);

        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(motorista));
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.of(registro));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(1L))
                .thenReturn(List.of(item(1L, "Freios"), item(2L, "Documentos")));
        when(carroChecklistRepository.countByRegistroUsoId(99L)).thenReturn(2L);

        IniciarCorridaRequestDTO dto = new IniciarCorridaRequestDTO();
        dto.setIdMotorista(5L);

        var response = service.iniciarTrajeto(10L, dto);

        assertThat(response.getId()).isEqualTo(99L);
        assertThat(reserva.getStatusReserva()).isEqualTo(StatusReserva.EM_USO);
        assertThat(reserva.getVeiculo().getStatus()).isEqualTo(StatusVeiculo.EM_USO);
    }

    @Test
    void registrarChecklistSaidaBloqueiaChecklistIncompleto() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusMinutes(10), LocalDateTime.now().plusHours(2));
        prepararCenario(reserva, motoristaAtivo(), List.of(item(1L, "Freios"), item(2L, "Documentos")));
        when(registroUsoRepository.existsByIdReservaAndDataRetornoIsNull(10L)).thenReturn(false);
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.registrarChecklistSaida(10L, checklistRequest(List.of(1L), Map.of(), 12500.0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("obrigatórios");
    }

    @Test
    void iniciarTrajetoBloqueiaHorarioFuturo() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().plusHours(1), LocalDateTime.now().plusHours(3));
        Usuario motorista = motoristaAtivo();
        RegistroUso registro = registroAberto(reserva, motorista, 12500.0);

        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(motorista));
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.of(registro));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(1L))
                .thenReturn(List.of(item(1L, "Freios")));
        when(carroChecklistRepository.countByRegistroUsoId(99L)).thenReturn(1L);

        IniciarCorridaRequestDTO dto = new IniciarCorridaRequestDTO();
        dto.setIdMotorista(5L);

        assertThatThrownBy(() -> service.iniciarTrajeto(10L, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("disponível somente");
    }

    private void prepararCenario(Reserva reserva, Usuario motorista, List<ItemChecklist> checklist) {
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(motorista));
        when(registroUsoRepository.buscarUltimaQuilometragemVeiculo(reserva.getVeiculo().getId()))
                .thenReturn(Optional.of(12000.0));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(1L)).thenReturn(checklist);
        when(carroChecklistRepository.existsByRegistroUsoIdAndItemId(any(), any())).thenReturn(false);
    }

    private RegistrarChecklistSaidaRequestDTO checklistRequest(
            List<Long> itens, Map<Long, String> observacoes, Double quilometragem) {
        RegistrarChecklistSaidaRequestDTO dto = new RegistrarChecklistSaidaRequestDTO();
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

    @Test
    void finalizarTrajetoRegistraChecklistDeRetornoEConclui() {
        Reserva reserva = reservaEmUso();
        Usuario motorista = motoristaAtivo();
        RegistroUso registro = registroAberto(reserva, motorista, 12500.0);
        List<ItemChecklist> checklistRetorno = List.of(item(6L, "Quilometragem"), item(7L, "Avarias"));
        FinalizarTrajetoRequestDTO dto = new FinalizarTrajetoRequestDTO();
        dto.setIdMotorista(5L);
        dto.setQuilometragemRetorno(12800.0);
        dto.setItensChecklist(List.of(6L, 7L));

        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(motorista));
        when(registroUsoRepository.findFirstByIdReservaAndMotoristaIdAndDataRetornoIsNull(10L, 5L))
                .thenReturn(Optional.of(registro));
        when(itemChecklistRepository.findByTipoInspecaoIdOrderByIdAsc(2L)).thenReturn(checklistRetorno);
        when(carroChecklistRepository.existsByRegistroUsoIdAndItemId(any(), any())).thenReturn(false);

        var response = service.finalizarTrajeto(10L, dto);

        assertThat(response.getQuilometragemRetorno()).isEqualTo(12800.0);
        assertThat(reserva.getStatusReserva()).isEqualTo(StatusReserva.CONCLUIDA);
        assertThat(reserva.getVeiculo().getStatus()).isEqualTo(StatusVeiculo.DISPONIVEL);
        verify(carroChecklistRepository, times(2)).save(any());
        verify(auditoriaService).registrar(any(), any(), any(), any(), any(), any(), any());
    }

    private Reserva reservaEmUso() {
        Reserva reserva = reservaAprovada(LocalDateTime.now().minusHours(1), LocalDateTime.now().plusHours(1));
        reserva.setStatusReserva(StatusReserva.EM_USO);
        reserva.getVeiculo().setStatus(StatusVeiculo.EM_USO);
        return reserva;
    }

    private RegistroUso registroAberto(Reserva reserva, Usuario motorista, double kmSaida) {
        RegistroUso registro =
                new RegistroUso(reserva.getVeiculo(), motorista, LocalDateTime.now().minusHours(1), kmSaida);
        registro.setIdReserva(10L);
        registro.setId(99L);
        return registro;
    }
}
