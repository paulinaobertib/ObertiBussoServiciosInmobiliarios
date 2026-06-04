package pi.ms_properties.wasi;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Property;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.IWasiPropertySyncRepository;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WasiPdfService {

    private final WasiApiClient wasiApiClient;
    private final WasiApiProperties wasiApiProperties;
    private final IWasiPropertySyncRepository syncRepository;
    private final IPropertyRepository propertyRepository;

    public ResponseEntity<?> pdfForWasiPropertyId(int wasiPropertyId) {
        if (!wasiApiProperties.isConfigured()) {
            return ResponseEntity.notFound().build();
        }
        String url = httpsUrl(wasiApiClient.makePdfUrl(wasiPropertyId));
        if (url != null && !url.isBlank()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("url", url));
        }
        return ResponseEntity.notFound().build();
    }

    public ResponseEntity<?> pdfForProperty(Long propertyId) {
        var syncOpt = syncRepository.findByProperty_Id(propertyId);
        if (syncOpt.isPresent() && wasiApiProperties.isConfigured()) {
            String url = httpsUrl(wasiApiClient.makePdfUrl(syncOpt.get().getWasiPropertyId()));
            if (url != null && !url.isBlank()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("url", url));
            }
        }
        Property p = propertyRepository.findById(propertyId).orElse(null);
        if (p == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] pdf = buildLocalPdf(p);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=propiedad-" + propertyId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private byte[] buildLocalPdf(Property p) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document();
            PdfWriter.getInstance(doc, baos);
            doc.open();
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font body = FontFactory.getFont(FontFactory.HELVETICA, 11);
            doc.add(new Paragraph(p.getTitle() != null ? p.getTitle() : "Propiedad", titleFont));
            doc.add(new Paragraph(" ", body));
            doc.add(new Paragraph("Dirección: " + nullSafe(p.getStreet()) + " " + nullSafe(p.getNumber()), body));
            doc.add(new Paragraph("Precio: " + (p.getPrice() != null ? p.getPrice().toPlainString() : "-"), body));
            doc.add(new Paragraph("Operación: " + (p.getOperation() != null ? p.getOperation().name() : "-"), body));
            doc.add(new Paragraph("Estado: " + (p.getStatus() != null ? p.getStatus().name() : "-"), body));
            doc.add(new Paragraph("Descripción:", body));
            doc.add(new Paragraph(nullSafe(p.getDescription()), body));
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Local PDF error", e);
            return new byte[0];
        }
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    /** Wasi devuelve el Location del PDF como http://; se fuerza a https para evitar mixed-content. */
    private static String httpsUrl(String url) {
        if (url == null) {
            return null;
        }
        return url.startsWith("http://") ? "https://" + url.substring("http://".length()) : url;
    }
}
