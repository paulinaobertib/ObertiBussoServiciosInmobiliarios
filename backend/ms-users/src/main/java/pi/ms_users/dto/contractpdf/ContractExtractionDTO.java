package pi.ms_users.dto.contractpdf;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import pi.ms_users.domain.ContractType;
import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// lo que se pudo leer del PDF; null = no figura en el contrato
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ContractExtractionDTO {
    private Person tenant;
    private Person owner;
    private PropertyInfo property;
    private ContractType contractType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationMonths;
    private PaymentCurrency currency;
    private BigDecimal initialAmount;
    private String adjustmentIndex;
    private Integer adjustmentFrequencyMonths;
    private Boolean hasDeposit;
    private BigDecimal depositAmount;
    private String depositNote;
    private List<Person> guarantors = new ArrayList<>();
    private List<String> utilities = new ArrayList<>();
    private List<ExtraField> extraFields = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    // campos obligatorios del formulario que no se encontraron (los calcula el backend)
    private List<String> missingFields = new ArrayList<>();

    // TEXT = se leyo el texto del PDF; IMAGES = era un escaneo y se leyeron las paginas como imagen
    private String source;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Person {
        private String fullName;
        private String dni;
        private String email;
        private String phone;
        private String address;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PropertyInfo {
        private String address;
        private String city;
        private String description;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExtraField {
        private String label;
        private String value;
    }
}
