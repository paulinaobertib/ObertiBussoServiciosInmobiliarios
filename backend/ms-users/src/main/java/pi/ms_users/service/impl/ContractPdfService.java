package pi.ms_users.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_users.contractpdf.ContractAiClient;
import pi.ms_users.contractpdf.ContractPdfReader;
import pi.ms_users.contractpdf.PdfContent;
import pi.ms_users.domain.ContractDocument;
import pi.ms_users.domain.ContractExtraField;
import pi.ms_users.domain.ContractType;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.contractpdf.ContractDocumentInfoDTO;
import pi.ms_users.dto.contractpdf.ContractExtraFieldDTO;
import pi.ms_users.dto.contractpdf.ContractExtractionDTO;
import pi.ms_users.repository.IContractDocumentRepository;
import pi.ms_users.repository.IContractExtraFieldRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.service.interf.IContractPdfService;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractPdfService implements IContractPdfService {

    static final long MAX_PDF_BYTES = 20L * 1024 * 1024;

    static final String SYSTEM_PROMPT = """
            Sos un asistente que lee contratos de locación (alquiler) de Argentina y extrae sus datos.
            Respondé ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, con esta forma exacta:
            {
              "tenant": {"fullName": string|null, "dni": string|null, "email": string|null, "phone": string|null, "address": string|null},
              "owner": {"fullName": string|null, "dni": string|null, "email": string|null, "phone": string|null, "address": string|null},
              "property": {"address": string|null, "city": string|null, "description": string|null},
              "contractType": "VIVIENDA"|"COMERCIAL"|"TEMPORAL"|null,
              "startDate": "AAAA-MM-DD"|null,
              "endDate": "AAAA-MM-DD"|null,
              "durationMonths": number|null,
              "currency": "ARS"|"USD"|null,
              "initialAmount": number|null,
              "adjustmentIndex": string|null,
              "adjustmentFrequencyMonths": number|null,
              "hasDeposit": boolean|null,
              "depositAmount": number|null,
              "depositNote": string|null,
              "guarantors": [{"fullName": string|null, "dni": string|null, "email": string|null, "phone": string|null, "address": string|null}],
              "utilities": [string],
              "extraFields": [{"label": string, "value": string}],
              "warnings": [string]
            }
            Reglas:
            - Si un dato no figura en el contrato, poné null (o lista vacía). NUNCA inventes datos.
            - "tenant" es el LOCATARIO/inquilino y "owner" el LOCADOR/propietario. Si hay varios locatarios, poné el principal y mencioná los demás en extraFields.
            - "contractType": VIVIENDA si es para vivienda familiar, COMERCIAL si es para comercio/oficina/local, TEMPORAL si es temporario o turístico.
            - "initialAmount": alquiler MENSUAL del primer período, como número sin separadores de miles (ej. 850000.50).
            - "adjustmentIndex": el índice de actualización tal como se lo nombra (ej. "ICL", "IPC", "Casa Propia", "porcentaje fijo"). "adjustmentFrequencyMonths": cada cuántos meses se actualiza (ej. 3, 4, 6, 12).
            - "utilities": servicios, impuestos y gastos que paga el inquilino (ej. "Luz", "Gas", "Agua", "Expensas ordinarias", "Rentas", "Municipalidad").
            - "extraFields": cualquier otro dato relevante que no entra en los campos anteriores, con una etiqueta corta en español. Por ejemplo: día y lugar de pago, intereses punitorios, destino del inmueble, cantidad de ocupantes, mascotas, estado del inmueble, honorarios, cláusula de rescisión, fecha de firma, otros locatarios.
            - "warnings": dudas o ambigüedades que el administrador debería revisar (ej. montos que no coinciden, fechas ilegibles).
            """;

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("d/M/uuuu").withResolverStyle(ResolverStyle.STRICT),
            DateTimeFormatter.ofPattern("d-M-uuuu").withResolverStyle(ResolverStyle.STRICT));

    private final ContractPdfReader pdfReader;

    private final ContractAiClient aiClient;

    private final IContractRepository contractRepository;

    private final IContractDocumentRepository documentRepository;

    private final IContractExtraFieldRepository extraFieldRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    // ---------------- lectura del PDF ----------------

    private static byte[] pdfBytes(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No se recibió ningún archivo.");
        }
        if (file.getSize() > MAX_PDF_BYTES) {
            throw new BadRequestException("El PDF supera los 20 MB.");
        }
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("No se pudo leer el archivo.");
        }
    }

    @Override
    public ResponseEntity<ContractExtractionDTO> extract(MultipartFile file) {
        byte[] bytes = pdfBytes(file);
        PdfContent content = pdfReader.read(bytes);

        if (!aiClient.isConfigured()) {
            throw new ServiceUnavailableException("La lectura automática de contratos no está configurada en el servidor.");
        }

        String raw;
        try {
            raw = aiClient.complete(SYSTEM_PROMPT, content);
        } catch (Exception e) {
            log.warn("Fallo la lectura del contrato con IA", e);
            throw new ServiceUnavailableException("No se pudo leer el contrato en este momento. Probá de nuevo o cargalo a mano.");
        }

        ContractExtractionDTO dto = parse(raw);
        dto.setSource(content.isScanned() ? "IMAGES" : "TEXT");
        if (content.isScanned()) {
            dto.getWarnings().add(0, "El PDF es un escaneo: revisá con cuidado los números y las fechas.");
        }
        return ResponseEntity.ok(dto);
    }

    // convierte la respuesta de la IA sin confiar en que respete los tipos
    public ContractExtractionDTO parse(String raw) {
        JsonNode root;
        try {
            String json = raw == null ? "" : raw.trim();
            int start = json.indexOf('{');
            int end = json.lastIndexOf('}');
            if (start < 0 || end <= start) throw new IOException("sin JSON");
            root = mapper.readTree(json.substring(start, end + 1));
        } catch (IOException e) {
            throw new ServiceUnavailableException("La lectura automática devolvió una respuesta inválida. Probá de nuevo o cargalo a mano.");
        }

        ContractExtractionDTO dto = new ContractExtractionDTO();
        dto.setTenant(person(root.get("tenant")));
        dto.setOwner(person(root.get("owner")));

        JsonNode p = root.get("property");
        if (p != null && p.isObject()) {
            ContractExtractionDTO.PropertyInfo info = new ContractExtractionDTO.PropertyInfo();
            info.setAddress(text(p.get("address")));
            info.setCity(text(p.get("city")));
            info.setDescription(text(p.get("description")));
            if (info.getAddress() != null || info.getCity() != null || info.getDescription() != null) {
                dto.setProperty(info);
            }
        }

        dto.setContractType(enumValue(ContractType.class, root.get("contractType")));
        dto.setStartDate(date(root.get("startDate")));
        dto.setEndDate(date(root.get("endDate")));
        dto.setDurationMonths(integer(root.get("durationMonths")));
        dto.setCurrency(enumValue(PaymentCurrency.class, root.get("currency")));
        dto.setInitialAmount(amount(root.get("initialAmount")));
        dto.setAdjustmentIndex(text(root.get("adjustmentIndex")));
        dto.setAdjustmentFrequencyMonths(integer(root.get("adjustmentFrequencyMonths")));
        JsonNode hasDeposit = root.get("hasDeposit");
        dto.setHasDeposit(hasDeposit != null && hasDeposit.isBoolean() ? hasDeposit.asBoolean() : null);
        dto.setDepositAmount(amount(root.get("depositAmount")));
        dto.setDepositNote(text(root.get("depositNote")));
        if (dto.getHasDeposit() == null && dto.getDepositAmount() != null) {
            dto.setHasDeposit(true);
        }

        if (root.path("guarantors").isArray()) {
            for (JsonNode g : root.get("guarantors")) {
                ContractExtractionDTO.Person person = person(g);
                if (person != null && person.getFullName() != null) dto.getGuarantors().add(person);
            }
        }
        if (root.path("utilities").isArray()) {
            Set<String> seen = new LinkedHashSet<>();
            for (JsonNode u : root.get("utilities")) {
                String name = text(u);
                if (name != null) seen.add(name);
            }
            dto.getUtilities().addAll(seen);
        }
        if (root.path("extraFields").isArray()) {
            for (JsonNode f : root.get("extraFields")) {
                String label = text(f.get("label"));
                String value = text(f.get("value"));
                if (label != null && value != null) {
                    ContractExtractionDTO.ExtraField field = new ContractExtractionDTO.ExtraField();
                    field.setLabel(truncate(label, 255));
                    field.setValue(truncate(value, 2000));
                    dto.getExtraFields().add(field);
                }
            }
        }
        if (root.path("warnings").isArray()) {
            for (JsonNode w : root.get("warnings")) {
                String warning = text(w);
                if (warning != null) dto.getWarnings().add(warning);
            }
        }

        // fecha de fin a partir de la duracion, si el contrato solo dice "por 24 meses"
        if (dto.getEndDate() == null && dto.getStartDate() != null && dto.getDurationMonths() != null && dto.getDurationMonths() > 0) {
            dto.setEndDate(dto.getStartDate().plusMonths(dto.getDurationMonths()).minusDays(1));
            dto.getWarnings().add("La fecha de fin se calculó a partir de la duración del contrato.");
        }
        if (dto.getStartDate() != null && dto.getEndDate() != null && !dto.getEndDate().isAfter(dto.getStartDate())) {
            dto.getWarnings().add("La fecha de fin no es posterior a la de inicio: revisalas.");
        }

        dto.setMissingFields(missingFields(dto));
        return dto;
    }

    // las claves coinciden con los campos del formulario de contrato del front
    static List<String> missingFields(ContractExtractionDTO dto) {
        List<String> missing = new ArrayList<>();
        if (dto.getTenant() == null || dto.getTenant().getFullName() == null) missing.add("tenant");
        if (dto.getProperty() == null || dto.getProperty().getAddress() == null) missing.add("property");
        if (dto.getContractType() == null) missing.add("contractType");
        if (dto.getStartDate() == null) missing.add("startDate");
        if (dto.getEndDate() == null) missing.add("endDate");
        if (dto.getCurrency() == null) missing.add("currency");
        if (dto.getInitialAmount() == null) missing.add("initialAmount");
        if (dto.getAdjustmentIndex() == null) missing.add("adjustmentIndex");
        if (dto.getAdjustmentFrequencyMonths() == null) missing.add("adjustmentFrequencyMonths");
        return missing;
    }

    private static ContractExtractionDTO.Person person(JsonNode n) {
        if (n == null || !n.isObject()) return null;
        ContractExtractionDTO.Person p = new ContractExtractionDTO.Person();
        p.setFullName(text(n.get("fullName")));
        p.setDni(text(n.get("dni")));
        p.setEmail(text(n.get("email")));
        p.setPhone(text(n.get("phone")));
        p.setAddress(text(n.get("address")));
        boolean empty = p.getFullName() == null && p.getDni() == null && p.getEmail() == null && p.getPhone() == null && p.getAddress() == null;
        return empty ? null : p;
    }

    private static String text(JsonNode n) {
        if (n == null || n.isNull() || n.isContainerNode()) return null;
        String s = n.asText().trim();
        return s.isEmpty() || s.equalsIgnoreCase("null") ? null : s;
    }

    private static String truncate(String s, int max) {
        return s.length() > max ? s.substring(0, max) : s;
    }

    private static Integer integer(JsonNode n) {
        BigDecimal value = amount(n);
        if (value == null) return null;
        try {
            return value.intValueExact();
        } catch (ArithmeticException e) {
            return value.intValue();
        }
    }

    // acepta 850000, 850000.5, "850.000", "850.000,50", "$ 850,000.50"
    static BigDecimal amount(JsonNode n) {
        if (n == null || n.isNull()) return null;
        if (n.isNumber()) return n.decimalValue();
        String s = text(n);
        if (s == null) return null;
        s = s.replaceAll("[^0-9.,-]", "");
        if (s.isEmpty()) return null;

        int lastComma = s.lastIndexOf(',');
        int lastDot = s.lastIndexOf('.');
        if (lastComma >= 0 && lastDot >= 0) {
            // el ultimo separador es el decimal
            s = lastComma > lastDot ? s.replace(".", "").replace(',', '.') : s.replace(",", "");
        } else if (lastComma >= 0) {
            s = looksLikeThousands(s, ',') ? s.replace(",", "") : s.replace(',', '.');
        } else if (lastDot >= 0 && looksLikeThousands(s, '.')) {
            s = s.replace(".", "");
        }
        try {
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // "850.000" o "1.116.960": separador repetido o seguido de exactamente 3 digitos
    private static boolean looksLikeThousands(String s, char separator) {
        int first = s.indexOf(separator);
        int last = s.lastIndexOf(separator);
        return first != last || s.length() - last - 1 == 3;
    }

    private static LocalDate date(JsonNode n) {
        String s = text(n);
        if (s == null) return null;
        for (DateTimeFormatter f : DATE_FORMATS) {
            try {
                return LocalDate.parse(s, f);
            } catch (DateTimeParseException ignored) {
                // se prueba el siguiente formato
            }
        }
        return null;
    }

    private static <E extends Enum<E>> E enumValue(Class<E> type, JsonNode n) {
        String s = text(n);
        if (s == null) return null;
        try {
            return Enum.valueOf(type, s.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // ---------------- PDF adjunto ----------------

    private void requireContract(Long contractId) {
        if (contractId == null || !contractRepository.existsById(contractId)) {
            throw new EntityNotFoundException("No se ha encontrado el contrato.");
        }
    }

    @Override
    @Transactional
    public ResponseEntity<ContractDocumentInfoDTO> saveDocument(Long contractId, MultipartFile file) {
        requireContract(contractId);
        byte[] bytes = pdfBytes(file);
        if (bytes.length < 5 || !new String(bytes, 0, 5).startsWith("%PDF")) {
            throw new BadRequestException("El archivo no es un PDF válido.");
        }

        ContractDocument doc = documentRepository.findByContractId(contractId).orElseGet(ContractDocument::new);
        doc.setContractId(contractId);
        String name = file.getOriginalFilename();
        doc.setFileName(name == null || name.isBlank() ? "contrato-" + contractId + ".pdf" : truncate(name, 255));
        doc.setContentType("application/pdf");
        doc.setSizeBytes((long) bytes.length);
        doc.setContent(bytes);
        doc.setUploadedAt(LocalDateTime.now());
        documentRepository.save(doc);

        return ResponseEntity.ok(new ContractDocumentInfoDTO(doc.getFileName(), doc.getSizeBytes(), doc.getUploadedAt()));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<ContractDocumentInfoDTO> getDocumentInfo(Long contractId) {
        return documentRepository.findInfoByContractId(contractId).stream().findFirst()
                .map(i -> ResponseEntity.ok(new ContractDocumentInfoDTO(i.getFileName(), i.getSizeBytes(), i.getUploadedAt())))
                .orElse(ResponseEntity.noContent().build());
    }

    @Override
    @Transactional(readOnly = true)
    public ContractDocument getDocument(Long contractId) {
        ContractDocument doc = documentRepository.findByContractId(contractId)
                .orElseThrow(() -> new EntityNotFoundException("El contrato no tiene un PDF adjunto."));
        doc.getContent(); // inicializa el contenido lazy dentro de la transaccion
        return doc;
    }

    @Override
    @Transactional
    public ResponseEntity<String> deleteDocument(Long contractId) {
        documentRepository.deleteByContractId(contractId);
        return ResponseEntity.ok("Se eliminó el PDF del contrato.");
    }

    // ---------------- datos extra ----------------

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractExtraFieldDTO>> getExtraFields(Long contractId) {
        return ResponseEntity.ok(extraFieldRepository.findByContractId(contractId).stream()
                .map(f -> new ContractExtraFieldDTO(f.getLabel(), f.getValue()))
                .toList());
    }

    @Override
    @Transactional
    public ResponseEntity<List<ContractExtraFieldDTO>> replaceExtraFields(Long contractId, List<ContractExtraFieldDTO> fields) {
        requireContract(contractId);
        extraFieldRepository.deleteByContractId(contractId);
        List<ContractExtraField> entities = new ArrayList<>();
        int position = 0;
        for (ContractExtraFieldDTO f : fields == null ? List.<ContractExtraFieldDTO>of() : fields) {
            if (f.getLabel() == null || f.getLabel().isBlank() || f.getValue() == null || f.getValue().isBlank()) continue;
            ContractExtraField e = new ContractExtraField();
            e.setContractId(contractId);
            e.setLabel(truncate(f.getLabel().trim(), 255));
            e.setValue(truncate(f.getValue().trim(), 2000));
            e.setPosition(position++);
            entities.add(e);
        }
        extraFieldRepository.saveAll(entities);
        return getExtraFields(contractId);
    }
}
