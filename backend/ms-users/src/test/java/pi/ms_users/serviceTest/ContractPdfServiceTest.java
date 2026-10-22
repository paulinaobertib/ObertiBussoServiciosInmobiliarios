package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ServiceUnavailableException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import pi.ms_users.contractpdf.ContractAiClient;
import pi.ms_users.contractpdf.ContractPdfReader;
import pi.ms_users.contractpdf.PdfContent;
import pi.ms_users.domain.ContractDocument;
import pi.ms_users.domain.ContractExtraField;
import pi.ms_users.domain.ContractType;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.contractpdf.ContractExtraFieldDTO;
import pi.ms_users.dto.contractpdf.ContractExtractionDTO;
import pi.ms_users.repository.IContractDocumentRepository;
import pi.ms_users.repository.IContractExtraFieldRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.service.impl.ContractPdfService;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ContractPdfServiceTest {

    private ContractAiClient aiClient;
    private IContractRepository contractRepository;
    private IContractDocumentRepository documentRepository;
    private IContractExtraFieldRepository extraFieldRepository;
    private ContractPdfService service;

    @BeforeEach
    void setUp() {
        aiClient = mock(ContractAiClient.class);
        contractRepository = mock(IContractRepository.class);
        documentRepository = mock(IContractDocumentRepository.class);
        extraFieldRepository = mock(IContractExtraFieldRepository.class);
        service = new ContractPdfService(new ContractPdfReader(), aiClient, contractRepository, documentRepository, extraFieldRepository);
    }

    static byte[] textPdf(String... lines) throws Exception {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                cs.newLineAtOffset(40, 740);
                for (String line : lines) {
                    cs.showText(line);
                    cs.newLineAtOffset(0, -14);
                }
                cs.endText();
            }
            doc.save(out);
            return out.toByteArray();
        }
    }

    static byte[] scannedPdf() throws Exception {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            BufferedImage img = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.drawImage(LosslessFactory.createFromImage(doc, img), 50, 400, 200, 200);
            }
            doc.save(out);
            return out.toByteArray();
        }
    }

    static final String CONTRACT_LINES = "CONTRATO DE LOCACION DE INMUEBLE DESTINADO A VIVIENDA entre Silvina Quintana (LOCADORA) y Marianela Pirani (LOCATARIA).";

    static final String AI_JSON = """
            Aca va el resultado:
            {
              "tenant": {"fullName": "Marianela Pirani", "dni": "30.111.222", "email": null, "phone": null, "address": null},
              "owner": {"fullName": "Silvina Verónica Quintana", "dni": null, "email": null, "phone": null, "address": null},
              "property": {"address": "9 de Julio 3225, Depto 3, 1° piso", "city": "Córdoba", "description": null},
              "contractType": "vivienda",
              "startDate": "2025-03-01",
              "endDate": null,
              "durationMonths": 36,
              "currency": "ARS",
              "initialAmount": "350.000",
              "adjustmentIndex": "ICL",
              "adjustmentFrequencyMonths": 6,
              "hasDeposit": null,
              "depositAmount": "350.000,00",
              "depositNote": "Se devuelve al finalizar",
              "guarantors": [{"fullName": "Juan Pérez", "dni": "20.333.444"}, {"fullName": null}],
              "utilities": ["Luz", "Gas", "Luz", "Rentas"],
              "extraFields": [{"label": "Día de pago", "value": "Del 1 al 10 de cada mes"}, {"label": "Punitorios", "value": null}],
              "warnings": ["La cláusula 5 menciona otro monto"]
            }
            """;

    @Test
    void parseNormalizesWhatTheAiReturns() {
        ContractExtractionDTO dto = service.parse(AI_JSON);

        assertEquals("Marianela Pirani", dto.getTenant().getFullName());
        assertEquals(ContractType.VIVIENDA, dto.getContractType());
        assertEquals(PaymentCurrency.ARS, dto.getCurrency());
        assertEquals(new BigDecimal("350000"), dto.getInitialAmount());
        assertEquals(new BigDecimal("350000.00"), dto.getDepositAmount());
        assertTrue(dto.getHasDeposit());
        // 36 meses desde el 1/3/2025
        assertEquals(LocalDate.of(2028, 2, 29), dto.getEndDate());
        assertEquals(1, dto.getGuarantors().size());
        assertEquals(List.of("Luz", "Gas", "Rentas"), dto.getUtilities());
        assertEquals(1, dto.getExtraFields().size());
        assertEquals("Día de pago", dto.getExtraFields().getFirst().getLabel());
        assertTrue(dto.getWarnings().stream().anyMatch(w -> w.contains("calculó")));
        assertTrue(dto.getMissingFields().isEmpty());
    }

    @Test
    void parseReportsMissingRequiredFields() {
        ContractExtractionDTO dto = service.parse("{\"tenant\": {\"fullName\": \"Ana\"}, \"currency\": \"EUROS\", \"startDate\": \"31/02/2025\"}");

        assertNull(dto.getCurrency());
        assertNull(dto.getStartDate());
        assertTrue(dto.getMissingFields().containsAll(List.of("property", "contractType", "startDate", "endDate",
                "currency", "initialAmount", "adjustmentIndex", "adjustmentFrequencyMonths")));
        assertFalse(dto.getMissingFields().contains("tenant"));
    }

    @Test
    void parseAcceptsArgentineDateFormat() {
        ContractExtractionDTO dto = service.parse("{\"startDate\": \"1/3/2025\", \"endDate\": \"28/02/2027\"}");
        assertEquals(LocalDate.of(2025, 3, 1), dto.getStartDate());
        assertEquals(LocalDate.of(2027, 2, 28), dto.getEndDate());
    }

    @Test
    void parseWarnsWhenEndIsBeforeStart() {
        ContractExtractionDTO dto = service.parse("{\"startDate\": \"2025-03-01\", \"endDate\": \"2024-03-01\"}");
        assertTrue(dto.getWarnings().stream().anyMatch(w -> w.contains("no es posterior")));
    }

    @Test
    void parseRejectsGarbage() {
        assertThrows(ServiceUnavailableException.class, () -> service.parse("no puedo ayudarte con eso"));
    }

    @Test
    void amountParsing() {
        com.fasterxml.jackson.databind.node.JsonNodeFactory f = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance;
        assertEquals(new BigDecimal("1116960"), invokeAmount(f.textNode("$ 1.116.960")));
        assertEquals(new BigDecimal("2966.33"), invokeAmount(f.textNode("2.966,33")));
        assertEquals(new BigDecimal("850000.50"), invokeAmount(f.textNode("850,000.50")));
        assertEquals(new BigDecimal("850000"), invokeAmount(f.textNode("850.000")));
        assertEquals(new BigDecimal("12.5"), invokeAmount(f.textNode("12,5")));
        assertEquals(new BigDecimal("1500"), invokeAmount(f.numberNode(1500)));
        assertNull(invokeAmount(f.textNode("a convenir")));
    }

    private static BigDecimal invokeAmount(com.fasterxml.jackson.databind.JsonNode n) {
        return (BigDecimal) org.springframework.test.util.ReflectionTestUtils.invokeMethod(ContractPdfService.class, "amount", n);
    }

    @Test
    void extractSendsTextToTheAi() throws Exception {
        when(aiClient.isConfigured()).thenReturn(true);
        when(aiClient.complete(anyString(), any())).thenReturn(AI_JSON);
        byte[] pdf = textPdf(CONTRACT_LINES, CONTRACT_LINES, CONTRACT_LINES);

        ContractExtractionDTO dto = service.extract(new MockMultipartFile("file", "contrato.pdf", "application/pdf", pdf)).getBody();

        assertEquals("TEXT", dto.getSource());
        ArgumentCaptor<PdfContent> content = ArgumentCaptor.forClass(PdfContent.class);
        verify(aiClient).complete(anyString(), content.capture());
        assertFalse(content.getValue().isScanned());
        assertTrue(content.getValue().text().contains("Marianela Pirani"));
    }

    @Test
    void extractSendsPageImagesWhenThePdfIsScanned() throws Exception {
        when(aiClient.isConfigured()).thenReturn(true);
        when(aiClient.complete(anyString(), any())).thenReturn(AI_JSON);

        ContractExtractionDTO dto = service.extract(new MockMultipartFile("file", "escaneo.pdf", "application/pdf", scannedPdf())).getBody();

        assertEquals("IMAGES", dto.getSource());
        assertTrue(dto.getWarnings().getFirst().contains("escaneo"));
        ArgumentCaptor<PdfContent> content = ArgumentCaptor.forClass(PdfContent.class);
        verify(aiClient).complete(anyString(), content.capture());
        assertEquals(1, content.getValue().pageImagesDataUri().size());
        assertTrue(content.getValue().pageImagesDataUri().getFirst().startsWith("data:image/jpeg;base64,"));
    }

    @Test
    void extractFailsClearlyWhenAiIsNotConfigured() throws Exception {
        when(aiClient.isConfigured()).thenReturn(false);
        byte[] pdf = textPdf(CONTRACT_LINES, CONTRACT_LINES, CONTRACT_LINES);
        assertThrows(ServiceUnavailableException.class,
                () -> service.extract(new MockMultipartFile("file", "c.pdf", "application/pdf", pdf)));
    }

    @Test
    void extractFailsClearlyWhenAiCallFails() throws Exception {
        when(aiClient.isConfigured()).thenReturn(true);
        when(aiClient.complete(anyString(), any())).thenThrow(new RuntimeException("timeout"));
        byte[] pdf = textPdf(CONTRACT_LINES, CONTRACT_LINES, CONTRACT_LINES);
        ServiceUnavailableException ex = assertThrows(ServiceUnavailableException.class,
                () -> service.extract(new MockMultipartFile("file", "c.pdf", "application/pdf", pdf)));
        assertTrue(ex.getMessage().contains("cargalo a mano"));
    }

    @Test
    void extractRejectsNonPdf() {
        assertThrows(BadRequestException.class,
                () -> service.extract(new MockMultipartFile("file", "foto.jpg", "image/jpeg", new byte[]{1, 2, 3, 4, 5, 6})));
        assertThrows(BadRequestException.class,
                () -> service.extract(new MockMultipartFile("file", "vacio.pdf", "application/pdf", new byte[0])));
    }

    @Test
    void saveDocumentStoresThePdf() throws Exception {
        when(contractRepository.existsById(4L)).thenReturn(true);
        when(documentRepository.findByContractId(4L)).thenReturn(Optional.empty());
        byte[] pdf = textPdf("hola");

        var info = service.saveDocument(4L, new MockMultipartFile("file", "contrato.pdf", "application/pdf", pdf)).getBody();

        assertEquals("contrato.pdf", info.getFileName());
        assertEquals(pdf.length, info.getSizeBytes());
        ArgumentCaptor<ContractDocument> saved = ArgumentCaptor.forClass(ContractDocument.class);
        verify(documentRepository).save(saved.capture());
        assertEquals(4L, saved.getValue().getContractId());
        assertArrayEquals(pdf, saved.getValue().getContent());
    }

    @Test
    void saveDocumentForUnknownContractFails() {
        when(contractRepository.existsById(4L)).thenReturn(false);
        assertThrows(EntityNotFoundException.class,
                () -> service.saveDocument(4L, new MockMultipartFile("file", "c.pdf", "application/pdf", new byte[10])));
    }

    @Test
    void getDocumentInfoWithoutDocumentIsNoContent() {
        when(documentRepository.findInfoByContractId(4L)).thenReturn(List.of());
        assertEquals(204, service.getDocumentInfo(4L).getStatusCode().value());
    }

    @Test
    void replaceExtraFieldsSkipsBlankOnes() {
        when(contractRepository.existsById(4L)).thenReturn(true);
        when(extraFieldRepository.findByContractId(4L)).thenReturn(List.of(new ContractExtraField(1L, 4L, "Día de pago", "1 al 10", 0)));

        var result = service.replaceExtraFields(4L, List.of(
                new ContractExtraFieldDTO("Día de pago", "1 al 10"),
                new ContractExtraFieldDTO(" ", "x"))).getBody();

        verify(extraFieldRepository).deleteByContractId(4L);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<ContractExtraField>> saved = ArgumentCaptor.forClass(List.class);
        verify(extraFieldRepository).saveAll(saved.capture());
        assertEquals(1, saved.getValue().size());
        assertEquals(1, result.size());
    }
}
