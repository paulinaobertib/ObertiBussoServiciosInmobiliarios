package pi.ms_users.securityTest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import pi.ms_users.domain.TenantPortalAccess;
import pi.ms_users.repository.ITenantPortalAccessRepository;
import pi.ms_users.security.ContractAccess;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ContractAccessTest {

    private ITenantPortalAccessRepository portalRepo;
    private TypedQuery<String> query;
    private ContractAccess access;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        portalRepo = mock(ITenantPortalAccessRepository.class);
        EntityManager em = mock(EntityManager.class);
        query = mock(TypedQuery.class);
        when(em.createQuery(anyString(), eq(String.class))).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.setMaxResults(anyInt())).thenReturn(query);
        access = new ContractAccess(portalRepo, em);

        Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject("tenant-1").build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void ownContractIsVisible() {
        when(query.getResultList()).thenReturn(List.of("tenant-1"));
        assertTrue(access.canViewContract(1L));
    }

    @Test
    void someoneElsesContractIsNotVisible() {
        when(query.getResultList()).thenReturn(List.of("tenant-2"));
        assertFalse(access.canViewContract(1L));
        assertFalse(access.canViewPayment(1L));
    }

    @Test
    void missingRowIsNotVisible() {
        when(query.getResultList()).thenReturn(List.of());
        assertFalse(access.canViewReceipt(1L));
    }

    @Test
    void withoutPortalRowBothSectionsAreEnabled() {
        when(portalRepo.findById("tenant-1")).thenReturn(Optional.empty());
        assertTrue(access.canViewContracts());
        assertTrue(access.canViewReceipts());
    }

    @Test
    void receiptsOnlyAccessHidesContractsEvenIfOwned() {
        when(portalRepo.findById("tenant-1")).thenReturn(Optional.of(new TenantPortalAccess("tenant-1", false, true, null)));
        when(query.getResultList()).thenReturn(List.of("tenant-1"));
        assertFalse(access.canViewContract(1L));
        assertTrue(access.canViewReceipt(1L));
    }

    @Test
    void notAuthenticatedSeesNothing() {
        SecurityContextHolder.clearContext();
        assertFalse(access.canViewContracts());
        assertFalse(access.canViewContract(1L));
        assertFalse(access.isCurrentUser("tenant-1"));
    }
}
