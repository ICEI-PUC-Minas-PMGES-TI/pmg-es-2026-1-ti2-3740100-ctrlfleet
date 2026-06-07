package com.ctrlfleet.api.service;

import com.ctrlfleet.api.domain.model.Reserva;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Service;

@Service
public class NotificationEmailService {

    private static final DateTimeFormatter DATA_HORA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    private final EmailService emailService;

    public NotificationEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void enviarContaCriada(Usuario usuario, String senhaPlana) {
        String assunto = "CtrlFleet — sua conta foi criada";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Sua conta no <strong>CtrlFleet</strong> foi criada com sucesso.</p>
                <ul>
                  <li><strong>Usuário (e-mail):</strong> %s</li>
                  <li><strong>Senha:</strong> %s</li>
                  <li><strong>Perfil:</strong> %s</li>
                </ul>
                <p>Recomendamos alterar a senha no primeiro acesso.</p>
                <p>Equipe CtrlFleet</p>
                """
                        .formatted(
                                escape(usuario.getNome()),
                                escape(usuario.getEmail()),
                                escape(senhaPlana),
                                escape(usuario.getPerfilAcesso()));
        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);
    }

    public void enviarSenhaRedefinida(Usuario usuario, String senhaProvisoria) {
        String assunto = "CtrlFleet — senha redefinida";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Sua senha de acesso ao CtrlFleet foi redefinida pelo administrador.</p>
                <ul>
                  <li><strong>Usuário (e-mail):</strong> %s</li>
                  <li><strong>Nova senha provisória:</strong> %s</li>
                </ul>
                <p>Altere a senha assim que fizer login.</p>
                """
                        .formatted(
                                escape(usuario.getNome()),
                                escape(usuario.getEmail()),
                                escape(senhaProvisoria));
        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);
    }

    public void enviarConviteReenviado(Usuario usuario) {
        String assunto = "CtrlFleet — convite de acesso";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Seu convite de acesso ao CtrlFleet foi reenviado.</p>
                <p>Use o e-mail <strong>%s</strong> para entrar no sistema.</p>
                <p>Se não lembrar da senha, solicite ao administrador a redefinição.</p>
                """
                        .formatted(escape(usuario.getNome()), escape(usuario.getEmail()));
        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);
    }

    public void enviarContaAprovada(Usuario usuario) {
        String assunto = "CtrlFleet — conta aprovada";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Sua solicitação de acesso ao CtrlFleet foi <strong>aprovada</strong>.</p>
                <p>Entre com o e-mail <strong>%s</strong>.</p>
                """
                        .formatted(escape(usuario.getNome()), escape(usuario.getEmail()));
        emailService.enviarHtml(usuario.getEmail(), assunto, corpo);
    }

    public void enviarReservaCriada(Reserva reserva) {
        Usuario solicitante = reserva.getUsuario();
        String assunto = "CtrlFleet — reserva solicitada (#" + reserva.getId() + ")";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Sua reserva de veículo foi registrada e aguarda aprovação do gestor.</p>
                %s
                <p><strong>Status:</strong> Solicitada</p>
                """
                        .formatted(escape(solicitante.getNome()), blocoReserva(reserva));
        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);
    }

    public void enviarReservaAprovadaSolicitante(Reserva reserva) {
        Usuario solicitante = reserva.getUsuario();
        String assunto = "CtrlFleet — reserva aprovada (#" + reserva.getId() + ")";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Sua reserva foi <strong>aprovada</strong>.</p>
                %s
                """
                        .formatted(escape(solicitante.getNome()), blocoReserva(reserva));
        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);
    }

    public void enviarReservaAprovadaMotorista(Reserva reserva) {
        Usuario motorista = reserva.getVeiculo().getMotorista();
        if (motorista == null || motorista.getEmail() == null || motorista.getEmail().isBlank()) {
            return;
        }
        String assunto = "CtrlFleet — nova viagem atribuída (#" + reserva.getId() + ")";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Uma reserva foi aprovada e você está designado como motorista.</p>
                %s
                <p><strong>Solicitante:</strong> %s</p>
                """
                        .formatted(
                                escape(motorista.getNome()),
                                blocoReserva(reserva),
                                escape(reserva.getUsuario().getNome()));
        emailService.enviarHtml(motorista.getEmail(), assunto, corpo);
    }

    public void enviarReservaReprovada(Reserva reserva, String motivo) {
        Usuario solicitante = reserva.getUsuario();
        String assunto = "CtrlFleet — reserva reprovada (#" + reserva.getId() + ")";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Sua reserva foi <strong>reprovada</strong>.</p>
                %s
                <p><strong>Motivo:</strong> %s</p>
                """
                        .formatted(
                                escape(solicitante.getNome()),
                                blocoReserva(reserva),
                                escape(motivo == null || motivo.isBlank() ? "Não informado" : motivo));
        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);
    }

    public void enviarReservaCancelada(Reserva reserva, String motivo) {
        Usuario solicitante = reserva.getUsuario();
        String assunto = "CtrlFleet — reserva cancelada (#" + reserva.getId() + ")";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Sua reserva foi <strong>cancelada</strong>.</p>
                %s
                <p><strong>Observação:</strong> %s</p>
                """
                        .formatted(
                                escape(solicitante.getNome()),
                                blocoReserva(reserva),
                                escape(motivo == null || motivo.isBlank() ? "Sem observações" : motivo));
        emailService.enviarHtml(solicitante.getEmail(), assunto, corpo);

        Usuario motorista = reserva.getVeiculo().getMotorista();
        if (motorista != null && motorista.getEmail() != null && !motorista.getEmail().isBlank()) {
            String assuntoMotorista = "CtrlFleet — viagem cancelada (#" + reserva.getId() + ")";
            String corpoMotorista =
                    """
                    <p>Olá, <strong>%s</strong>,</p>
                    <p>A reserva #%d vinculada ao seu veículo foi cancelada.</p>
                    %s
                    """
                            .formatted(
                                    escape(motorista.getNome()),
                                    reserva.getId(),
                                    blocoReserva(reserva));
            emailService.enviarHtml(motorista.getEmail(), assuntoMotorista, corpoMotorista);
        }
    }

    public void enviarLembreteUmDia(Reserva reserva, Usuario destinatario, String papel) {
        String assunto = "CtrlFleet — viagem amanhã (#" + reserva.getId() + ")";
        String corpo =
                """
                <p>Olá, <strong>%s</strong>,</p>
                <p>Lembrete: falta <strong>1 dia</strong> para a viagem abaixo (%s).</p>
                %s
                """
                        .formatted(
                                escape(destinatario.getNome()),
                                escape(papel),
                                blocoReserva(reserva));
        emailService.enviarHtml(destinatario.getEmail(), assunto, corpo);
    }

    private String blocoReserva(Reserva reserva) {
        Veiculo veiculo = reserva.getVeiculo();
        String veiculoLabel =
                veiculo == null
                        ? "—"
                        : veiculo.getMarca() + " " + veiculo.getModelo() + " · " + veiculo.getPlaca();
        return """
                <ul>
                  <li><strong>Reserva:</strong> #%s</li>
                  <li><strong>Origem:</strong> %s</li>
                  <li><strong>Destino:</strong> %s</li>
                  <li><strong>Saída prevista:</strong> %s</li>
                  <li><strong>Retorno estimado:</strong> %s</li>
                  <li><strong>Veículo:</strong> %s</li>
                </ul>
                """
                .formatted(
                        reserva.getId(),
                        escape(reserva.getOrigem()),
                        escape(reserva.getDestino()),
                        formatDateTime(reserva.getDataHoraInicioPrevista()),
                        formatDateTime(reserva.getDataHoraFimEstimada()),
                        escape(veiculoLabel));
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "—" : value.format(DATA_HORA);
    }

    private String escape(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
