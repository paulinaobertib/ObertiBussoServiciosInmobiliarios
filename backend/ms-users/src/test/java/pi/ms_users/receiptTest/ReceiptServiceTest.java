package pi.ms_users.receiptTest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import pi.ms_users.domain.*;
import pi.ms_users.dto.receipt.ReceiptDTO;
import pi.ms_users.dto.receipt.ReceiptGetDTO;
import pi.ms_users.dto.receipt.ReceiptItemDTO;
import pi.ms_users.receipt.ReceiptIssuerProperties;
import pi.ms_users.receipt.ReceiptPdfRenderer;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IReceiptRepository;
import pi.ms_users.repository.IReceiptSequenceRepository;
import pi.ms_users.service.impl.ReceiptService;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import javax.imageio.ImageIO;
import java.io.File;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReceiptServiceTest {

    private IReceiptRepository receiptRepository;
    private IReceiptSequenceRepository sequenceRepository;
    private IContractRepository contractRepository;
    private ReceiptService service;

    @BeforeEach
    void setUp() {
        receiptRepository = mock(IReceiptRepository.class);
        sequenceRepository = mock(IReceiptSequenceRepository.class);
        contractRepository = mock(IContractRepository.class);

        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode("HTML");
        resolver.setCharacterEncoding("UTF-8");
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);

        ReceiptIssuerProperties props = new ReceiptIssuerProperties(
                "Oberti Busso Servicios Inmobiliarios", "Luis María Oberti", "Corredor Público", "Luis María Oberti",
                "Padre Luis Galeano n° 1.910 – Local 2", "Córdoba", "Corredor Público · Mat. 04-2101",
                "www.inmobiliariaobertibusso.com.ar", "", "");
        service = new ReceiptService(receiptRepository, sequenceRepository, contractRepository, new ReceiptPdfRenderer(engine), props);

        when(receiptRepository.save(any(Receipt.class))).thenAnswer(inv -> {
            Receipt r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
    }

    // recibo de "9 de Julio" (corredor, por cuenta y orden del propietario)
    static ReceiptDTO alquilerPorCuentaYOrden() {
        ReceiptDTO dto = new ReceiptDTO();
        dto.setIssuer(ReceiptIssuer.CORREDOR);
        dto.setKind(ReceiptKind.RECIBO);
        dto.setConcept(ReceiptConcept.ALQUILER);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setIssueDate(LocalDate.of(2026, 10, 5));
        dto.setPeriodMonth(10);
        dto.setPeriodYear(2026);
        dto.setPayerName("Marianela Pirani");
        dto.setOwnerName("Silvina Verónica Quintana");
        dto.setPropertyAddress("9 de Julio 3.225 – Depto. 3 – 1° Piso, Córdoba");
        dto.setItems(List.of(
                new ReceiptItemDTO("Alquiler octubre 2026", new BigDecimal("436255")),
                new ReceiptItemDTO("Rentas", new BigDecimal("2966.33")),
                new ReceiptItemDTO("Municipalidad", new BigDecimal("7437.90"))));
        return dto;
    }

    // recibo del dúplex A-14 con detalle (inmobiliaria)
    static ReceiptDTO alquilerConDetalle() {
        ReceiptDTO dto = new ReceiptDTO();
        dto.setIssuer(ReceiptIssuer.INMOBILIARIA);
        dto.setKind(ReceiptKind.RECIBO);
        dto.setConcept(ReceiptConcept.ALQUILER);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setIssueDate(LocalDate.of(2026, 10, 5));
        dto.setPeriodMonth(10);
        dto.setPeriodYear(2026);
        dto.setPayerName("Emilio Roberto Martin");
        dto.setPayerDni("23.821.639");
        dto.setPropertyAddress("Dúplex N° A-14, Barrio Privado La Arbolada – Malagueño");
        dto.setItems(items());
        return dto;
    }

    // liquidación de expensas "no válido como recibo"
    static ReceiptDTO liquidacionExpensas() {
        ReceiptDTO dto = alquilerConDetalle();
        dto.setKind(ReceiptKind.LIQUIDACION);
        dto.setConcept(ReceiptConcept.EXPENSAS);
        dto.setPayerDni(null);
        dto.setNotes("Transferir a la cuenta habitual e informar el comprobante por WhatsApp.");
        return dto;
    }

    static List<ReceiptItemDTO> items() {
        return List.of(
                new ReceiptItemDTO("Alquiler octubre 2026", new BigDecimal("850000")),
                new ReceiptItemDTO("Consumo electricidad hasta 25/09 – 356,40 kWh", new BigDecimal("204000")),
                new ReceiptItemDTO("Impuesto Rentas – cuota 09/12", new BigDecimal("61200")),
                new ReceiptItemDTO("Impuesto Municipalidad – cuota 09/12", new BigDecimal("1760")));
    }

    private static String text(byte[] pdf) throws Exception {
        try (PDDocument doc = Loader.loadPDF(pdf)) {
            assertEquals(1, doc.getNumberOfPages(), "el recibo tiene que entrar en una sola hoja");
            return new PDFTextStripper().getText(doc);
        }
    }

    // los titulos tienen letter-spacing y pdfbox los extrae con espacios entre letras
    private static boolean containsSpaced(String text, String expected) {
        return text.replaceAll("\\s+", "").contains(expected.replaceAll("\\s+", ""));
    }

    // mvn test -Dreceipts.sample.dir=/ruta  -> deja los PDF y PNG para revisarlos a ojo
    private static void maybeSave(String name, byte[] pdf) throws Exception {
        String dir = System.getProperty("receipts.sample.dir");
        if (dir == null) return;
        File out = new File(dir);
        out.mkdirs();
        Files.write(new File(out, name + ".pdf").toPath(), pdf);
        try (PDDocument doc = Loader.loadPDF(pdf)) {
            ImageIO.write(new PDFRenderer(doc).renderImageWithDPI(0, 110), "png", new File(out, name + ".png"));
        }
    }

    @Test
    void previewCorredorPorCuentaYOrden() throws Exception {
        byte[] pdf = service.preview(alquilerPorCuentaYOrden());
        maybeSave("recibo-corredor", pdf);
        String t = text(pdf);
        assertTrue(t.contains("Recibí de"));
        assertTrue(t.contains("PESOS CUATROCIENTOS CUARENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE CON 23/100"));
        assertTrue(t.contains("Por cuenta y orden de"));
        assertTrue(t.contains("$ 446.659,23"));
        assertTrue(t.contains("BORRADOR"));
        verify(receiptRepository, never()).save(any());
    }

    @Test
    void previewInmobiliaria() throws Exception {
        byte[] pdf = service.preview(alquilerConDetalle());
        maybeSave("recibo-inmobiliaria", pdf);
        String t = text(pdf);
        assertTrue(t.contains("Recibimos de"));
        assertTrue(t.contains("DNI 23.821.639"));
        assertTrue(t.contains("PESOS UN MILLÓN CIENTO DIECISÉIS MIL NOVECIENTOS SESENTA"));
        assertFalse(containsSpaced(t, "NO VÁLIDO"));
    }

    @Test
    void previewLiquidacionIsMarkedNotValid() throws Exception {
        byte[] pdf = service.preview(liquidacionExpensas());
        maybeSave("liquidacion-expensas", pdf);
        String t = text(pdf);
        assertTrue(containsSpaced(t, "LIQUIDACIÓN"));
        assertTrue(containsSpaced(t, "NO VÁLIDO COMO RECIBO DE PAGO"));
        assertTrue(containsSpaced(t, "TOTAL A PAGAR"));
    }

    @Test
    void createAssignsCorrelativeNumberPerIssuerAndKind() {
        when(sequenceRepository.findForUpdate("CORREDOR_RECIBO")).thenReturn(Optional.of(new ReceiptSequence("CORREDOR_RECIBO", 41L)));

        ReceiptGetDTO dto = service.create(alquilerPorCuentaYOrden()).getBody();

        assertNotNull(dto);
        assertEquals("LO-R-000042", dto.getNumber());
        assertEquals(new BigDecimal("446659.23"), dto.getTotal());
        assertEquals(3, dto.getItems().size());
        ArgumentCaptor<ReceiptSequence> seq = ArgumentCaptor.forClass(ReceiptSequence.class);
        verify(sequenceRepository).save(seq.capture());
        assertEquals(42L, seq.getValue().getLastNumber());
    }

    @Test
    void createStartsSequenceAtOneAndUsesInmobiliariaPrefix() {
        when(sequenceRepository.findForUpdate("INMOBILIARIA_LIQUIDACION")).thenReturn(Optional.empty());
        ReceiptGetDTO dto = service.create(liquidacionExpensas()).getBody();
        assertEquals("OB-L-000001", dto.getNumber());
    }

    @Test
    void createFromContractIsVisibleForThatTenant() {
        Contract c = new Contract();
        c.setId(7L);
        c.setUserId("tenant-1");
        when(contractRepository.findById(7L)).thenReturn(Optional.of(c));
        when(sequenceRepository.findForUpdate(any())).thenReturn(Optional.empty());

        ReceiptDTO dto = alquilerConDetalle();
        dto.setContractId(7L);
        ReceiptGetDTO saved = service.create(dto).getBody();

        assertEquals("tenant-1", saved.getUserId());
        assertEquals(7L, saved.getContractId());
    }

    @Test
    void createWithUnknownContractFails() {
        when(contractRepository.findById(99L)).thenReturn(Optional.empty());
        ReceiptDTO dto = alquilerConDetalle();
        dto.setContractId(99L);
        assertThrows(EntityNotFoundException.class, () -> service.create(dto));
    }

    @Test
    void totalMustBePositive() {
        ReceiptDTO dto = alquilerConDetalle();
        dto.setItems(List.of(new ReceiptItemDTO("Bonificación", new BigDecimal("-10"))));
        assertThrows(BadRequestException.class, () -> service.preview(dto));
    }

    @Test
    void annulMarksReceiptAndCannotRepeat() {
        Receipt r = new Receipt();
        r.setId(3L);
        r.setStatus(ReceiptStatus.EMITIDO);
        when(receiptRepository.findWithItemsById(3L)).thenReturn(Optional.of(r));

        ReceiptGetDTO dto = service.annul(3L, "Monto mal cargado").getBody();
        assertEquals(ReceiptStatus.ANULADO, dto.getStatus());
        assertEquals("Monto mal cargado", dto.getAnnulReason());
        assertThrows(BadRequestException.class, () -> service.annul(3L, null));
    }

    @Test
    void annulledPdfShowsWatermark() throws Exception {
        when(sequenceRepository.findForUpdate(any())).thenReturn(Optional.empty());
        ReceiptGetDTO created = service.create(alquilerConDetalle()).getBody();
        ArgumentCaptor<Receipt> captor = ArgumentCaptor.forClass(Receipt.class);
        verify(receiptRepository).save(captor.capture());
        Receipt stored = captor.getValue();
        stored.setStatus(ReceiptStatus.ANULADO);
        when(receiptRepository.findWithItemsById(created.getId())).thenReturn(Optional.of(stored));

        byte[] pdf = service.getPdf(created.getId());
        maybeSave("recibo-anulado", pdf);
        assertTrue(containsSpaced(text(pdf), "ANULADO"));
        assertEquals("Recibo-OB-R-000001.pdf", service.getFileName(created.getId()));
    }

    @Test
    void validationMessagesAreReadable() {
        ReceiptDTO dto = alquilerConDetalle();
        dto.setPayerName(" ");
        dto.setItems(List.of());
        dto.setPeriodMonth(13);
        BadRequestException ex = assertThrows(BadRequestException.class, () -> service.create(dto));
        assertTrue(ex.getMessage().contains("Falta el nombre de quien paga."));
        assertTrue(ex.getMessage().contains("Agregá al menos un concepto."));
        assertTrue(ex.getMessage().contains("El mes del período no es válido."));
        verify(receiptRepository, never()).save(any());
    }

    @Test
    void itemWithoutAmountIsRejected() {
        ReceiptDTO dto = alquilerConDetalle();
        dto.setItems(List.of(new ReceiptItemDTO("Alquiler", null)));
        assertThrows(BadRequestException.class, () -> service.preview(dto));
    }

    @Test
    void secondReceiptForSamePaymentIsRejected() {
        Receipt existing = new Receipt();
        existing.setKind(ReceiptKind.RECIBO);
        existing.setNumber("LO-R-000010");
        when(receiptRepository.findActiveByPaymentId(9L)).thenReturn(List.of(existing));

        ReceiptDTO dto = alquilerPorCuentaYOrden();
        dto.setPaymentId(9L);
        BadRequestException ex = assertThrows(BadRequestException.class, () -> service.create(dto));
        assertTrue(ex.getMessage().contains("LO-R-000010"));
        verify(sequenceRepository, never()).save(any());
    }

    @Test
    void liquidacionForAPaymentDoesNotBlockTheReceipt() {
        Receipt liquidacion = new Receipt();
        liquidacion.setKind(ReceiptKind.LIQUIDACION);
        liquidacion.setNumber("LO-L-000003");
        when(receiptRepository.findActiveByPaymentId(9L)).thenReturn(List.of(liquidacion));
        when(sequenceRepository.findForUpdate(any())).thenReturn(Optional.empty());

        ReceiptDTO dto = alquilerPorCuentaYOrden();
        dto.setPaymentId(9L);
        assertEquals("LO-R-000001", service.create(dto).getBody().getNumber());
    }
}
