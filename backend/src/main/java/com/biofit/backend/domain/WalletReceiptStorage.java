package com.biofit.backend.domain;

import com.biofit.backend.common.ApiException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class WalletReceiptStorage {

    @Value("${biofit.wallet.receipt-max-bytes:5242880}")
    private long maxBytes;

    @Value("${biofit.wallet.receipt-dir:./data/wallet-receipts}")
    private String directory;

    public StoredReceipt store(String requestNumber, MultipartFile file, String previousStoredName) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("VALIDATION_ERROR", "Upload a receipt.", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > maxBytes) {
            throw new ApiException("VALIDATION_ERROR", "Receipt must be 5 MB or smaller.", HttpStatus.BAD_REQUEST);
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new ApiException("VALIDATION_ERROR", "Upload a receipt.", HttpStatus.BAD_REQUEST);
        }
        if (bytes.length == 0 || bytes.length > maxBytes) {
            throw new ApiException("VALIDATION_ERROR", "Receipt must be 5 MB or smaller.", HttpStatus.BAD_REQUEST);
        }
        String detected = detectType(bytes);
        String extension = extensionFor(detected);
        String original = safeOriginal(file.getOriginalFilename(), extension);
        String claimed = extensionOf(original);
        if (!extension.equals(claimed) && !("jpeg".equals(claimed) && "jpg".equals(extension))) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Receipt must be a JPG, JPEG, PNG, or PDF file.",
                    HttpStatus.BAD_REQUEST);
        }
        String storedName = requestNumber + "_receipt." + extension;
        try {
            Path dir = Path.of(directory).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName).normalize();
            if (!target.startsWith(dir)) {
                throw new ApiException("VALIDATION_ERROR", "Upload a receipt.", HttpStatus.BAD_REQUEST);
            }
            Files.write(target, bytes);
            if (previousStoredName != null && !previousStoredName.equals(storedName)) {
                deleteQuietly(dir.resolve(previousStoredName).normalize());
            }
        } catch (IOException ex) {
            throw new ApiException("SERVER_ERROR", "The receipt could not be stored.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new StoredReceipt(storedName, original, detected, bytes.length);
    }

    public byte[] read(String storedName) {
        if (storedName == null || storedName.isBlank() || storedName.contains("..") || storedName.contains("/") || storedName.contains("\\")) {
            throw new ApiException("NOT_FOUND", "Receipt not found.", HttpStatus.NOT_FOUND);
        }
        Path dir = Path.of(directory).toAbsolutePath().normalize();
        Path target = dir.resolve(storedName).normalize();
        if (!target.startsWith(dir) || !Files.isRegularFile(target)) {
            throw new ApiException("NOT_FOUND", "Receipt not found.", HttpStatus.NOT_FOUND);
        }
        try {
            return Files.readAllBytes(target);
        } catch (IOException ex) {
            throw new ApiException("NOT_FOUND", "Receipt not found.", HttpStatus.NOT_FOUND);
        }
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // The new receipt is already stored. A leftover previous file can be cleaned later.
        }
    }

    private static String detectType(byte[] bytes) {
        if (bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47) {
            return "image/png";
        }
        if (bytes.length >= 5 && bytes[0] == '%' && bytes[1] == 'P' && bytes[2] == 'D' && bytes[3] == 'F' && bytes[4] == '-') {
            return "application/pdf";
        }
        throw new ApiException(
                "VALIDATION_ERROR", "Receipt must be a JPG, JPEG, PNG, or PDF file.", HttpStatus.BAD_REQUEST);
    }

    private static String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "application/pdf" -> "pdf";
            default -> throw new ApiException(
                    "VALIDATION_ERROR", "Receipt must be a JPG, JPEG, PNG, or PDF file.", HttpStatus.BAD_REQUEST);
        };
    }

    private static String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) return "";
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static String safeOriginal(String name, String extension) {
        String base = name == null ? "" : name.replace('\\', '/');
        int slash = base.lastIndexOf('/');
        if (slash >= 0) base = base.substring(slash + 1);
        base = base.replaceAll("[^A-Za-z0-9._-]", "_");
        if (base.isBlank() || ".".equals(base) || "..".equals(base)) {
            base = "receipt." + extension;
        }
        return base.length() <= 180 ? base : base.substring(base.length() - 180);
    }

    public record StoredReceipt(String storedName, String originalName, String contentType, long size) {}
}
