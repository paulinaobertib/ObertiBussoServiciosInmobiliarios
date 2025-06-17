package pi.ms_users.serviceTest;

import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import pi.ms_users.domain.Favorite;
import pi.ms_users.domain.User;
import pi.ms_users.domain.feign.Property;
import pi.ms_users.repository.IFavoriteRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.impl.FavoriteService;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @InjectMocks
    private FavoriteService favoriteService;

    @Mock
    private IFavoriteRepository favoriteRepository;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private PropertyRepository propertyRepository;

    private Favorite favorite;

    private User user;

    @BeforeEach
    void setUp() {
        favorite = new Favorite();
        favorite.setId(1L);
        favorite.setUserId("user123");
        favorite.setPropertyId(100L);

        user = new User();
        user.setId("user123");
    }

    // casos de exito

    @Test
    void create_success() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(favoriteRepository.save(favorite)).thenReturn(favorite);

        ResponseEntity<Favorite> response = favoriteService.create(favorite);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(favorite, response.getBody());
    }

    @Test
    void delete_success() {
        when(favoriteRepository.findById(1L)).thenReturn(Optional.of(favorite));

        ResponseEntity<String> response = favoriteService.delete(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado la propiedad de favoritos", response.getBody());
    }

    @Test
    void findByUserId_success() {
        List<Favorite> favorites = List.of(favorite);

        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByUserId("user123")).thenReturn(favorites);

        ResponseEntity<List<Favorite>> response = favoriteService.findByUserId("user123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(favorites, response.getBody());
    }

    @Test
    void findByPropertyId_success() {
        Property property = new Property();
        List<Favorite> favorites = List.of(favorite);

        when(propertyRepository.getById(100L)).thenReturn(property);
        when(favoriteRepository.findByPropertyId(100L)).thenReturn(favorites);

        ResponseEntity<List<Favorite>> response = favoriteService.findByPropertyId(100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(favorites, response.getBody());
    }

    // casos de error

    @Test
    void create_userNotFound_shouldThrowNotFoundException() {
        when(userRepository.findById("user123")).thenThrow(new NotFoundException("No encontrado"));

        assertThrows(NotFoundException.class, () -> favoriteService.create(favorite));
    }

    @Test
    void create_dataIntegrityViolation_shouldThrowDataIntegrityViolationException() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(favoriteRepository.save(favorite)).thenThrow(DataIntegrityViolationException.class);

        assertThrows(DataIntegrityViolationException.class, () -> favoriteService.create(favorite));
    }

    @Test
    void create_genericError_shouldThrowRuntimeException() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(favoriteRepository.save(favorite)).thenThrow(RuntimeException.class);

        assertThrows(RuntimeException.class, () -> favoriteService.create(favorite));
    }

    @Test
    void delete_notFound_shouldThrowNoSuchElementException() {
        when(favoriteRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> favoriteService.delete(1L));
    }

    @Test
    void delete_genericError_shouldThrowRuntimeException() {
        when(favoriteRepository.findById(1L)).thenThrow(RuntimeException.class);

        assertThrows(RuntimeException.class, () -> favoriteService.delete(1L));
    }

    @Test
    void findByUserId_notFound_shouldThrowNotFoundException() {
        when(userRepository.findById("user123")).thenThrow(new NotFoundException("No encontrado"));

        assertThrows(NotFoundException.class, () -> favoriteService.findByUserId("user123"));
    }

    @Test
    void findByUserId_genericError_shouldThrowRuntimeException() {
        when(userRepository.findById("user123")).thenThrow(RuntimeException.class);

        assertThrows(RuntimeException.class, () -> favoriteService.findByUserId("user123"));
    }

    @Test
    void findByPropertyId_genericError_shouldThrowRuntimeException() {
        when(propertyRepository.getById(100L)).thenThrow(RuntimeException.class);

        assertThrows(RuntimeException.class, () -> favoriteService.findByPropertyId(100L));
    }

    @Test
    void create_withDifferentUser_throwsAccessDenied() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> favoriteService.create(favorite));
        }
    }

    @Test
    void delete_withDifferentUser_throwsAccessDenied() {
        when(favoriteRepository.findById(1L)).thenReturn(Optional.of(favorite));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> favoriteService.delete(1L));
        }
    }

    @Test
    void findByUserId_withDifferentUser_throwsAccessDenied() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::isAdmin).thenReturn(false);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> favoriteService.findByUserId("user123"));
        }
    }
}

