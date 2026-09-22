package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('CUSTOMER_EXPERIENCE_OFFICER','ADMIN')")
public class SupportDomainController {

    private final DomainService domainService;
    private final CompletionService completionService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> dash = domainService.supportDashboard(principal.getId());
        dash.put(
                "recentInquiries",
                completionService.inquiries().stream()
                        .limit(5)
                        .map(
                                inq -> {
                                    Map<String, Object> row = new java.util.LinkedHashMap<>(inq);
                                    Object received = inq.get("receivedAt");
                                    row.putIfAbsent(
                                            "time",
                                            received == null ? "Recently" : String.valueOf(received));
                                    row.putIfAbsent("preview", inq.getOrDefault("message", ""));
                                    return row;
                                })
                        .toList());
        dash.put(
                "recentFeedback",
                completionService.feedback().stream()
                        .limit(5)
                        .map(
                                fb -> {
                                    Map<String, Object> row = new java.util.LinkedHashMap<>(fb);
                                    Object date = fb.get("date");
                                    if (date != null && String.valueOf(date).length() > 10) {
                                        row.put("date", String.valueOf(date).substring(0, 10));
                                    }
                                    row.putIfAbsent("type", fb.getOrDefault("type", "Feedback"));
                                    return row;
                                })
                        .toList());
        return ApiResponse.ok(dash);
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(domainService.clientProfile(principal.getId()));
    }

    @PatchMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(domainService.updateClientProfile(principal.getId(), body));
    }

    @GetMapping("/tickets")
    public ApiResponse<List<Map<String, Object>>> tickets() {
        return ApiResponse.ok(completionService.allFullTickets());
    }

    @GetMapping("/tickets/{id}")
    public ApiResponse<Map<String, Object>> ticket(@PathVariable String id) {
        return ApiResponse.ok(completionService.fullTicket(id));
    }

    @PatchMapping("/tickets/{id}")
    public ApiResponse<Map<String, Object>> updateTicket(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        body.putIfAbsent("author", resolveAuthorName(principal));
        return ApiResponse.ok(completionService.patchTicket(id, body));
    }

    @PostMapping("/tickets/{id}/replies")
    public ApiResponse<Map<String, Object>> reply(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        body.putIfAbsent("author", resolveAuthorName(principal));
        return ApiResponse.ok(completionService.patchTicket(id, body));
    }

    private String resolveAuthorName(UserPrincipal principal) {
        if (principal == null) return "Support";
        return userRepository
                .findById(principal.getId())
                .map(User::getFullName)
                .orElse(principal.getUsername());
    }

    @GetMapping("/tickets/client/{clientId}")
    public ApiResponse<List<Map<String, Object>>> clientHistory(@PathVariable String clientId) {
        return ApiResponse.ok(completionService.ticketsByClient(clientId));
    }

    @GetMapping("/inquiries")
    public ApiResponse<List<Map<String, Object>>> inquiries() {
        return ApiResponse.ok(completionService.inquiries());
    }

    @PostMapping("/inquiries/{id}/respond")
    public ApiResponse<Map<String, Object>> respondInquiry(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.respondInquiry(id, body));
    }

    @PostMapping("/inquiries/{id}/convert")
    public ApiResponse<Map<String, Object>> convertInquiry(@PathVariable String id) {
        return ApiResponse.ok(completionService.convertInquiryToTicket(id));
    }

    @GetMapping("/feedback")
    public ApiResponse<List<Map<String, Object>>> feedback() {
        return ApiResponse.ok(completionService.feedback());
    }

    @PatchMapping("/feedback/{id}")
    public ApiResponse<Map<String, Object>> updateFeedback(
            @PathVariable String id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(completionService.updateFeedback(id, body));
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications() {
        return ApiResponse.ok(domainService.notificationsByAudience("SUPPORT"));
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Map<String, Object>> markRead(@PathVariable String id) {
        return ApiResponse.ok(domainService.markNotificationRead(id));
    }

    @PatchMapping("/notifications/read-all")
    public ApiResponse<Map<String, Object>> markAll() {
        return ApiResponse.ok(domainService.markAudienceNotificationsRead("SUPPORT"));
    }
}
