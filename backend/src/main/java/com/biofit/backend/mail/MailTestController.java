package com.biofit.backend.mail;

import com.biofit.backend.common.ApiException;
import com.biofit.backend.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Temporary SMTP probe — only registered when {@code biofit.mail.dev-fallback=true}.
 * Remove or keep disabled in production.
 */
@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "biofit.mail.dev-fallback", havingValue = "true")
public class MailTestController {

    private final EmailService emailService;

    public record TestMailRequest(@NotBlank @Email String to) {}

    @PostMapping("/test-mail")
    public ApiResponse<Map<String, String>> testMail(@Valid @RequestBody TestMailRequest request) {
        try {
            emailService.sendTestMail(request.to());
            return ApiResponse.ok(
                    Map.of(
                            "status",
                            "sent",
                            "to",
                            request.to(),
                            "message",
                            "Test email accepted by SMTP. Check inbox/spam."));
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(
                    "EMAIL_SEND_FAILED",
                    EmailService.formatCauseChain(ex),
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
