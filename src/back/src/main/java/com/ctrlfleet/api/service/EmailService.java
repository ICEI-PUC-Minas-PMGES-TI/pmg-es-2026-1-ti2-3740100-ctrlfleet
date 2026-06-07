package com.ctrlfleet.api.service;

import com.ctrlfleet.api.config.EmailProperties;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;

    public EmailService(JavaMailSender mailSender, EmailProperties emailProperties) {
        this.mailSender = mailSender;
        this.emailProperties = emailProperties;
    }

    public void enviar(String destinatario, String assunto, String corpoTexto) {
        enviar(destinatario, assunto, corpoTexto, false);
    }

    public void enviarHtml(String destinatario, String assunto, String corpoHtml) {
        enviar(destinatario, assunto, corpoHtml, true);
    }

    private void enviar(String destinatario, String assunto, String corpo, boolean html) {
        if (destinatario == null || destinatario.isBlank()) {
            log.warn("E-mail não enviado: destinatário vazio (assunto: {})", assunto);
            return;
        }

        if (!emailProperties.isEnabled()) {
            log.info(
                    "E-mail desabilitado — simulado para {} | assunto: {} | corpo: {}",
                    destinatario,
                    assunto,
                    corpo.length() > 120 ? corpo.substring(0, 120) + "…" : corpo);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(emailProperties.getFrom(), emailProperties.getFromName());
            helper.setTo(destinatario.trim());
            helper.setSubject(assunto);
            helper.setText(corpo, html);
            mailSender.send(message);
            log.info("E-mail enviado para {} | assunto: {}", destinatario, assunto);
        } catch (Exception ex) {
            log.error("Falha ao enviar e-mail para {} | assunto: {}", destinatario, assunto, ex);
        }
    }
}
