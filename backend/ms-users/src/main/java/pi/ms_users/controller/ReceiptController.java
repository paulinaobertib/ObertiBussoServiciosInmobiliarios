package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.ReceiptIssuer;
import pi.ms_users.domain.ReceiptKind;
import pi.ms_users.domain.ReceiptStatus;
import pi.ms_users.dto.receipt.ReceiptDTO;
import pi.ms_users.dto.receipt.ReceiptGetDTO;
import pi.ms_users.service.interf.IReceiptService;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final IReceiptService receiptService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<ReceiptGetDTO> create(@RequestBody ReceiptDTO dto) {
        return receiptService.create(dto);
    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/preview")
    public ResponseEntity<byte[]> preview(@RequestBody ReceiptDTO dto) {
        return pdf(receiptService.preview(dto), "Borrador.pdf", true);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/search")
    public ResponseEntity<List<ReceiptGetDTO>> search(@RequestParam(required = false) ReceiptIssuer issuer,
                                                      @RequestParam(required = false) ReceiptKind kind,
                                                      @RequestParam(required = false) ReceiptStatus status,
                                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                                      @RequestParam(required = false) String q) {
        return receiptService.search(issuer, kind, status, from, to, q);
    }

    @PreAuthorize("hasRole('admin') or (hasRole('tenant') and @contractAccess.canViewReceipt(#id))")
    @GetMapping("/getById/{id}")
    public ResponseEntity<ReceiptGetDTO> getById(@PathVariable Long id) {
        return receiptService.getById(id);
    }

    @PreAuthorize("hasRole('admin') or (hasRole('tenant') and @contractAccess.canViewReceipt(#id))")
    @GetMapping("/pdf/{id}")
    public ResponseEntity<byte[]> getPdf(@PathVariable Long id) {
        return pdf(receiptService.getPdf(id), receiptService.getFileName(id), false);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<ReceiptGetDTO>> getByContract(@PathVariable Long contractId) {
        return receiptService.getByContract(contractId);
    }

    @PreAuthorize("hasRole('tenant') and @contractAccess.canViewReceipts()")
    @GetMapping("/mine")
    public ResponseEntity<List<ReceiptGetDTO>> getMine() {
        return receiptService.getMine();
    }

    @PreAuthorize("hasRole('admin')")
    @PatchMapping("/annul/{id}")
    public ResponseEntity<ReceiptGetDTO> annul(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        return receiptService.annul(id, body != null ? body.get("reason") : null);
    }

    private ResponseEntity<byte[]> pdf(byte[] bytes, String fileName, boolean inline) {
        ContentDisposition disposition = (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
                .filename(fileName, StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(bytes);
    }
}
