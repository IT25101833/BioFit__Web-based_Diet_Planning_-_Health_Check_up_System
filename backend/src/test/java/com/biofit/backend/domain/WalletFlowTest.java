package com.biofit.backend.domain;

import static org.hamcrest.Matchers.closeTo;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.biofit.backend.audit.AuditLogRepository;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.security.JwtService;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
        properties = {
            "spring.datasource.url=jdbc:h2:mem:walletflow;DB_CLOSE_DELAY=-1",
            "biofit.seed-demo-data=true",
            "biofit.bootstrap-accounts=true",
            "biofit.wallet.receipt-dir=target/wallet-receipts-test"
        })
class WalletFlowTest {

    @Autowired private WalletService walletService;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private MockMvc mockMvc;

    @Test
    void cashTopUpCreditsWalletOnlyAfterAdminApproval() throws Exception {
        User client = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("client@biofit.local").orElseThrow();
        User otherClient = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("alex.perera@biofit.demo").orElseThrow();
        User admin = userRepository.findByEmailIgnoreCaseAndDeletedAtIsNull("admin@biofit.demo").orElseThrow();
        UserPrincipal clientPrincipal = new UserPrincipal(client);
        UserPrincipal adminPrincipal = new UserPrincipal(admin);
        String clientToken = jwtService.createAccessToken(client.getId(), client.getEmail(), List.of("CLIENT"));
        String otherToken = jwtService.createAccessToken(otherClient.getId(), otherClient.getEmail(), List.of("CLIENT"));
        String adminToken = jwtService.createAccessToken(admin.getId(), admin.getEmail(), List.of("ADMIN"));

        mockMvc.perform(get("/api/client/wallet").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.balance", closeTo(0.0, 0.001)));

        MockMultipartFile text =
                new MockMultipartFile("receipt", "notes.txt", "text/plain", "not a receipt".getBytes());
        mockMvc.perform(
                        multipart("/api/client/wallet/topups")
                                .file(text)
                                .param("amount", "5000")
                                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isBadRequest());
        assertEquals(0, balance(clientPrincipal));

        MockMultipartFile jpeg =
                new MockMultipartFile("receipt", "receipt.jpg", "image/jpeg", new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00});
        MvcResult created =
                mockMvc.perform(
                                multipart("/api/client/wallet/topups")
                                        .file(jpeg)
                                        .param("amount", "5000")
                                        .param("note", "Cash payment made at BioFit center.")
                                        .header("Authorization", "Bearer " + clientToken))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.status").value("PENDING"))
                        .andExpect(jsonPath("$.data.amount", closeTo(5000.0, 0.001)))
                        .andExpect(jsonPath("$.data.receiptFileName", containsString("_receipt.jpg")))
                        .andReturn();
        String requestNumber = com.jayway.jsonpath.JsonPath.read(created.getResponse().getContentAsString(), "$.data.requestNumber");
        Number requestId = com.jayway.jsonpath.JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");
        assertTrue(String.valueOf(requestNumber).startsWith("TOPUP-"));
        assertEquals(0, balance(clientPrincipal));
        assertTrue(walletService.clientTransactions(clientPrincipal).isEmpty());

        mockMvc.perform(get("/api/admin/wallet/topups").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.requests[0].clientName").value(client.getFullName()))
                .andExpect(jsonPath("$.data.requests[0].clientCode").value("BF-C" + client.getId()))
                .andExpect(jsonPath("$.data.requests[0].requestNumber").value(requestNumber))
                .andExpect(jsonPath("$.data.requests[0].receiptFileName", containsString("_receipt.jpg")));

        mockMvc.perform(
                        get("/api/client/wallet/topups/" + requestId + "/receipt")
                                .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(
                        post("/api/admin/wallet/topups/" + requestId + "/approve")
                                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.data.currentBalance", closeTo(5000.0, 0.001)));

        mockMvc.perform(
                        post("/api/admin/wallet/topups/" + requestId + "/approve")
                                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());
        assertEquals(5000, balance(clientPrincipal));

        List<Map<String, Object>> credits = walletService.clientTransactions(clientPrincipal);
        assertEquals(1, credits.size());
        assertEquals("CREDIT", credits.get(0).get("type"));
        assertEquals(5000, scale(credits.get(0).get("amount")));
        assertEquals(requestNumber, credits.get(0).get("reference"));
        assertEquals("APPROVED", credits.get(0).get("status"));

        MockMultipartFile secondReceipt =
                new MockMultipartFile("receipt", "second.jpg", "image/jpeg", new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01});
        MvcResult second =
                mockMvc.perform(
                                multipart("/api/client/wallet/topups")
                                        .file(secondReceipt)
                                        .param("amount", "2000")
                                        .header("Authorization", "Bearer " + clientToken))
                        .andExpect(status().isOk())
                        .andReturn();
        Number secondId = com.jayway.jsonpath.JsonPath.read(second.getResponse().getContentAsString(), "$.data.id");
        mockMvc.perform(
                        post("/api/admin/wallet/topups/" + secondId + "/reject")
                                .header("Authorization", "Bearer " + adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"reason\":\"Receipt could not be verified.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"));
        assertEquals(5000, balance(clientPrincipal));
        assertTrue(
                walletService.clientTopUps(clientPrincipal).stream()
                        .anyMatch(row -> "Receipt could not be verified.".equals(row.get("rejectionReason"))));

        mockMvc.perform(
                        post("/api/client/wallet/balance")
                                .header("Authorization", "Bearer " + clientToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"balance\":9000}"))
                .andExpect(status().isForbidden());
        assertEquals(5000, balance(clientPrincipal));

        Map<String, Object> paid = walletService.pay(clientPrincipal, "FITNESS");
        assertEquals("SUCCESS", paid.get("status"));
        assertEquals("PAY", String.valueOf(paid.get("transactionId")).substring(0, 3));
        assertEquals(3000, scale(paid.get("remainingBalance")));
        assertEquals(3000, balance(clientPrincipal));
        assertTrue(
                walletService.clientTransactions(clientPrincipal).stream()
                        .anyMatch(row -> "DEBIT".equals(row.get("type")) && "SUCCESS".equals(row.get("status"))));

        walletService.pay(clientPrincipal, "FITNESS");
        assertEquals(1000, balance(clientPrincipal));
        ApiException shortfall =
                assertThrows(ApiException.class, () -> walletService.pay(clientPrincipal, "FITNESS"));
        assertEquals(HttpStatus.CONFLICT, shortfall.getStatus());
        assertEquals("Insufficient Wallet Balance", shortfall.getMessage());
        assertEquals(1000, balance(clientPrincipal));

        List<String> notes =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(client.getId()).stream()
                        .map(NotificationEntity::getBody)
                        .toList();
        assertTrue(notes.stream().anyMatch(body -> body.contains("waiting for Admin verification")));
        assertTrue(notes.stream().anyMatch(body -> body.contains("has been approved")));
        assertTrue(notes.stream().anyMatch(body -> body.contains("was rejected. Reason: Receipt could not be verified.")));

        List<String> actions = auditLogRepository.findAll().stream().map(log -> log.getAction()).toList();
        assertTrue(actions.contains("CASH_TOPUP_CREATED"));
        assertTrue(actions.contains("CASH_TOPUP_APPROVED"));
        assertTrue(actions.contains("WALLET_CREDITED"));
        assertTrue(actions.contains("CASH_TOPUP_REJECTED"));
        assertTrue(actions.contains("WALLET_DEBITED"));

        mockMvc.perform(get("/api/admin/wallet/topups").header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isForbidden());
        assertTrue(adminPrincipal.hasRole(com.biofit.backend.user.RoleName.ADMIN));
    }

    private int balance(UserPrincipal principal) {
        return new BigDecimal(String.valueOf(walletService.overview(principal).get("balance"))).intValue();
    }

    private static int scale(Object amount) {
        return new BigDecimal(String.valueOf(amount)).intValue();
    }
}
