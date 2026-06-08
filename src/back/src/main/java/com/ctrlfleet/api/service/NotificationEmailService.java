package com.ctrlfleet.api.service;



import com.ctrlfleet.api.domain.model.Reserva;

import com.ctrlfleet.api.domain.model.Usuario;

import com.ctrlfleet.api.domain.model.Veiculo;

import com.ctrlfleet.api.service.EmailTemplateBuilder.ReservationDetails;

import org.springframework.stereotype.Service;



@Service

public class NotificationEmailService {



    private final EmailService emailService;

    private final EmailTemplateBuilder emailTemplateBuilder;



    public NotificationEmailService(EmailService emailService, EmailTemplateBuilder emailTemplateBuilder) {

        this.emailService = emailService;

        this.emailTemplateBuilder = emailTemplateBuilder;

    }



    public void enviarContaCriada(Usuario usuario, String senhaPlana) {

        String assunto = "CtrlFleet — sua conta foi criada";

        String corpo = emailTemplateBuilder.contaCriada(

                usuario.getNome(), usuario.getEmail(), senhaPlana, usuario.getPerfilAcesso());

        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);

    }



    public void enviarSenhaRedefinida(Usuario usuario, String senhaProvisoria) {

        String assunto = "CtrlFleet — senha redefinida";

        String corpo = emailTemplateBuilder.senhaRedefinida(

                usuario.getNome(), usuario.getEmail(), senhaProvisoria);

        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);

    }



    public void enviarConviteReenviado(Usuario usuario) {

        String assunto = "CtrlFleet — convite de acesso";

        String corpo = emailTemplateBuilder.conviteReenviado(usuario.getNome(), usuario.getEmail());

        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);

    }



    public void enviarContaAprovada(Usuario usuario) {

        String assunto = "CtrlFleet — conta aprovada";

        String corpo = emailTemplateBuilder.contaAprovada(usuario.getNome(), usuario.getEmail());

        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);

    }



    public void enviarReservaCriada(Reserva reserva) {

        Usuario solicitante = reserva.getUsuario();

        String assunto = "CtrlFleet — reserva solicitada (#" + reserva.getId() + ")";

        String corpo = emailTemplateBuilder.reservaCriada(solicitante.getNome(), toReservationDetails(reserva));

        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);

    }



    public void enviarReservaAprovadaSolicitante(Reserva reserva) {

        Usuario solicitante = reserva.getUsuario();

        String assunto = "CtrlFleet — reserva aprovada (#" + reserva.getId() + ")";

        String corpo =

                emailTemplateBuilder.reservaAprovadaSolicitante(solicitante.getNome(), toReservationDetails(reserva));

        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);

    }



    public void enviarReservaAprovadaMotorista(Reserva reserva) {

        Usuario motorista = reserva.getVeiculo().getMotorista();

        if (motorista == null || motorista.getEmail() == null || motorista.getEmail().isBlank()) {

            return;

        }

        String assunto = "CtrlFleet — nova viagem atribuída (#" + reserva.getId() + ")";

        String corpo = emailTemplateBuilder.reservaAprovadaMotorista(

                motorista.getNome(), reserva.getUsuario().getNome(), toReservationDetails(reserva));

        emailService.enviarHtml(motorista.getEmail(), assunto, corpo);

    }



    public void enviarReservaReprovada(Reserva reserva, String motivo) {

        Usuario solicitante = reserva.getUsuario();

        String assunto = "CtrlFleet — reserva reprovada (#" + reserva.getId() + ")";

        String corpo = emailTemplateBuilder.reservaReprovada(

                solicitante.getNome(),

                toReservationDetails(reserva),

                motivo == null || motivo.isBlank() ? "Não informado" : motivo);

        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);

    }



    public void enviarReservaCancelada(Reserva reserva, String motivo) {

        Usuario solicitante = reserva.getUsuario();

        String observacao = motivo == null || motivo.isBlank() ? "Sem observações" : motivo;

        String assunto = "CtrlFleet — reserva cancelada (#" + reserva.getId() + ")";

        String corpo = emailTemplateBuilder.reservaCancelada(

                solicitante.getNome(), toReservationDetails(reserva), observacao);

        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);



        Usuario motorista = reserva.getVeiculo().getMotorista();

        if (motorista != null && motorista.getEmail() != null && !motorista.getEmail().isBlank()) {

            String assuntoMotorista = "CtrlFleet — viagem cancelada (#" + reserva.getId() + ")";

            String corpoMotorista = emailTemplateBuilder.reservaCanceladaMotorista(

                    motorista.getNome(), toReservationDetails(reserva));

            emailService.enviarHtml(motorista.getEmail(), assuntoMotorista, corpoMotorista);

        }

    }



    public void enviarLembreteUmDia(Reserva reserva, Usuario destinatario, String papel) {

        String assunto = "CtrlFleet — viagem amanhã (#" + reserva.getId() + ")";

        String corpo = emailTemplateBuilder.lembreteUmDia(

                destinatario.getNome(), papel, toReservationDetails(reserva));

        emailService.enviarHtml(destinatario.getEmail(), assunto, corpo);

    }



    private ReservationDetails toReservationDetails(Reserva reserva) {

        Veiculo veiculo = reserva.getVeiculo();

        String veiculoLabel =

                veiculo == null

                        ? "—"

                        : veiculo.getMarca() + " " + veiculo.getModelo() + " · " + veiculo.getPlaca();

        return emailTemplateBuilder.reservationDetails(

                reserva.getId(),

                reserva.getOrigem(),

                reserva.getDestino(),

                reserva.getDataHoraInicioPrevista(),

                reserva.getDataHoraFimEstimada(),

                veiculoLabel);

    }

}


