package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.domain.WalletService.ReceiptDownload;
import com.biofit.backend.security.UserPrincipal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/wallet")
@RequiredArgsConstructor
public class WalletAdminController {

    private final WalletService walletService;

    @GetMapping("/topups")
    public ApiResponse<Map<String, Object>> topUps(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String range,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String q) {
        return ApiResponse.ok(walletService.adminTopUps(principal, status, range, from, to, q));
    }

    @GetMapping("/topups/{id}")
    public ApiResponse<Map<String, Object>> topUp(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(walletService.adminTopUp(principal, id));
    }

    @GetMapping("/topups/{id}/receipt")
    public ResponseEntity<byte[]> receipt(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        ReceiptDownload download = walletService.receiptForAdmin(principal, id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + download.fileName().replace("\"", "") + "\"")
                .body(download.bytes());
    }

    @PostMapping("/topups/{id}/approve")
    public ApiResponse<Map<String, Object>> approve(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(walletService.approve(principal, id));
    }

    @PostMapping("/topups/{id}/reject")
    public ApiResponse<Map<String, Object>> reject(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Object reason = body == null ? null : body.get("reason");
        if (reason == null && body != null) reason = body.get("rejectionReason");
        return ApiResponse.ok(walletService.reject(principal, id, reason == null ? null : String.valueOf(reason)));
    }

    @GetMapping("/clients")
    public ApiResponse<List<Map<String, Object>>> clients(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(walletService.adminWallets(principal));
    }

    @GetMapping("/clients/{clientId}")
    public ApiResponse<Map<String, Object>> clientWallet(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long clientId) {
        return ApiResponse.ok(walletService.adminWallet(principal, clientId));
    }

    @GetMapping("/transactions")
    public ApiResponse<List<Map<String, Object>>> transactions(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(walletService.adminTransactions(principal));
    }
}
