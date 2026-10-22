package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_users.domain.ContractDocument;
import pi.ms_users.dto.contractpdf.ContractDocumentInfoDTO;
import pi.ms_users.dto.contractpdf.ContractExtraFieldDTO;
import pi.ms_users.dto.contractpdf.ContractExtractionDTO;
import pi.ms_users.service.interf.IContractPdfService;

import java.nio.charset.StandardCharsets;
import java.util.List;

// PDF del contrato: lectura automatica, adjunto y datos extra
@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractDocumentController {

    private static final String OWN_CONTRACT = "hasRole('admin') or (hasRole('tenant') and @contractAccess.canViewContract(#contractId))";

    private final IContractPdfService contractPdfService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping(value = "/extractFromPdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContractExtractionDTO> extract(@RequestPart("file") MultipartFile file) {
        return contractPdfService.extract(file);
    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping(value = "/{contractId}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContractDocumentInfoDTO> saveDocument(@PathVariable Long contractId, @RequestPart("file") MultipartFile file) {
        return contractPdfService.saveDocument(contractId, file);
    }

    @PreAuthorize(OWN_CONTRACT)
    @GetMapping("/{contractId}/document/info")
    public ResponseEntity<ContractDocumentInfoDTO> getDocumentInfo(@PathVariable Long contractId) {
        return contractPdfService.getDocumentInfo(contractId);
    }

    @PreAuthorize(OWN_CONTRACT)
    @GetMapping("/{contractId}/document")
    public ResponseEntity<byte[]> getDocument(@PathVariable Long contractId) {
        ContractDocument doc = contractPdfService.getDocument(contractId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(doc.getFileName(), StandardCharsets.UTF_8).build().toString())
                .body(doc.getContent());
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{contractId}/document")
    public ResponseEntity<String> deleteDocument(@PathVariable Long contractId) {
        return contractPdfService.deleteDocument(contractId);
    }

    @PreAuthorize(OWN_CONTRACT)
    @GetMapping("/{contractId}/extraFields")
    public ResponseEntity<List<ContractExtraFieldDTO>> getExtraFields(@PathVariable Long contractId) {
        return contractPdfService.getExtraFields(contractId);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{contractId}/extraFields")
    public ResponseEntity<List<ContractExtraFieldDTO>> replaceExtraFields(@PathVariable Long contractId, @RequestBody List<ContractExtraFieldDTO> fields) {
        return contractPdfService.replaceExtraFields(contractId, fields);
    }
}
