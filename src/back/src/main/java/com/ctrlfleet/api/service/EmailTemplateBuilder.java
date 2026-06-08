package com.ctrlfleet.api.service;

import com.ctrlfleet.api.config.EmailProperties;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplateBuilder {

    private static final DateTimeFormatter DATA_HORA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    private static final String COLOR_ACCENT = "#cf4e36";
    private static final String COLOR_ACCENT_DARK = "#a63a28";
    private static final String COLOR_TEXT = "#182033";
    private static final String COLOR_MUTED = "#697288";
    private static final String COLOR_BG = "#eef1f6";
    private static final String COLOR_CARD = "#f8f9fc";
    private static final String COLOR_BORDER = "#e7e6eb";

    private final EmailProperties emailProperties;

    public EmailTemplateBuilder(EmailProperties emailProperties) {
        this.emailProperties = emailProperties;
    }

    public String contaCriada(String nome, String email, String senha, String perfil) {
        return build(
                "Sua conta no CtrlFleet foi criada com sucesso.",
                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=220&fit=crop&q=80",
                "Equipe em ambiente corporativo",
                Badge.info("Nova conta"),
                "Bem-vindo(a) ao CtrlFleet",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph(
                                "Sua conta foi criada e já está pronta para uso. "
                                        + "Guarde os dados abaixo em local seguro.")
                        + credentialsCard(
                                row("Usuário (e-mail)", email),
                                row("Senha provisória", senha),
                                row("Perfil de acesso", perfil))
                        + note("Recomendamos alterar a senha no primeiro acesso ao sistema."),
                "Acessar o sistema");
    }

    public String senhaRedefinida(String nome, String email, String senhaProvisoria) {
        return build(
                "Sua senha de acesso ao CtrlFleet foi redefinida.",
                "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=220&fit=crop&q=80",
                "Segurança digital",
                Badge.warning("Senha atualizada"),
                "Senha redefinida",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph("O administrador redefiniu sua senha de acesso ao CtrlFleet.")
                        + credentialsCard(
                                row("Usuário (e-mail)", email),
                                row("Nova senha provisória", senhaProvisoria))
                        + note("Altere a senha assim que fizer login."),
                "Fazer login");
    }

    public String conviteReenviado(String nome, String email) {
        return build(
                "Seu convite de acesso ao CtrlFleet foi reenviado.",
                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=220&fit=crop&q=80",
                "Convite de acesso",
                Badge.info("Convite"),
                "Convite reenviado",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph("Seu convite de acesso ao CtrlFleet foi reenviado pelo administrador.")
                        + highlightBox("Use o e-mail <strong>" + escape(email) + "</strong> para entrar no sistema.")
                        + note("Se não lembrar da senha, solicite ao administrador a redefinição."),
                "Acessar o sistema");
    }

    public String contaAprovada(String nome, String email) {
        return build(
                "Sua solicitação de acesso ao CtrlFleet foi aprovada.",
                "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=220&fit=crop&q=80",
                "Acesso aprovado",
                Badge.success("Aprovada"),
                "Conta aprovada",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph("Sua solicitação de acesso foi <strong>aprovada</strong>. Você já pode utilizar o sistema.")
                        + highlightBox("Entre com o e-mail <strong>" + escape(email) + "</strong>."),
                "Acessar o sistema");
    }

    public String reservaCriada(String nome, ReservationDetails details) {
        return build(
                "Reserva #" + details.id() + " registrada e aguardando aprovação.",
                "https://images.unsplash.com/photo-1549317661-bd32c8ce0db0?w=600&h=220&fit=crop&q=80",
                "Frota de veículos",
                Badge.info("Solicitada"),
                "Reserva solicitada",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph(
                                "Sua reserva de veículo foi registrada e aguarda análise do gestor de frota.")
                        + reservationCard(details)
                        + statusPill("Aguardando aprovação", Badge.infoColor()),
                "Ver minhas reservas");
    }

    public String reservaAprovadaSolicitante(String nome, ReservationDetails details) {
        return build(
                "Reserva #" + details.id() + " aprovada pelo gestor de frota.",
                "https://images.unsplash.com/photo-1469854523086-cc02afe5c88e?w=600&h=220&fit=crop&q=80",
                "Viagem aprovada",
                Badge.success("Aprovada"),
                "Reserva aprovada",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph("Sua reserva foi <strong>aprovada</strong>. O veículo está confirmado para o período abaixo.")
                        + reservationCard(details),
                "Ver reserva");
    }

    public String reservaAprovadaMotorista(String nome, String solicitante, ReservationDetails details) {
        return build(
                "Você foi designado como motorista da reserva #" + details.id() + ".",
                "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=220&fit=crop&q=80",
                "Nova viagem atribuída",
                Badge.success("Nova viagem"),
                "Viagem atribuída a você",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph("Uma reserva foi aprovada e você está designado como <strong>motorista</strong>.")
                        + reservationCard(details)
                        + highlightBox("Solicitante: <strong>" + escape(solicitante) + "</strong>"),
                "Ver jornada");
    }

    public String reservaReprovada(String nome, ReservationDetails details, String motivo) {
        return build(
                "Reserva #" + details.id() + " não foi aprovada.",
                "https://images.unsplash.com/photo-148529157115f-9dead3db37cc?w=600&h=220&fit=crop&q=80",
                "Reserva reprovada",
                Badge.danger("Reprovada"),
                "Reserva reprovada",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph("Sua reserva foi <strong>reprovada</strong> pelo gestor de frota.")
                        + reservationCard(details)
                        + alertBox("Motivo informado", motivo),
                "Nova solicitação");
    }

    public String reservaCancelada(String nome, ReservationDetails details, String observacao) {
        return build(
                "Reserva #" + details.id() + " foi cancelada.",
                "https://images.unsplash.com/photo-1473186578172-141e02958534?w=600&h=220&fit=crop&q=80",
                "Reserva cancelada",
                Badge.warning("Cancelada"),
                "Reserva cancelada",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph("A reserva abaixo foi <strong>cancelada</strong>.")
                        + reservationCard(details)
                        + alertBox("Observação", observacao),
                "Ver reservas");
    }

    public String reservaCanceladaMotorista(String nome, ReservationDetails details) {
        return build(
                "A reserva #" + details.id() + " vinculada ao seu veículo foi cancelada.",
                "https://images.unsplash.com/photo-1473186578172-141e02958534?w=600&h=220&fit=crop&q=80",
                "Viagem cancelada",
                Badge.warning("Cancelada"),
                "Viagem cancelada",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph(
                                "A reserva <strong>#"
                                        + details.id()
                                        + "</strong> vinculada ao seu veículo foi cancelada.")
                        + reservationCard(details),
                "Ver agenda");
    }

    public String lembreteUmDia(String nome, String papel, ReservationDetails details) {
        return build(
                "Falta 1 dia para a viagem da reserva #" + details.id() + ".",
                "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&h=220&fit=crop&q=80",
                "Lembrete de viagem",
                Badge.warning("Amanhã"),
                "Lembrete: viagem amanhã",
                paragraph("Olá, <strong>" + escape(nome) + "</strong>,")
                        + paragraph(
                                "Este é um lembrete automático: falta <strong>1 dia</strong> para a viagem abaixo "
                                        + "(perfil: <strong>"
                                        + escape(papel)
                                        + "</strong>).")
                        + reservationCard(details),
                "Ver detalhes");
    }

    public ReservationDetails reservationDetails(
            Long id,
            String origem,
            String destino,
            LocalDateTime inicio,
            LocalDateTime fim,
            String veiculoLabel) {
        return new ReservationDetails(
                id,
                escape(origem),
                escape(destino),
                formatDateTime(inicio),
                formatDateTime(fim),
                escape(veiculoLabel));
    }

    public record ReservationDetails(
            Long id, String origem, String destino, String inicio, String fim, String veiculo) {}

    private String build(
            String preheader,
            String heroUrl,
            String heroAlt,
            String badgeHtml,
            String title,
            String bodyHtml,
            String ctaLabel) {
        String appUrl = normalizeUrl(emailProperties.getAppUrl());
        String ctaBlock = appUrl.isBlank()
                ? ""
                : """
                <tr>
                  <td style="padding:8px 32px 28px;text-align:center;">
                    <a href="%s" style="display:inline-block;padding:14px 28px;background:%s;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">
                      %s
                    </a>
                  </td>
                </tr>
                """
                        .formatted(appUrl, COLOR_ACCENT, escape(ctaLabel));

        return """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>CtrlFleet</title>
                </head>
                <body style="margin:0;padding:0;background:%s;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:%s;">
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">%s</div>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:%s;">
                    <tr>
                      <td align="center" style="padding:32px 16px;">
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid %s;">
                          <tr>
                            <td style="background:linear-gradient(135deg,%s 0%%,%s 100%%);padding:24px 32px;">
                              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:0.3px;">
                                    &#128663; CtrlFleet
                                  </td>
                                  <td align="right" style="color:rgba(255,255,255,0.85);font-size:12px;">
                                    Gestão de Frotas
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:0;line-height:0;">
                              <img src="%s" alt="%s" width="600" style="display:block;width:100%%;max-width:600px;height:auto;border:0;">
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:28px 32px 8px;text-align:center;">
                              %s
                              <h1 style="margin:14px 0 0;font-size:24px;line-height:1.3;color:%s;">%s</h1>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 32px 12px;font-size:15px;line-height:1.7;color:%s;">
                              %s
                            </td>
                          </tr>
                          %s
                          <tr>
                            <td style="padding:20px 32px 28px;border-top:1px solid %s;background:%s;">
                              <p style="margin:0 0 8px;font-size:13px;color:%s;">
                                Este é um e-mail automático do <strong>CtrlFleet</strong>.
                                Não responda diretamente a esta mensagem.
                              </p>
                              <p style="margin:0;font-size:12px;color:%s;">
                                &copy; %s CtrlFleet &middot; Sistema de gestão de frotas
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """
                .formatted(
                        COLOR_BG,
                        COLOR_TEXT,
                        escape(preheader),
                        COLOR_BG,
                        COLOR_BORDER,
                        COLOR_ACCENT,
                        COLOR_ACCENT_DARK,
                        heroUrl,
                        escape(heroAlt),
                        badgeHtml,
                        COLOR_TEXT,
                        escape(title),
                        COLOR_TEXT,
                        bodyHtml,
                        ctaBlock,
                        COLOR_BORDER,
                        COLOR_CARD,
                        COLOR_MUTED,
                        COLOR_MUTED,
                        java.time.Year.now().getValue());
    }

    private String reservationCard(ReservationDetails details) {
        return """
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:18px 0 8px;background:%s;border:1px solid %s;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:14px 18px;background:#ffffff;border-bottom:1px solid %s;">
                      <strong style="font-size:14px;color:%s;">Detalhes da reserva #%s</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0;">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                        %s
                        %s
                        %s
                        %s
                        %s
                      </table>
                    </td>
                  </tr>
                </table>
                """
                .formatted(
                        COLOR_CARD,
                        COLOR_BORDER,
                        COLOR_BORDER,
                        COLOR_TEXT,
                        details.id(),
                        detailRow("Origem", details.origem()),
                        detailRow("Destino", details.destino()),
                        detailRow("Saída prevista", details.inicio()),
                        detailRow("Retorno estimado", details.fim()),
                        detailRow("Veículo", details.veiculo()));
    }

    private String credentialsCard(String... rows) {
        StringBuilder sb = new StringBuilder();
        sb.append(
                """
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:18px 0 8px;background:%s;border:1px solid %s;border-radius:12px;overflow:hidden;">
                """
                        .formatted(COLOR_CARD, COLOR_BORDER));
        for (String row : rows) {
            sb.append(row);
        }
        sb.append("</table>");
        return sb.toString();
    }

    private String row(String label, String value) {
        return detailRow(label, escape(value));
    }

    private String detailRow(String label, String value) {
        return """
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid %s;">
                    <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:%s;margin-bottom:4px;">%s</span>
                    <span style="font-size:15px;color:%s;font-weight:600;">%s</span>
                  </td>
                </tr>
                """
                .formatted(COLOR_BORDER, COLOR_MUTED, escape(label), COLOR_TEXT, value);
    }

    private String paragraph(String html) {
        return "<p style=\"margin:0 0 14px;\">" + html + "</p>";
    }

    private String note(String text) {
        return """
                <p style="margin:14px 0 0;padding:12px 14px;background:%s;border-left:4px solid %s;border-radius:8px;font-size:14px;color:%s;">
                  %s
                </p>
                """
                .formatted(COLOR_CARD, COLOR_ACCENT, COLOR_MUTED, escape(text));
    }

    private String highlightBox(String html) {
        return """
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:14px 0;">
                  <tr>
                    <td style="padding:14px 16px;background:%s;border:1px solid %s;border-radius:10px;font-size:15px;color:%s;">
                      %s
                    </td>
                  </tr>
                </table>
                """
                .formatted("#fff4f1", "#f5c4b8", COLOR_TEXT, html);
    }

    private String alertBox(String label, String text) {
        return """
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin:14px 0;">
                  <tr>
                    <td style="padding:14px 16px;background:#fff8ee;border:1px solid #f0d9a8;border-radius:10px;">
                      <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9a6b12;margin-bottom:6px;">%s</span>
                      <span style="font-size:15px;color:%s;">%s</span>
                    </td>
                  </tr>
                </table>
                """
                .formatted(escape(label), COLOR_TEXT, escape(text));
    }

    private String statusPill(String label, String color) {
        return """
                <p style="margin:12px 0 0;text-align:center;">
                  <span style="display:inline-block;padding:8px 14px;border-radius:999px;background:%s;color:#ffffff;font-size:13px;font-weight:700;">
                    %s
                  </span>
                </p>
                """
                .formatted(color, escape(label));
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "—" : value.format(DATA_HORA);
    }

    private String normalizeUrl(String url) {
        if (url == null || url.isBlank()) return "";
        return url.trim().replaceAll("/$", "");
    }

    static String escape(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private static final class Badge {
        private Badge() {}

        static String success(String label) {
            return pill(label, "#2d8b57");
        }

        static String info(String label) {
            return pill(label, infoColor());
        }

        static String warning(String label) {
            return pill(label, "#d58d21");
        }

        static String danger(String label) {
            return pill(label, "#d14f4a");
        }

        static String infoColor() {
            return "#3b6fd9";
        }

        private static String pill(String label, String color) {
            return """
                    <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:%s;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                      %s
                    </span>
                    """
                    .formatted(color, escape(label));
        }
    }
}
