package com.ctrlfleet.api.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

/** Horários de reserva/checklist são gravados e comparados em horário de Brasília. */
public final class HorarioOperacional {

    public static final ZoneId ZONA = ZoneId.of("America/Sao_Paulo");

    private HorarioOperacional() {}

    public static LocalDateTime agora() {
        return LocalDateTime.now(ZONA);
    }

    /** Verdadeiro somente após o instante de término previsto (não no mesmo minuto). */
    public static boolean reservaEncerrada(LocalDateTime fimPrevisto) {
        return fimPrevisto != null && agora().isAfter(fimPrevisto);
    }
}
