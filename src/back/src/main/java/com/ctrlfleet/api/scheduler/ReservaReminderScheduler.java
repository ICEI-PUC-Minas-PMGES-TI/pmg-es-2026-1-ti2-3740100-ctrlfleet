package com.ctrlfleet.api.scheduler;

import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.repository.ReservaRepository;
import com.ctrlfleet.api.service.NotificationEmailService;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ReservaReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReservaReminderScheduler.class);

    private final ReservaRepository reservaRepository;
    private final NotificationEmailService notificationEmailService;

    public ReservaReminderScheduler(
            ReservaRepository reservaRepository, NotificationEmailService notificationEmailService) {
        this.reservaRepository = reservaRepository;
        this.notificationEmailService = notificationEmailService;
    }

    /** Verifica a cada hora reservas aprovadas com saída prevista em ~24 horas. */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void enviarLembretesUmDia() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicio = agora.plusHours(23);
        LocalDateTime fim = agora.plusHours(25);

        List<Reserva> reservas = reservaRepository.findReservasParaLembreteUmDia(inicio, fim);
        if (reservas.isEmpty()) {
            return;
        }

        log.info("Enviando lembretes de 1 dia para {} reserva(s)", reservas.size());

        for (Reserva reserva : reservas) {
            Usuario solicitante = reserva.getUsuario();
            if (solicitante != null) {
                notificationEmailService.enviarLembreteUmDia(reserva, solicitante, "solicitante");
            }

            Usuario motorista = reserva.getVeiculo() != null ? reserva.getVeiculo().getMotorista() : null;
            if (motorista != null) {
                notificationEmailService.enviarLembreteUmDia(reserva, motorista, "motorista");
            }

            reserva.setLembreteUmDiaEnviadoEm(agora);
            reservaRepository.save(reserva);
        }
    }
}
