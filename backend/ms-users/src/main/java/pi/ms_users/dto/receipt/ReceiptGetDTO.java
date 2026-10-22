package pi.ms_users.dto.receipt;

import lombok.Data;
import pi.ms_users.domain.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReceiptGetDTO {
    private Long id;
    private String number;
    private ReceiptIssuer issuer;
    private ReceiptKind kind;
    private ReceiptConcept concept;
    private ReceiptStatus status;
    private LocalDate issueDate;
    private Integer periodMonth;
    private Integer periodYear;
    private PaymentCurrency currency;
    private BigDecimal total;
    private String totalInWords;
    private String payerName;
    private String payerDni;
    private String ownerName;
    private String propertyAddress;
    private String notes;
    private String userId;
    private Long contractId;
    private Long paymentId;
    private LocalDateTime createdAt;
    private LocalDateTime annulledAt;
    private String annulReason;
    private List<ReceiptItemDTO> items;
}
