package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Receipt")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 30)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(name = "issuer", nullable = false, length = 20)
    private ReceiptIssuer issuer;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 20)
    private ReceiptKind kind;

    @Enumerated(EnumType.STRING)
    @Column(name = "concept", nullable = false, length = 20)
    private ReceiptConcept concept;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReceiptStatus status = ReceiptStatus.EMITIDO;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "period_month")
    private Integer periodMonth;

    @Column(name = "period_year")
    private Integer periodYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false, length = 5)
    private PaymentCurrency currency;

    @Column(name = "total", nullable = false, precision = 15, scale = 2)
    private BigDecimal total;

    @Column(name = "total_in_words", nullable = false, length = 500)
    private String totalInWords;

    @Column(name = "payer_name", nullable = false)
    private String payerName;

    @Column(name = "payer_dni", length = 30)
    private String payerDni;

    // "por cuenta y orden de"
    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "property_address", length = 500)
    private String propertyAddress;

    @Column(name = "notes", length = 2000)
    private String notes;

    // inquilino que lo puede ver desde el portal
    @Column(name = "user_id")
    private String userId;

    // sin FK: el recibo tiene que sobrevivir aunque se borre el contrato o el pago
    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "annulled_at")
    private LocalDateTime annulledAt;

    @Column(name = "annul_reason", length = 500)
    private String annulReason;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<ReceiptItem> items = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Receipt r)) return false;
        return id != null && id.equals(r.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}
