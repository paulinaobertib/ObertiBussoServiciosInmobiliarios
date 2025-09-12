package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    @Column(name = "property_id", nullable = true)
    private Long propertyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ContractType contractType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContractStatus contractStatus;

    @Enumerated(EnumType.STRING)
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

    @Column(name = "has_deposit", nullable = false)
    private boolean hasDeposit = false;

    @Column(name = "deposit_amount", precision = 15, scale = 2)
    private BigDecimal depositAmount;    

    @Column(name = "deposit_note", length = 1000)
    private String depositNote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adjustment_index_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contract_adjustment_index"))
    private IncreaseIndex adjustmentIndex;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ContractUtility> contractUtilities = new HashSet<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ContractIncrease> contractIncrease = new HashSet<>();

    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private Commission commission;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Payment> payments = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "Contract_Guarantor", joinColumns = @JoinColumn(name = "contract_id"), inverseJoinColumns = @JoinColumn(name = "guarantor_id"))
    private Set<Guarantor> guarantors = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Contract c)) return false;
        return id != null && id.equals(c.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }
}
