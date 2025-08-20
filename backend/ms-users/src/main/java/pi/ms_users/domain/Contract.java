package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Contract")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ContractType contractType;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContractStatus contractStatus;

    @Column(name = "currency", nullable = false)
    private PaymentCurrency currency;

    @Column(name = "initial_amount", nullable = false)
    private BigDecimal initialAmount;

    @Column(name = "adjustment_frequency_months", nullable = false)
    private Integer adjustmentFrequencyMonths;

    @Column(name = "last_paid_amount", nullable = true)
    private BigDecimal lastPaidAmount;

    @Column(name = "last_paid_date", nullable = true)
    private LocalDateTime lastPaidDate;

    @Column(name = "note", nullable = true)
    private String note;

    // FIJARSE ACA NO PUEDO ELIMINAR UN INDICE SI TIENE UN CONTRATO VINCULADO
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adjustment_index_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contract_adjustment_index"))
    private IncreaseIndex adjustmentIndex;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContractUtility> contractUtilities = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContractIncrease> contractIncrease = new ArrayList<>();

    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private Commission commission;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();
}
