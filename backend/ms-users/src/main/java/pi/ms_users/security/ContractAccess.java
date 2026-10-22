package pi.ms_users.security;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.TenantPortalAccess;
import pi.ms_users.repository.ITenantPortalAccessRepository;

import java.util.List;

// se usa desde @PreAuthorize: "@contractAccess.canViewContract(#id)"
// un inquilino solo puede ver datos de sus propios contratos, y solo si tiene habilitada la seccion
@Component("contractAccess")
@RequiredArgsConstructor
public class ContractAccess {

    private final ITenantPortalAccessRepository portalAccessRepository;

    // inyectado por constructor (EntityManager compartido de Spring Data) para que se pueda mockear en los tests web
    private final EntityManager em;

    public boolean canViewContracts() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null) return false;
        return portalAccessRepository.findById(userId)
                .map(TenantPortalAccess::isCanViewContracts)
                .orElse(true);
    }

    public boolean canViewReceipts() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null) return false;
        return portalAccessRepository.findById(userId)
                .map(TenantPortalAccess::isCanViewReceipts)
                .orElse(true);
    }

    public boolean isCurrentUser(String userId) {
        return userId != null && userId.equals(SecurityUtils.getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public boolean canViewContract(Long contractId) {
        return canViewContracts() && ownsOne("SELECT c.userId FROM Contract c WHERE c.id = :id", contractId);
    }

    @Transactional(readOnly = true)
    public boolean canViewContractUtility(Long contractUtilityId) {
        return canViewContracts() && ownsOne("SELECT cu.contract.userId FROM ContractUtility cu WHERE cu.id = :id", contractUtilityId);
    }

    @Transactional(readOnly = true)
    public boolean canViewContractUtilityIncrease(Long id) {
        return canViewContracts() && ownsOne("SELECT i.contractUtility.contract.userId FROM ContractUtilityIncrease i WHERE i.id = :id", id);
    }

    @Transactional(readOnly = true)
    public boolean canViewContractIncrease(Long id) {
        return canViewContracts() && ownsOne("SELECT i.contract.userId FROM ContractIncrease i WHERE i.id = :id", id);
    }

    @Transactional(readOnly = true)
    public boolean canViewCommission(Long commissionId) {
        return canViewContracts() && ownsOne("SELECT c.contract.userId FROM Commission c WHERE c.id = :id", commissionId);
    }

    // un pago puede colgar del contrato, de un servicio del contrato o de la comision
    @Transactional(readOnly = true)
    public boolean canViewPayment(Long paymentId) {
        return canViewContracts() && ownsOne(
                "SELECT COALESCE(c.userId, cuc.userId, cmc.userId) FROM Payment p " +
                        "LEFT JOIN p.contract c " +
                        "LEFT JOIN p.contractUtility cu LEFT JOIN cu.contract cuc " +
                        "LEFT JOIN p.commission cm LEFT JOIN cm.contract cmc " +
                        "WHERE p.id = :id", paymentId);
    }

    @Transactional(readOnly = true)
    public boolean canViewReceipt(Long receiptId) {
        return canViewReceipts() && ownsOne("SELECT r.userId FROM Receipt r WHERE r.id = :id", receiptId);
    }

    private boolean ownsOne(String jpql, Long id) {
        String current = SecurityUtils.getCurrentUserId();
        if (id == null || current == null) return false;
        List<String> owners = em.createQuery(jpql, String.class)
                .setParameter("id", id)
                .setMaxResults(1)
                .getResultList();
        return !owners.isEmpty() && current.equals(owners.getFirst());
    }
}
