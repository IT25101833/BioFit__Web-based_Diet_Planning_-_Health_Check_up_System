package com.biofit.backend.domain;

import com.biofit.backend.audit.AuditService;
import com.biofit.backend.common.ApiException;
import com.biofit.backend.domain.WalletReceiptStorage.StoredReceipt;
import com.biofit.backend.security.UserPrincipal;
import com.biofit.backend.user.RoleName;
import com.biofit.backend.user.User;
import com.biofit.backend.user.UserRepository;
import com.biofit.backend.user.UserStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class WalletService {

    static final ZoneId ZONE = ZoneId.of("Asia/Colombo");
    private static final BigDecimal MAX_AMOUNT = new BigDecimal("1000000.00");
    private static final DateTimeFormatter WHEN =
            DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a", Locale.US).withZone(ZONE);
    private static final DateTimeFormatter DAY =
            DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH).withZone(ZONE);
    private static final List<ServiceOffer> SERVICES =
            List.of(
                    new ServiceOffer("FITNESS", "Fitness Service", new BigDecimal("2000.00")),
                    new ServiceOffer("NUTRITION", "Nutrition Service", new BigDecimal("1000.00")),
                    new ServiceOffer("MEDICAL", "Medical Service", new BigDecimal("1500.00")));

    private final WalletRepository walletRepository;
    private final WalletTopUpRequestRepository topUpRepository;
    private final WalletTransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final AuditService auditService;
    private final WalletReceiptStorage receiptStorage;

    @Transactional
    public Map<String, Object> overview(UserPrincipal principal) {
        User client = requireClientUser(principal);
        Wallet wallet = ensureWallet(client.getId());
        Map<String, Object> row = walletMap(wallet, client);
        row.put(
                "recentTransactions",
                transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                        .limit(5)
                        .map(this::transactionMap)
                        .toList());
        return row;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> services() {
        return SERVICES.stream().map(this::serviceMap).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> clientTopUps(UserPrincipal principal) {
        requireClient(principal);
        return topUpRepository.findByClientIdOrderByCreatedAtDesc(principal.getId()).stream()
                .map(request -> topUpMap(request, false))
                .toList();
    }

    @Transactional
    public List<Map<String, Object>> clientTransactions(UserPrincipal principal) {
        User client = requireClientUser(principal);
        Wallet wallet = ensureWallet(client.getId());
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                .map(this::transactionMap)
                .toList();
    }

    @Transactional
    public Map<String, Object> submitTopUp(
            UserPrincipal principal, BigDecimal amount, String note, MultipartFile receipt) {
        User client = requireClientUser(principal);
        BigDecimal value = money(amount);
        Wallet wallet = ensureWallet(client.getId());
        String requestNumber = nextNumber("TOPUP");
        StoredReceipt stored = receiptStorage.store(requestNumber, receipt, null);

        WalletTopUpRequest request = new WalletTopUpRequest();
        request.setRequestNumber(requestNumber);
        request.setClientId(client.getId());
        request.setClientCode("BF-C" + client.getId());
        request.setClientName(client.getFullName());
        request.setWalletId(wallet.getId());
        request.setAmount(value);
        request.setNote(blankToNull(note, 500));
        request.setStatus(WalletTopUpRequest.PENDING);
        applyReceipt(request, stored, client.getId());
        topUpRepository.save(request);

        notify(
                client.getId(),
                "Your cash top-up request "
                        + requestNumber
                        + " for "
                        + moneyLabel(value)
                        + " has been submitted and is waiting for Admin verification.");
        audit(
                client.getId(),
                "CASH_TOPUP_CREATED",
                requestNumber,
                "Client " + client.getFullName() + " submitted " + requestNumber + " for " + moneyLabel(value));
        return topUpMap(request, false);
    }

    @Transactional
    public Map<String, Object> updatePending(
            UserPrincipal principal, Long id, BigDecimal amount, String note, MultipartFile receipt) {
        User client = requireClientUser(principal);
        WalletTopUpRequest request = requireOwned(client.getId(), id);
        if (!WalletTopUpRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT", "Only a pending top-up request can be changed.", HttpStatus.CONFLICT);
        }
        if (amount != null) request.setAmount(money(amount));
        if (note != null) request.setNote(blankToNull(note, 500));
        if (receipt != null && !receipt.isEmpty()) {
            StoredReceipt stored =
                    receiptStorage.store(request.getRequestNumber(), receipt, request.getReceiptStoredName());
            applyReceipt(request, stored, client.getId());
        }
        if (request.getReceiptStoredName() == null) {
            throw new ApiException("VALIDATION_ERROR", "Upload a receipt.", HttpStatus.BAD_REQUEST);
        }
        topUpRepository.save(request);
        return topUpMap(request, false);
    }

    @Transactional
    public Map<String, Object> cancel(UserPrincipal principal, Long id) {
        User client = requireClientUser(principal);
        WalletTopUpRequest request = requireOwned(client.getId(), id);
        if (!WalletTopUpRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT", "Only a pending top-up request can be cancelled.", HttpStatus.CONFLICT);
        }
        request.setStatus(WalletTopUpRequest.CANCELLED);
        topUpRepository.save(request);
        return topUpMap(request, false);
    }

    @Transactional
    public Map<String, Object> pay(UserPrincipal principal, String serviceCode) {
        User client = requireClientUser(principal);
        ServiceOffer service =
                SERVICES.stream()
                        .filter(item -> item.code().equalsIgnoreCase(serviceCode == null ? "" : serviceCode.trim()))
                        .findFirst()
                        .orElseThrow(
                                () -> new ApiException("VALIDATION_ERROR", "Select a BioFit service.", HttpStatus.BAD_REQUEST));
        Wallet wallet =
                walletRepository
                        .findByIdForUpdate(ensureWallet(client.getId()).getId())
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Wallet not found.", HttpStatus.NOT_FOUND));
        BigDecimal previous = scale(wallet.getBalance());
        if (previous.compareTo(service.price()) < 0) {
            throw new ApiException("INSUFFICIENT_BALANCE", "Insufficient Wallet Balance", HttpStatus.CONFLICT);
        }
        BigDecimal next = previous.subtract(service.price());
        wallet.setBalance(next);
        String reference = nextNumber("PAY");

        PaymentEntity payment = new PaymentEntity();
        payment.setId(reference);
        payment.setUserId(client.getId());
        payment.setAmount(service.price());
        payment.setCurrency("LKR");
        payment.setStatus("SUCCESS");
        payment.setMethodLabel("Wallet");
        payment.setDescription(service.name());
        payment.setPaidAt(Instant.now());
        payment.setCreatedAt(Instant.now());
        paymentRepository.save(payment);

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWalletId(wallet.getId());
        transaction.setPaymentId(reference);
        transaction.setType(WalletTransaction.DEBIT);
        transaction.setAmount(service.price());
        transaction.setDescription(service.name());
        transaction.setPaymentMethod(WalletTransaction.WALLET);
        transaction.setReference(reference);
        transaction.setBalanceAfter(next);
        transaction.setStatus("SUCCESS");
        transaction.setCreatedBy(client.getId());
        walletRepository.save(wallet);
        transactionRepository.save(transaction);

        audit(
                client.getId(),
                "WALLET_DEBITED",
                reference,
                "Client " + client.getFullName() + " paid " + moneyLabel(service.price()) + " for " + service.name()
                        + ". Previous Balance: " + moneyLabel(previous) + ". New Balance: " + moneyLabel(next));

        Map<String, Object> confirmation = new LinkedHashMap<>();
        confirmation.put("status", "SUCCESS");
        confirmation.put("service", service.name());
        confirmation.put("serviceCode", service.code());
        confirmation.put("amount", service.price());
        confirmation.put("paymentMethod", "Wallet");
        confirmation.put("previousBalance", previous);
        confirmation.put("remainingBalance", next);
        confirmation.put("transactionId", reference);
        confirmation.put("balance", next);
        return confirmation;
    }

    public ReceiptDownload receiptForClient(UserPrincipal principal, Long id) {
        requireClient(principal);
        WalletTopUpRequest request = requireOwned(principal.getId(), id);
        return download(request);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> adminTopUps(UserPrincipal principal, String status, String range, String from, String to, String query) {
        requireAdmin(principal);
        List<WalletTopUpRequest> all = topUpRepository.findAllByOrderByCreatedAtDesc();
        LocalDate fromDate = parseDay(from);
        LocalDate toDate = parseDay(to);
        String needle = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (WalletTopUpRequest request : all) {
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status) && !status.equalsIgnoreCase(request.getStatus())) {
                continue;
            }
            if (!inRange(request.getCreatedAt(), range, fromDate, toDate)) continue;
            if (!needle.isBlank() && !matches(request, needle)) continue;
            rows.add(topUpMap(request, true));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("requests", rows);
        out.put("summary", summary(all));
        return out;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> adminTopUp(UserPrincipal principal, Long id) {
        requireAdmin(principal);
        WalletTopUpRequest request = require(id);
        Map<String, Object> row = topUpMap(request, true);
        Wallet wallet = walletRepository.findById(request.getWalletId()).orElse(null);
        BigDecimal current = wallet == null ? BigDecimal.ZERO.setScale(2) : scale(wallet.getBalance());
        row.put("currentBalance", current);
        if (WalletTopUpRequest.PENDING.equals(request.getStatus())) {
            row.put("balanceAfterApproval", current.add(scale(request.getAmount())));
        } else if (WalletTopUpRequest.APPROVED.equals(request.getStatus())) {
            row.put(
                    "balanceAfterApproval",
                    transactionRepository
                            .findByTopUpRequestIdAndType(request.getId(), WalletTransaction.CREDIT)
                            .map(tx -> scale(tx.getBalanceAfter()))
                            .orElse(current));
        } else {
            row.put("balanceAfterApproval", current);
        }
        return row;
    }

    public ReceiptDownload receiptForAdmin(UserPrincipal principal, Long id) {
        requireAdmin(principal);
        return download(require(id));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> adminWallets(UserPrincipal principal) {
        requireAdmin(principal);
        Map<Long, WalletTransaction> latestByWallet = new java.util.HashMap<>();
        for (WalletTransaction transaction : transactionRepository.findAllByOrderByCreatedAtDesc()) {
            latestByWallet.putIfAbsent(transaction.getWalletId(), transaction);
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (User client : userRepository.findActiveByRole(RoleName.CLIENT, UserStatus.ACTIVE)) {
            Wallet wallet = walletRepository.findByClientId(client.getId()).orElse(null);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("clientId", client.getId());
            row.put("clientCode", "BF-C" + client.getId());
            row.put("clientName", client.getFullName());
            row.put("balance", wallet == null ? BigDecimal.ZERO.setScale(2) : scale(wallet.getBalance()));
            row.put("walletId", wallet == null ? null : wallet.getId());
            row.put("walletStatus", wallet == null ? "NOT_OPENED" : "ACTIVE");
            WalletTransaction latest = wallet == null ? null : latestByWallet.get(wallet.getId());
            row.put("lastTransaction", latest == null ? null : latest.getDescription());
            row.put("lastTransactionDate", latest == null ? null : label(latest.getCreatedAt(), DAY));
            row.put("lastTransactionReference", latest == null ? null : latest.getReference());
            rows.add(row);
        }
        return rows;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> adminWallet(UserPrincipal principal, Long clientId) {
        requireAdmin(principal);
        User client =
                userRepository
                        .findById(clientId)
                        .filter(user -> user.getDeletedAt() == null)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Client not found.", HttpStatus.NOT_FOUND));
        Wallet wallet = walletRepository.findByClientId(client.getId()).orElse(null);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("clientId", client.getId());
        row.put("clientCode", "BF-C" + client.getId());
        row.put("clientName", client.getFullName());
        row.put("balance", wallet == null ? BigDecimal.ZERO.setScale(2) : scale(wallet.getBalance()));
        row.put("walletId", wallet == null ? null : wallet.getId());
        row.put("walletStatus", wallet == null ? "NOT_OPENED" : "ACTIVE");
        List<Map<String, Object>> transactions =
                wallet == null
                        ? List.of()
                        : transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                                .map(this::transactionMap)
                                .toList();
        row.put("transactions", transactions);
        return row;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> adminTransactions(UserPrincipal principal) {
        requireAdmin(principal);
        Map<Long, Wallet> wallets = new java.util.HashMap<>();
        walletRepository.findAll().forEach(wallet -> wallets.put(wallet.getId(), wallet));
        Map<Long, User> clients = new java.util.HashMap<>();
        userRepository.findAll().forEach(user -> clients.put(user.getId(), user));
        return transactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(transaction -> {
                    Map<String, Object> row = transactionMap(transaction);
                    Wallet wallet = wallets.get(transaction.getWalletId());
                    User client = wallet == null ? null : clients.get(wallet.getClientId());
                    row.put("clientId", wallet == null ? null : wallet.getClientId());
                    row.put("clientName", client == null ? null : client.getFullName());
                    row.put("clientCode", wallet == null ? null : "BF-C" + wallet.getClientId());
                    return row;
                })
                .toList();
    }

    @Transactional
    public Map<String, Object> approve(UserPrincipal principal, Long id) {
        User admin = requireAdminUser(principal);
        WalletTopUpRequest request =
                topUpRepository
                        .findByIdForUpdate(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Top-up request not found.", HttpStatus.NOT_FOUND));
        if (!WalletTopUpRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT", "This top-up request has already been processed.", HttpStatus.CONFLICT);
        }
        if (request.getReceiptStoredName() == null || request.getReceiptStoredName().isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "A receipt is required before approval.", HttpStatus.BAD_REQUEST);
        }
        money(request.getAmount());
        User client =
                userRepository
                        .findById(request.getClientId())
                        .filter(user -> user.getDeletedAt() == null)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Client not found.", HttpStatus.NOT_FOUND));
        Wallet wallet =
                walletRepository
                        .findByIdForUpdate(request.getWalletId())
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Wallet not found.", HttpStatus.NOT_FOUND));
        if (transactionRepository.findByTopUpRequestIdAndType(request.getId(), WalletTransaction.CREDIT).isPresent()) {
            throw new ApiException(
                    "CONFLICT", "This top-up request has already been processed.", HttpStatus.CONFLICT);
        }

        BigDecimal previous = scale(wallet.getBalance());
        BigDecimal next = previous.add(scale(request.getAmount()));
        wallet.setBalance(next);
        request.setStatus(WalletTopUpRequest.APPROVED);
        request.setApprovedBy(admin.getId());
        request.setApprovedByName(admin.getFullName());
        request.setApprovedAt(Instant.now());

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWalletId(wallet.getId());
        transaction.setTopUpRequestId(request.getId());
        transaction.setType(WalletTransaction.CREDIT);
        transaction.setAmount(scale(request.getAmount()));
        transaction.setDescription("Cash Top-Up");
        transaction.setPaymentMethod(WalletTransaction.CASH);
        transaction.setReference(request.getRequestNumber());
        transaction.setBalanceAfter(next);
        transaction.setStatus(WalletTopUpRequest.APPROVED);
        transaction.setCreatedBy(admin.getId());

        walletRepository.save(wallet);
        topUpRepository.save(request);
        transactionRepository.save(transaction);

        String details =
                "Admin: " + admin.getFullName()
                        + ". Client: " + client.getFullName()
                        + ". Request: " + request.getRequestNumber()
                        + ". Amount: " + moneyLabel(request.getAmount())
                        + ". Previous Balance: " + moneyLabel(previous)
                        + ". New Balance: " + moneyLabel(next);
        audit(admin.getId(), "CASH_TOPUP_APPROVED", request.getRequestNumber(), details);
        audit(admin.getId(), "WALLET_CREDITED", request.getRequestNumber(), details);
        notify(
                client.getId(),
                "Your cash top-up request "
                        + request.getRequestNumber()
                        + " has been approved. "
                        + moneyLabel(request.getAmount())
                        + " has been added to your wallet.");
        return adminTopUp(principal, request.getId());
    }

    @Transactional
    public Map<String, Object> reject(UserPrincipal principal, Long id, String reason) {
        User admin = requireAdminUser(principal);
        WalletTopUpRequest request =
                topUpRepository
                        .findByIdForUpdate(id)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Top-up request not found.", HttpStatus.NOT_FOUND));
        if (!WalletTopUpRequest.PENDING.equals(request.getStatus())) {
            throw new ApiException(
                    "CONFLICT", "This top-up request has already been processed.", HttpStatus.CONFLICT);
        }
        String rejection = required(reason, "Enter a rejection reason.", 500);
        request.setStatus(WalletTopUpRequest.REJECTED);
        request.setRejectionReason(rejection);
        request.setRejectedBy(admin.getId());
        request.setRejectedByName(admin.getFullName());
        request.setRejectedAt(Instant.now());
        topUpRepository.save(request);
        audit(
                admin.getId(),
                "CASH_TOPUP_REJECTED",
                request.getRequestNumber(),
                "Admin: " + admin.getFullName() + ". Client: " + request.getClientName()
                        + ". Request: " + request.getRequestNumber()
                        + ". Amount: " + moneyLabel(request.getAmount())
                        + ". Reason: " + rejection);
        notify(
                request.getClientId(),
                "Your cash top-up request "
                        + request.getRequestNumber()
                        + " was rejected. Reason: "
                        + rejection);
        return adminTopUp(principal, request.getId());
    }

    public void rejectDirectBalanceChange() {
        throw new ApiException(
                "FORBIDDEN", "Clients cannot change wallet balance directly.", HttpStatus.FORBIDDEN);
    }

    private ReceiptDownload download(WalletTopUpRequest request) {
        if (request.getReceiptStoredName() == null) {
            throw new ApiException("NOT_FOUND", "Receipt not found.", HttpStatus.NOT_FOUND);
        }
        byte[] bytes = receiptStorage.read(request.getReceiptStoredName());
        return new ReceiptDownload(
                bytes,
                request.getReceiptContentType() == null ? "application/octet-stream" : request.getReceiptContentType(),
                request.getReceiptOriginalName() == null ? request.getReceiptStoredName() : request.getReceiptOriginalName());
    }

    private Wallet ensureWallet(Long clientId) {
        return walletRepository
                .findByClientId(clientId)
                .orElseGet(
                        () -> {
                            Wallet wallet = new Wallet();
                            wallet.setClientId(clientId);
                            wallet.setBalance(BigDecimal.ZERO.setScale(2));
                            return walletRepository.save(wallet);
                        });
    }

    private void applyReceipt(WalletTopUpRequest request, StoredReceipt stored, Long userId) {
        request.setReceiptStoredName(stored.storedName());
        request.setReceiptOriginalName(stored.originalName());
        request.setReceiptContentType(stored.contentType());
        request.setReceiptSize(stored.size());
        request.setReceiptUploadedAt(Instant.now());
        request.setReceiptUploadedBy(userId);
    }

    private String nextNumber(String prefix) {
        String day = LocalDate.now(ZONE).format(DateTimeFormatter.BASIC_ISO_DATE);
        String start = prefix + "-" + day + "-";
        long count =
                "PAY".equals(prefix)
                        ? transactionRepository.countByReferenceStartingWith(start)
                        : topUpRepository.countByRequestNumberStartingWith(start);
        return start + String.format("%03d", count + 1);
    }

    private Map<String, Object> summary(List<WalletTopUpRequest> all) {
        LocalDate today = LocalDate.now(ZONE);
        long pending = all.stream().filter(row -> WalletTopUpRequest.PENDING.equals(row.getStatus())).count();
        long approvedToday =
                all.stream()
                        .filter(row -> WalletTopUpRequest.APPROVED.equals(row.getStatus()) && isSameDay(row.getApprovedAt(), today))
                        .count();
        long rejectedToday =
                all.stream()
                        .filter(row -> WalletTopUpRequest.REJECTED.equals(row.getStatus()) && isSameDay(row.getRejectedAt(), today))
                        .count();
        BigDecimal cashToday =
                all.stream()
                        .filter(row -> WalletTopUpRequest.APPROVED.equals(row.getStatus()) && isSameDay(row.getApprovedAt(), today))
                        .map(row -> scale(row.getAmount()))
                        .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("pending", pending);
        summary.put("approvedToday", approvedToday);
        summary.put("rejectedToday", rejectedToday);
        summary.put("cashTotalToday", cashToday);
        return summary;
    }

    private boolean isSameDay(Instant instant, LocalDate day) {
        return instant != null && instant.atZone(ZONE).toLocalDate().equals(day);
    }

    private boolean inRange(Instant created, String range, LocalDate from, LocalDate to) {
        if (range == null || range.isBlank() || "ALL".equalsIgnoreCase(range)) return true;
        if (created == null) return false;
        LocalDate day = created.atZone(ZONE).toLocalDate();
        LocalDate today = LocalDate.now(ZONE);
        return switch (range.toUpperCase(Locale.ROOT)) {
            case "TODAY" -> day.equals(today);
            case "WEEK" -> {
                LocalDate start = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                yield !day.isBefore(start) && !day.isAfter(today);
            }
            case "MONTH" -> day.getYear() == today.getYear() && day.getMonth() == today.getMonth();
            case "CUSTOM" -> (from == null || !day.isBefore(from)) && (to == null || !day.isAfter(to));
            default -> true;
        };
    }

    private boolean matches(WalletTopUpRequest request, String needle) {
        return contains(request.getClientName(), needle)
                || contains(request.getClientCode(), needle)
                || contains(request.getRequestNumber(), needle)
                || contains(String.valueOf(request.getClientId()), needle);
    }

    private static boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private Map<String, Object> walletMap(Wallet wallet, User client) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("walletId", wallet.getId());
        row.put("clientId", client.getId());
        row.put("clientCode", "BF-C" + client.getId());
        row.put("clientName", client.getFullName());
        row.put("balance", scale(wallet.getBalance()));
        return row;
    }

    private Map<String, Object> topUpMap(WalletTopUpRequest request, boolean admin) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", request.getId());
        row.put("requestNumber", request.getRequestNumber());
        row.put("clientId", request.getClientId());
        row.put("clientCode", request.getClientCode());
        row.put("clientName", request.getClientName());
        row.put("walletId", request.getWalletId());
        row.put("amount", scale(request.getAmount()));
        row.put("paymentMethod", "Cash");
        row.put("note", request.getNote());
        row.put("status", request.getStatus());
        row.put("rejectionReason", request.getRejectionReason());
        row.put("receiptFileName", request.getReceiptStoredName());
        row.put("receiptOriginalName", request.getReceiptOriginalName());
        row.put("receiptContentType", request.getReceiptContentType());
        row.put("receiptSize", request.getReceiptSize());
        row.put("receiptUploadedAt", request.getReceiptUploadedAt());
        row.put("receiptUploadedLabel", label(request.getReceiptUploadedAt(), DAY));
        row.put("uploadedBy", request.getReceiptUploadedBy());
        row.put("approvedBy", request.getApprovedBy());
        row.put("approvedByName", request.getApprovedByName());
        row.put("approvedAt", request.getApprovedAt());
        row.put("approvedLabel", label(request.getApprovedAt(), WHEN));
        row.put("rejectedBy", request.getRejectedBy());
        row.put("rejectedByName", request.getRejectedByName());
        row.put("rejectedAt", request.getRejectedAt());
        row.put("rejectedLabel", label(request.getRejectedAt(), WHEN));
        row.put("processedBy", request.getApprovedByName() != null ? request.getApprovedByName() : request.getRejectedByName());
        row.put("processedAt", request.getApprovedAt() != null ? request.getApprovedAt() : request.getRejectedAt());
        row.put("processedLabel", label(request.getApprovedAt() != null ? request.getApprovedAt() : request.getRejectedAt(), WHEN));
        row.put("createdAt", request.getCreatedAt());
        row.put("submittedLabel", label(request.getCreatedAt(), WHEN));
        row.put("submittedDateLabel", label(request.getCreatedAt(), DAY));
        String base = admin ? "/api/admin/wallet/topups/" : "/api/client/wallet/topups/";
        row.put("receiptUrl", request.getReceiptStoredName() == null ? null : base + request.getId() + "/receipt");
        return row;
    }

    private Map<String, Object> transactionMap(WalletTransaction transaction) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", transaction.getId());
        row.put("walletId", transaction.getWalletId());
        row.put("paymentId", transaction.getPaymentId());
        row.put("topUpRequestId", transaction.getTopUpRequestId());
        row.put("type", transaction.getType());
        row.put("amount", scale(transaction.getAmount()));
        row.put("description", transaction.getDescription());
        row.put("paymentMethod", transaction.getPaymentMethod());
        row.put("reference", transaction.getReference());
        row.put("transactionId", transaction.getReference());
        row.put("balanceAfter", scale(transaction.getBalanceAfter()));
        row.put("status", transaction.getStatus());
        row.put("createdBy", transaction.getCreatedBy());
        row.put("createdAt", transaction.getCreatedAt());
        row.put("dateLabel", label(transaction.getCreatedAt(), DAY));
        return row;
    }

    private Map<String, Object> serviceMap(ServiceOffer service) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("code", service.code());
        row.put("name", service.name());
        row.put("amount", service.price());
        return row;
    }

    private WalletTopUpRequest require(Long id) {
        return topUpRepository
                .findById(id)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Top-up request not found.", HttpStatus.NOT_FOUND));
    }

    private WalletTopUpRequest requireOwned(Long clientId, Long id) {
        WalletTopUpRequest request = require(id);
        if (!clientId.equals(request.getClientId())) {
            throw new ApiException("FORBIDDEN", "You cannot access this top-up request.", HttpStatus.FORBIDDEN);
        }
        return request;
    }

    private User requireClientUser(UserPrincipal principal) {
        requireClient(principal);
        User user =
                userRepository
                        .findById(principal.getId())
                        .filter(row -> row.getDeletedAt() == null)
                        .orElseThrow(() -> new ApiException("NOT_FOUND", "Account not found.", HttpStatus.NOT_FOUND));
        boolean client =
                user.getRoles() != null && user.getRoles().stream().anyMatch(role -> role.getName() == RoleName.CLIENT);
        if (!client || user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException("FORBIDDEN", "Only a client can use this wallet.", HttpStatus.FORBIDDEN);
        }
        return user;
    }

    private User requireAdminUser(UserPrincipal principal) {
        requireAdmin(principal);
        return userRepository
                .findById(principal.getId())
                .filter(row -> row.getDeletedAt() == null)
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Account not found.", HttpStatus.NOT_FOUND));
    }

    private void requireClient(UserPrincipal principal) {
        if (principal == null || !principal.hasRole(RoleName.CLIENT)) {
            throw new ApiException("FORBIDDEN", "Only a client can use this wallet.", HttpStatus.FORBIDDEN);
        }
    }

    private void requireAdmin(UserPrincipal principal) {
        if (principal == null
                || !(principal.hasRole(RoleName.ADMIN)
                        || principal.hasRole(RoleName.DIGITAL_OPERATIONS_EXECUTIVE))) {
            throw new ApiException(
                    "FORBIDDEN", "Only an Admin can review cash top-up requests.", HttpStatus.FORBIDDEN);
        }
    }

    private void notify(Long userId, String body) {
        NotificationEntity notice = new NotificationEntity();
        notice.setId("ntf-" + UUID.randomUUID().toString().substring(0, 8));
        notice.setUserId(userId);
        notice.setAudience("CLIENT");
        notice.setType("wallet");
        notice.setTitle("Wallet");
        notice.setBody(body);
        notice.setLink("/client/wallet");
        notice.setReadFlag(false);
        notice.setCreatedAt(Instant.now());
        notificationRepository.save(notice);
    }

    private void audit(Long userId, String action, String entityId, String details) {
        auditService.log(userId, action, "Wallet", entityId, "SUCCESS", null, null, details);
    }

    private static BigDecimal money(BigDecimal amount) {
        if (amount == null) {
            throw new ApiException("VALIDATION_ERROR", "Enter an amount greater than zero.", HttpStatus.BAD_REQUEST);
        }
        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP);
        if (scaled.compareTo(new BigDecimal("0.01")) < 0) {
            throw new ApiException("VALIDATION_ERROR", "Enter an amount greater than zero.", HttpStatus.BAD_REQUEST);
        }
        if (scaled.compareTo(MAX_AMOUNT) > 0) {
            throw new ApiException(
                    "VALIDATION_ERROR", "Enter an amount of Rs. 1,000,000 or less.", HttpStatus.BAD_REQUEST);
        }
        return scaled;
    }

    private static BigDecimal scale(BigDecimal amount) {
        return (amount == null ? BigDecimal.ZERO : amount).setScale(2, RoundingMode.HALF_UP);
    }

    static String moneyLabel(BigDecimal amount) {
        DecimalFormat format = new DecimalFormat("#,##0.##", DecimalFormatSymbols.getInstance(Locale.US));
        return "Rs. " + format.format(scale(amount));
    }

    private static String label(Instant instant, DateTimeFormatter formatter) {
        return instant == null ? null : formatter.format(instant);
    }

    private static LocalDate parseDay(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalDate.parse(value.trim().substring(0, Math.min(10, value.trim().length())));
    }

    private static String required(String value, String message, int max) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.isEmpty()) {
            throw new ApiException("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
        }
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    private static String blankToNull(String value, int max) {
        if (value == null || value.isBlank()) return null;
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    public record ReceiptDownload(byte[] bytes, String contentType, String fileName) {}

    private record ServiceOffer(String code, String name, BigDecimal price) {}
}
