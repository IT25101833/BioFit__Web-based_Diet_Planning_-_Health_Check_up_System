package com.biofit.backend.domain;

import com.biofit.backend.common.ApiResponse;
import com.biofit.backend.domain.WalletService.ReceiptDownload;
import com.biofit.backend.security.UserPrincipal;
import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/client/wallet")
@RequiredArgsConstructor
public class WalletClientController {

    private final WalletService walletService;

    @GetMapping
    public ApiResponse<Map<String, Object>> overview(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(walletService.overview(principal));
    }

    @PostMapping
    public ApiResponse<Void> rejectCreate(@AuthenticationPrincipal UserPrincipal principal) {
        walletService.rejectDirectBalanceChange();
        return ApiResponse.ok(null);
    }

    @PutMapping
    public ApiResponse<Void> rejectReplace(@AuthenticationPrincipal UserPrincipal principal) {
        walletService.rejectDirectBalanceChange();
        return ApiResponse.ok(null);
    }

    @PostMapping("/balance")
    public ApiResponse<Void> rejectBalance(@AuthenticationPrincipal UserPrincipal principal) {
        walletService.rejectDirectBalanceChange();
        return ApiResponse.ok(null);
    }

    @PutMapping("/balance")
    public ApiResponse<Void> rejectBalancePut(@AuthenticationPrincipal UserPrincipal principal) {
        walletService.rejectDirectBalanceChange();
        return ApiResponse.ok(null);
    }

    @GetMapping("/services")
    public ApiResponse<List<Map<String, Object>>> services() {
        return ApiResponse.ok(walletService.services());
    }

    @GetMapping("/topups")
    public ApiResponse<List<Map<String, Object>>> topUps(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(walletService.clientTopUps(principal));
    }

    @PostMapping(value = "/topups", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> submit(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String note,
            @RequestParam("receipt") MultipartFile receipt) {
        return ApiResponse.ok(walletService.submitTopUp(principal, amount, note, receipt));
    }

    @PutMapping(value = "/topups/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) String note,
            @RequestParam(value = "receipt", required = false) MultipartFile receipt) {
        return ApiResponse.ok(walletService.updatePending(principal, id, amount, note, receipt));
    }

    @PostMapping("/topups/{id}/cancel")
    public ApiResponse<Map<String, Object>> cancel(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(walletService.cancel(principal, id));
    }

    @GetMapping("/topups/{id}/receipt")
    public ResponseEntity<byte[]> receipt(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return file(walletService.receiptForClient(principal, id));
    }

    @GetMapping("/transactions")
    public ApiResponse<List<Map<String, Object>>> transactions(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(walletService.clientTransactions(principal));
    }

    @PostMapping("/payments")
    public ApiResponse<Map<String, Object>> pay(
            @AuthenticationPrincipal UserPrincipal principal, @RequestBody Map<String, Object> body) {
        Object code = body == null ? null : body.get("serviceCode");
        return ApiResponse.ok(walletService.pay(principal, code == null ? null : String.valueOf(code)));
    }

    private static ResponseEntity<byte[]> file(ReceiptDownload download) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + download.fileName().replace("\"", "") + "\"")
                .body(download.bytes());
    }
}
