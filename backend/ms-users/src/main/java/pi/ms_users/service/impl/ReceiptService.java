package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;
import pi.ms_users.domain.*;
import pi.ms_users.dto.receipt.ReceiptDTO;
import pi.ms_users.dto.receipt.ReceiptGetDTO;
import pi.ms_users.dto.receipt.ReceiptItemDTO;
import pi.ms_users.receipt.NumberToWordsEs;
import pi.ms_users.receipt.ReceiptIssuerProperties;
import pi.ms_users.receipt.ReceiptPdfRenderer;
import pi.ms_users.receipt.ReceiptView;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.repository.IReceiptRepository;
import pi.ms_users.repository.IReceiptSequenceRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.IReceiptService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReceiptService implements IReceiptService {

    private static final Locale ES_AR = Locale.forLanguageTag("es-AR");

    private static final String[] MONTHS = {"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
            "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};

    private final IReceiptRepository receiptRepository;

    private final IReceiptSequenceRepository sequenceRepository;

    private final IContractRepository contractRepository;

    private final ReceiptPdfRenderer pdfRenderer;

    private final ReceiptIssuerProperties issuerProperties;

    // ---------------- mapeos ----------------

    public ReceiptGetDTO toGetDTO(Receipt r) {
        ReceiptGetDTO dto = new ReceiptGetDTO();
        dto.setId(r.getId());
        dto.setNumber(r.getNumber());
        dto.setIssuer(r.getIssuer());
        dto.setKind(r.getKind());
        dto.setConcept(r.getConcept());
        dto.setStatus(r.getStatus());
        dto.setIssueDate(r.getIssueDate());
        dto.setPeriodMonth(r.getPeriodMonth());
        dto.setPeriodYear(r.getPeriodYear());
        dto.setCurrency(r.getCurrency());
        dto.setTotal(r.getTotal());
        dto.setTotalInWords(r.getTotalInWords());
        dto.setPayerName(r.getPayerName());
        dto.setPayerDni(r.getPayerDni());
        dto.setOwnerName(r.getOwnerName());
        dto.setPropertyAddress(r.getPropertyAddress());
        dto.setNotes(r.getNotes());
        dto.setUserId(r.getUserId());
        dto.setContractId(r.getContractId());
        dto.setPaymentId(r.getPaymentId());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setAnnulledAt(r.getAnnulledAt());
        dto.setAnnulReason(r.getAnnulReason());
        dto.setItems(r.getItems().stream()
                .map(i -> new ReceiptItemDTO(i.getDescription(), i.getAmount()))
                .toList());
        return dto;
    }

    // en ms-users no hay validador de beans, asi que se valida a mano con mensajes para el usuario
    private static void validate(ReceiptDTO dto) {
        List<String> errors = new ArrayList<>();
        if (dto == null) throw new BadRequestException("Faltan los datos del recibo.");
        if (dto.getIssuer() == null) errors.add("Elegí quién emite el recibo.");
        if (dto.getKind() == null) errors.add("Elegí el tipo de comprobante.");
        if (dto.getConcept() == null) errors.add("Elegí el concepto.");
        if (dto.getCurrency() == null) errors.add("Elegí la moneda.");
        if (dto.getPayerName() == null || dto.getPayerName().isBlank()) errors.add("Falta el nombre de quien paga.");
        else if (dto.getPayerName().length() > 255) errors.add("El nombre es demasiado largo.");
        if (dto.getPeriodMonth() != null && (dto.getPeriodMonth() < 1 || dto.getPeriodMonth() > 12)) errors.add("El mes del período no es válido.");
        if (dto.getPeriodYear() != null && (dto.getPeriodYear() < 2000 || dto.getPeriodYear() > 2100)) errors.add("El año del período no es válido.");
        if (tooLong(dto.getPayerDni(), 30) || tooLong(dto.getOwnerName(), 255) || tooLong(dto.getPropertyAddress(), 500) || tooLong(dto.getNotes(), 2000)) {
            errors.add("Algún dato es demasiado largo.");
        }
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            errors.add("Agregá al menos un concepto.");
        } else {
            for (ReceiptItemDTO it : dto.getItems()) {
                if (it == null || it.getDescription() == null || it.getDescription().isBlank() || it.getAmount() == null) {
                    errors.add("Cada concepto necesita descripción e importe.");
                    break;
                }
                if (it.getDescription().length() > 500) {
                    errors.add("La descripción de un concepto es demasiado larga.");
                    break;
                }
            }
        }
        if (!errors.isEmpty()) throw new BadRequestException(String.join(" ", errors));
    }

    private static boolean tooLong(String s, int max) {
        return s != null && s.length() > max;
    }

    private Receipt toEntity(ReceiptDTO dto) {
        validate(dto);
        Receipt r = new Receipt();
        r.setIssuer(dto.getIssuer());
        r.setKind(dto.getKind());
        r.setConcept(dto.getConcept());
        r.setStatus(ReceiptStatus.EMITIDO);
        r.setIssueDate(dto.getIssueDate() != null ? dto.getIssueDate() : LocalDate.now());
        r.setPeriodMonth(dto.getPeriodMonth());
        r.setPeriodYear(dto.getPeriodMonth() != null && dto.getPeriodYear() == null ? r.getIssueDate().getYear() : dto.getPeriodYear());
        r.setCurrency(dto.getCurrency());
        r.setPayerName(dto.getPayerName().trim());
        r.setPayerDni(blankToNull(dto.getPayerDni()));
        r.setOwnerName(blankToNull(dto.getOwnerName()));
        r.setPropertyAddress(blankToNull(dto.getPropertyAddress()));
        r.setNotes(blankToNull(dto.getNotes()));
        r.setContractId(dto.getContractId());
        r.setPaymentId(dto.getPaymentId());
        r.setUserId(blankToNull(dto.getUserId()));

        List<ReceiptItem> items = new ArrayList<>();
        int position = 0;
        for (ReceiptItemDTO it : dto.getItems()) {
            ReceiptItem item = new ReceiptItem();
            item.setReceipt(r);
            item.setDescription(it.getDescription().trim());
            item.setAmount(it.getAmount().setScale(2, RoundingMode.HALF_UP));
            item.setPosition(position++);
            items.add(item);
        }
        r.setItems(items);

        BigDecimal total = items.stream().map(ReceiptItem::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("El total del recibo tiene que ser mayor a cero.");
        }
        r.setTotal(total);
        r.setTotalInWords(NumberToWordsEs.amountToWords(total, r.getCurrency()));
        return r;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    // ---------------- numeracion ----------------

    private String nextNumber(ReceiptIssuer issuer, ReceiptKind kind) {
        String key = issuer.name() + "_" + kind.name();
        ReceiptSequence seq = sequenceRepository.findForUpdate(key)
                .orElseGet(() -> new ReceiptSequence(key, 0L));
        seq.setLastNumber(seq.getLastNumber() + 1);
        sequenceRepository.save(seq);

        String issuerPrefix = issuer == ReceiptIssuer.INMOBILIARIA ? "OB" : "LO";
        String kindPrefix = kind == ReceiptKind.RECIBO ? "R" : "L";
        return String.format("%s-%s-%06d", issuerPrefix, kindPrefix, seq.getLastNumber());
    }

    // ---------------- vista del PDF ----------------

    private ReceiptView toView(Receipt r) {
        boolean inmobiliaria = r.getIssuer() == ReceiptIssuer.INMOBILIARIA;
        boolean liquidacion = r.getKind() == ReceiptKind.LIQUIDACION;
        String symbol = NumberToWordsEs.currencySymbol(r.getCurrency());
        String total = symbol + " " + NumberToWordsEs.formatAmount(r.getTotal());
        String period = r.getPeriodMonth() != null
                ? MONTHS[r.getPeriodMonth() - 1] + " " + r.getPeriodYear()
                : null;

        List<ReceiptView.Item> items = r.getItems().stream()
                .map(i -> new ReceiptView.Item(i.getDescription(), symbol + " " + NumberToWordsEs.formatAmount(i.getAmount())))
                .toList();

        String date = r.getIssueDate().format(DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", ES_AR));
        List<String> contact = new ArrayList<>();
        if (!issuerProperties.getPhone().isBlank()) contact.add("Tel. " + issuerProperties.getPhone());
        if (!issuerProperties.getEmail().isBlank()) contact.add(issuerProperties.getEmail());
        contact.add(issuerProperties.getWebsite());

        return ReceiptView.builder()
                .title(liquidacion ? "LIQUIDACIÓN" : "RECIBO")
                .number(r.getNumber())
                .inmobiliaria(inmobiliaria)
                .liquidacion(liquidacion)
                .annulled(r.getStatus() == ReceiptStatus.ANULADO)
                .issuerName(inmobiliaria ? issuerProperties.getInmobiliariaName() : issuerProperties.getCorredorName())
                .issuerTitle(issuerProperties.getCorredorTitle())
                .signerName(issuerProperties.getSignerName())
                .address(issuerProperties.getAddress())
                .city(issuerProperties.getCity())
                .license(issuerProperties.getLicense())
                .placeAndDate(issuerProperties.getCity() + ", " + date)
                .payerName(r.getPayerName())
                .payerDni(r.getPayerDni())
                .ownerName(r.getOwnerName())
                .propertyAddress(r.getPropertyAddress())
                .period(period)
                .statementHtml(statement(r, inmobiliaria, liquidacion, total, period))
                .items(items)
                .total(total)
                .totalInWords(r.getTotalInWords())
                .notes(r.getNotes())
                .footerLeft(issuerProperties.getInmobiliariaName() + " · " + issuerProperties.getAddress() + ", " + issuerProperties.getCity())
                .footerRight(String.join(" · ", contact))
                .logoDataUri(pdfRenderer.imageDataUri("logo.png"))
                .markDataUri(pdfRenderer.imageDataUri("arrow.png"))
                .sealDataUri(pdfRenderer.imageDataUri(inmobiliaria ? "seal-inmobiliaria.png" : "seal-corredor.png"))
                .build();
    }

    private static String esc(String s) {
        return HtmlUtils.htmlEscape(s, "UTF-8");
    }

    private static String conceptText(ReceiptConcept concept) {
        return switch (concept) {
            case ALQUILER -> "alquiler";
            case EXPENSAS -> "expensas";
            case SERVICIOS -> "servicios e impuestos";
            case OTRO -> "conceptos varios";
        };
    }

    // negrita que no se separa del signo que le sigue (si no, la coma queda sola al principio del renglon)
    private static String bold(String text, String punctuation) {
        return "<span class=\"nowrap\"><b>" + esc(text) + "</b>" + punctuation + "</span>";
    }

    // el texto del cuerpo, como en los recibos de siempre
    private static String statement(Receipt r, boolean inmobiliaria, boolean liquidacion, String total, String period) {
        String concept = conceptText(r.getConcept());
        String amount = "<b>" + esc(r.getTotalInWords()) + "</b> (" + bold(total, ")");
        StringBuilder sb = new StringBuilder();

        if (liquidacion) {
            sb.append("Liquidación de <b>").append(concept).append("</b>");
            if (period != null) sb.append(" correspondiente a ").append(bold(period, ""));
            if (r.getPropertyAddress() != null) sb.append(" del inmueble ubicado en <b>").append(esc(r.getPropertyAddress())).append("</b>");
            sb.append(", a cargo de ").append(bold(r.getPayerName(), "."));
            sb.append(" Total a abonar: ").append(amount).append(".");
            return sb.toString();
        }

        sb.append(inmobiliaria ? "Recibimos de " : "Recibí de ");
        if (r.getPayerDni() != null) {
            sb.append("<b>").append(esc(r.getPayerName())).append("</b> – DNI ").append(esc(r.getPayerDni())).append(",");
        } else {
            sb.append(bold(r.getPayerName(), ","));
        }
        sb.append(" la suma de ").append(amount);
        sb.append(r.getConcept() == ReceiptConcept.OTRO
                ? " por los conceptos que se detallan"
                : " en concepto de <b>" + concept + "</b>");
        if (period != null) sb.append(" del período ").append(bold(period, ""));
        if (r.getPropertyAddress() != null) sb.append(", correspondiente al inmueble ubicado en <b>").append(esc(r.getPropertyAddress())).append("</b>");
        sb.append(".");
        if (r.getOwnerName() != null) sb.append(" Por cuenta y orden de ").append(bold(r.getOwnerName(), "."));
        return sb.toString();
    }

    // ---------------- casos de uso ----------------

    @Override
    @Transactional
    public ResponseEntity<ReceiptGetDTO> create(ReceiptDTO dto) {
        Receipt receipt = toEntity(dto);

        if (dto.getContractId() != null) {
            Contract contract = contractRepository.findById(dto.getContractId())
                    .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el contrato."));
            // si viene de un contrato, lo ve ese inquilino
            if (receipt.getUserId() == null) {
                receipt.setUserId(contract.getUserId());
            }
        }

        // un pago, un recibo: para rehacerlo hay que anular el anterior
        if (dto.getPaymentId() != null && receipt.getKind() == ReceiptKind.RECIBO) {
            receiptRepository.findActiveByPaymentId(dto.getPaymentId()).stream()
                    .filter(r -> r.getKind() == ReceiptKind.RECIBO)
                    .findFirst()
                    .ifPresent(r -> {
                        throw new BadRequestException("Ese pago ya tiene el recibo " + r.getNumber() + ". Si hay que corregirlo, anulalo primero.");
                    });
        }

        receipt.setNumber(nextNumber(receipt.getIssuer(), receipt.getKind()));
        receipt.setCreatedAt(LocalDateTime.now());
        Receipt saved = receiptRepository.save(receipt);
        return ResponseEntity.ok(toGetDTO(saved));
    }

    @Override
    public byte[] preview(ReceiptDTO dto) {
        Receipt receipt = toEntity(dto);
        receipt.setNumber("BORRADOR");
        return pdfRenderer.render(toView(receipt));
    }

    private Receipt find(Long id) {
        return receiptRepository.findWithItemsById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el recibo."));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ReceiptGetDTO> getById(Long id) {
        return ResponseEntity.ok(toGetDTO(find(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getPdf(Long id) {
        return pdfRenderer.render(toView(find(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public String getFileName(Long id) {
        Receipt r = find(id);
        String kind = r.getKind() == ReceiptKind.RECIBO ? "Recibo" : "Liquidacion";
        return kind + "-" + r.getNumber() + ".pdf";
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReceiptGetDTO>> search(ReceiptIssuer issuer, ReceiptKind kind, ReceiptStatus status, LocalDate from, LocalDate to, String q) {
        String like = q == null || q.isBlank() ? null : "%" + q.trim().toLowerCase(ES_AR) + "%";
        List<ReceiptGetDTO> list = receiptRepository.search(issuer, kind, status, from, to, like).stream()
                .map(this::toGetDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReceiptGetDTO>> getByContract(Long contractId) {
        return ResponseEntity.ok(receiptRepository.findByContractId(contractId).stream().map(this::toGetDTO).toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ReceiptGetDTO>> getMine() {
        String userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(receiptRepository.findVisibleByUserId(userId).stream().map(this::toGetDTO).toList());
    }

    @Override
    @Transactional
    public ResponseEntity<ReceiptGetDTO> annul(Long id, String reason) {
        Receipt r = find(id);
        if (r.getStatus() == ReceiptStatus.ANULADO) {
            throw new BadRequestException("El recibo ya está anulado.");
        }
        r.setStatus(ReceiptStatus.ANULADO);
        r.setAnnulledAt(LocalDateTime.now());
        r.setAnnulReason(blankToNull(reason));
        return ResponseEntity.ok(toGetDTO(receiptRepository.save(r)));
    }
}
