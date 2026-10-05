package com.biofit.backend.mail;

import com.biofit.backend.common.ApiException;
import jakarta.mail.internet.MimeMessage;
import java.util.Locale;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class EmailService {

    private static final Set<String> PLACEHOLDER_PASSWORDS =
            Set.of(
                    "your-16-char-app-password",
                    "changeme",
                    "change-me",
                    "password",
                    "secret",
                    "app-password",
                    "put_your_16_letter_app_password_here",
                    "put_your_gmail_here");

    private final ObjectProvider<JavaMailSender> mailSender;
    private final boolean mailEnabled;
    private final boolean devFallback;
    private final String fromAddress;
    private final String smtpHost;
    private final int smtpPort;
    private final boolean sslEnable;
    private final boolean startTlsEnable;
    private final String smtpUsername;
    private final boolean smtpPasswordConfigured;

    public EmailService(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${biofit.mail.enabled:false}") boolean mailEnabled,
            @Value("${biofit.mail.dev-fallback:false}") boolean devFallback,
            @Value("${biofit.mail.from:noreply@biofit.local}") String fromAddress,
            @Value("${spring.mail.host:}") String smtpHost,
            @Value("${spring.mail.port:587}") int smtpPort,
            @Value("${spring.mail.properties.mail.smtp.ssl.enable:false}") boolean sslEnable,
            @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}") boolean startTlsEnable,
            @Value("${spring.mail.username:}") String smtpUsername,
            @Value("${spring.mail.password:}") String smtpPassword) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.devFallback = devFallback;
        this.fromAddress = fromAddress;
        this.smtpHost = smtpHost == null ? "" : smtpHost.trim();
        this.smtpPort = smtpPort;
        this.sslEnable = sslEnable;
        this.startTlsEnable = startTlsEnable;
        this.smtpUsername = smtpUsername == null ? "" : smtpUsername.trim();
        this.smtpPasswordConfigured = isRealSecret(smtpPassword);

        log.info(
                "BioFit mail config — enabled={}, devFallback={}, host={}, port={}, ssl={}, starttls={}, "
                        + "usernameSet={}, passwordSet={}, fromSet={}, mailSenderBean={}",
                this.mailEnabled,
                this.devFallback,
                StringUtils.hasText(this.smtpHost) ? this.smtpHost : "(missing)",
                this.smtpPort,
                this.sslEnable,
                this.startTlsEnable,
                StringUtils.hasText(this.smtpUsername),
                this.smtpPasswordConfigured,
                StringUtils.hasText(this.fromAddress),
                mailSender.getIfAvailable() != null);

        if (mailEnabled && smtpPort == 465 && !sslEnable) {
            log.warn("Port 465 usually requires SPRING_MAIL_SMTP_SSL=true (implicit SSL).");
        }
        if (mailEnabled && smtpPort == 587 && !startTlsEnable) {
            log.warn("Port 587 usually requires SPRING_MAIL_SMTP_STARTTLS=true.");
        }
    }

    /**
     * Always attempts real SMTP delivery first when mail is enabled.
     *
     * @return {@code true} if the email was sent; {@code false} if not sent and
     *     {@code biofit.mail.dev-fallback=true} (caller may expose OTP for local testing only)
     */
    public boolean sendVerificationOtp(String toEmail, String otp) {
        if (!StringUtils.hasText(toEmail)) {
            throw new ApiException(
                    "EMAIL_SEND_FAILED",
                    "We couldn't send the verification code. Please try again.",
                    HttpStatus.BAD_REQUEST);
        }

        log.info("Attempting to send verification email to {}", maskEmail(toEmail));

        if (!mailEnabled) {
            return failOrFallback(toEmail, otp, "BIOFIT_MAIL_ENABLED is false", null);
        }

        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            return failOrFallback(
                    toEmail,
                    otp,
                    "JavaMailSender bean is not available (check spring.mail.host)",
                    null);
        }

        if (!StringUtils.hasText(smtpHost)
                || !StringUtils.hasText(smtpUsername)
                || !smtpPasswordConfigured) {
            log.warn(
                    "SMTP credentials look incomplete (hostSet={}, usernameSet={}, passwordSet={}) "
                            + "— still attempting send via JavaMailSender",
                    StringUtils.hasText(smtpHost),
                    StringUtils.hasText(smtpUsername),
                    smtpPasswordConfigured);
        }

        String subject = "Verify your BioFit account";
        String body =
                """
                Welcome to BioFit.

                Your verification code is:

                %s

                This code expires in 5 minutes.

                If you did not create this account, you can ignore this email.

                — The BioFit Team
                """
                        .formatted(otp);

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail.trim());
            helper.setSubject(subject);
            helper.setText(body, false);
            sender.send(message);
            log.info("OTP email sent successfully to {}", maskEmail(toEmail));
            return true;
        } catch (Exception ex) {
            log.error(
                    "SMTP send failed for {}: {}",
                    maskEmail(toEmail),
                    formatCauseChain(ex));
            return failOrFallback(toEmail, otp, rootMessage(ex), ex);
        }
    }

    /** Sends a plain test message (used by /api/dev/test-mail). */
    public void sendTestMail(String toEmail) {
        if (!StringUtils.hasText(toEmail)) {
            throw new ApiException(
                    "EMAIL_SEND_FAILED", "Recipient email is required.", HttpStatus.BAD_REQUEST);
        }
        if (!mailEnabled) {
            throw new ApiException(
                    "EMAIL_SEND_FAILED",
                    "Mail is disabled (BIOFIT_MAIL_ENABLED=false).",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            throw new ApiException(
                    "EMAIL_SEND_FAILED",
                    "JavaMailSender bean is not available.",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail.trim());
            helper.setSubject("BioFit mail test");
            helper.setText(
                    "This is a BioFit SMTP test message. If you received it, Gmail delivery is working.",
                    false);
            sender.send(message);
            log.info("Test email sent successfully to {}", maskEmail(toEmail));
        } catch (Exception ex) {
            log.error("SMTP test send failed for {}: {}", maskEmail(toEmail), formatCauseChain(ex));
            throw new ApiException(
                    "EMAIL_SEND_FAILED",
                    rootMessage(ex),
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private boolean failOrFallback(String toEmail, String otp, String reason, Throwable ex) {
        if (devFallback) {
            // Dev-only: OTP is logged here so local testing can continue when SMTP fails.
            log.warn(
                    "==== DEV OTP for {}: {} (email not sent: {}) ====",
                    toEmail,
                    otp,
                    reason);
            return false;
        }
        log.error(
                "Verification email sending failed for {}: {}",
                maskEmail(toEmail),
                ex != null ? formatCauseChain(ex) : reason);
        throw new ApiException(
                "EMAIL_SEND_FAILED",
                "We couldn't send the verification code. Please try again.",
                HttpStatus.SERVICE_UNAVAILABLE);
    }

    private static boolean isRealSecret(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT).replace(" ", "");
        return !PLACEHOLDER_PASSWORDS.contains(normalized) && normalized.length() >= 8;
    }

    /** Full exception class + message + cause chain; never includes SMTP password. */
    static String formatCauseChain(Throwable ex) {
        if (ex == null) {
            return "(no exception)";
        }
        StringBuilder sb = new StringBuilder();
        Throwable current = ex;
        int depth = 0;
        while (current != null && depth < 8) {
            if (depth > 0) {
                sb.append(" <- ");
            }
            sb.append(current.getClass().getName());
            String msg = current.getMessage();
            if (StringUtils.hasText(msg)) {
                sb.append(": ").append(redactSecrets(msg));
            }
            current = current.getCause();
            depth++;
        }
        String result = sb.toString();
        return result.length() > 1200 ? result.substring(0, 1200) + "…" : result;
    }

    private static String rootMessage(Throwable ex) {
        if (ex == null) {
            return "Unknown mail error";
        }
        Throwable root = ex;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        String msg = root.getMessage();
        if (!StringUtils.hasText(msg)) {
            msg = root.getClass().getSimpleName();
        }
        return redactSecrets(msg);
    }

    private static String redactSecrets(String message) {
        return message.replaceAll("(?i)(password|pass|pwd)=\\S+", "$1=***");
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() <= 2) {
            return "***" + domain;
        }
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + domain;
    }
}
