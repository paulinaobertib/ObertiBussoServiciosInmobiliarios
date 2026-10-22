package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import pi.ms_users.domain.TenantPortalAccess;
import pi.ms_users.dto.portal.PortalAccessDTO;
import pi.ms_users.repository.ITenantPortalAccessRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.PortalAccessService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PortalAccessServiceTest {

    private ITenantPortalAccessRepository portalRepo;
    private IUserRepository userRepository;
    private PortalAccessService service;

    @BeforeEach
    void setUp() {
        portalRepo = mock(ITenantPortalAccessRepository.class);
        userRepository = mock(IUserRepository.class);
        service = new PortalAccessService(portalRepo, userRepository);
        when(portalRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private static void loginAs(String id, String... roles) {
        Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").subject(id).build();
        List<SimpleGrantedAuthority> authorities = java.util.Arrays.stream(roles).map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, authorities));
    }

    @Test
    void grantingReceiptsToANonTenantAddsTheTenantRole() {
        when(userRepository.exist("u1")).thenReturn(true);
        when(userRepository.getUserRoles("u1")).thenReturn(List.of("user"));
        when(portalRepo.findById("u1")).thenReturn(Optional.empty());

        PortalAccessDTO result = service.update("u1", new PortalAccessDTO("u1", false, true)).getBody();

        assertFalse(result.isCanViewContracts());
        assertTrue(result.isCanViewReceipts());
        verify(userRepository).addRoleToUser("u1", "tenant");
    }

    @Test
    void updatingAnExistingTenantDoesNotTouchRoles() {
        when(userRepository.exist("u1")).thenReturn(true);
        when(userRepository.getUserRoles("u1")).thenReturn(List.of("user", "tenant"));
        when(portalRepo.findById("u1")).thenReturn(Optional.of(new TenantPortalAccess("u1", true, true, null)));

        service.update("u1", new PortalAccessDTO("u1", true, false));

        verify(userRepository, never()).addRoleToUser(any(), any());
        verify(portalRepo).save(argThat(a -> a.isCanViewContracts() && !a.isCanViewReceipts()));
    }

    @Test
    void unknownUserFails() {
        when(userRepository.exist("x")).thenReturn(false);
        assertThrows(EntityNotFoundException.class, () -> service.update("x", new PortalAccessDTO("x", true, true)));
        assertThrows(EntityNotFoundException.class, () -> service.getByUser("x"));
    }

    @Test
    void getByUserShowsNoAccessWithoutTenantRole() {
        when(userRepository.exist("u1")).thenReturn(true);
        when(userRepository.getUserRoles("u1")).thenReturn(List.of("user"));
        when(portalRepo.findById("u1")).thenReturn(Optional.empty());

        PortalAccessDTO dto = service.getByUser("u1").getBody();
        assertFalse(dto.isCanViewContracts());
        assertFalse(dto.isCanViewReceipts());
    }

    @Test
    void getMineForTenantDefaultsToBoth() {
        loginAs("t1", "tenant");
        when(portalRepo.findById("t1")).thenReturn(Optional.empty());
        PortalAccessDTO dto = service.getMine().getBody();
        assertTrue(dto.isCanViewContracts());
        assertTrue(dto.isCanViewReceipts());
    }

    @Test
    void getMineForPlainUserIsNone() {
        loginAs("u2", "user");
        PortalAccessDTO dto = service.getMine().getBody();
        assertFalse(dto.isCanViewContracts());
        assertFalse(dto.isCanViewReceipts());
        verifyNoInteractions(portalRepo);
    }
}
