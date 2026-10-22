package pi.ms_users.dto.receipt;

import lombok.Data;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.domain.ReceiptConcept;
import pi.ms_users.domain.ReceiptIssuer;
import pi.ms_users.domain.ReceiptKind;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// lo que manda el front para crear (o previsualizar) un recibo; se valida en ReceiptService
@Data
public class ReceiptDTO {
    private ReceiptIssuer issuer;
    private ReceiptKind kind;
    private ReceiptConcept concept;
    private LocalDate issueDate;
    private Integer periodMonth;
    private Integer periodYear;
    private PaymentCurrency currency;
    private String payerName;
    private String payerDni;
    private String ownerName;
    private String propertyAddress;
    private String notes;
    private String userId;
    private Long contractId;
    private Long paymentId;
    private List<ReceiptItemDTO> items = new ArrayList<>();
}
