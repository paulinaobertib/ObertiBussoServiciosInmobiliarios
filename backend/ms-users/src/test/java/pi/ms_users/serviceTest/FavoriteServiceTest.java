package pi.ms_users.serviceTest;

import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Favorite;
import pi.ms_users.domain.User;
import pi.ms_users.domain.feign.Property;
import pi.ms_users.repository.IFavoriteRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.service.impl.FavoriteService;

import java.util.List;
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
    void create_userNotFound() {
        when(userRepository.findById("user123")).thenThrow(new NotFoundException("No encontrado"));

        ResponseEntity<Favorite> response = favoriteService.create(favorite);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void create_dataIntegrityViolation() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(favoriteRepository.save(favorite)).thenThrow(DataIntegrityViolationException.class);

        ResponseEntity<Favorite> response = favoriteService.create(favorite);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void create_genericError() {
        when(userRepository.findById("user123")).thenReturn(Optional.of(user));
        when(favoriteRepository.save(favorite)).thenThrow(RuntimeException.class);

        ResponseEntity<Favorite> response = favoriteService.create(favorite);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void delete_notFound() {
        when(favoriteRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = favoriteService.delete(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void delete_genericError() {
        when(favoriteRepository.findById(1L)).thenThrow(RuntimeException.class);

        ResponseEntity<String> response = favoriteService.delete(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void findByUserId_notFound() {
        when(userRepository.findById("user123")).thenThrow(new NotFoundException("No encontrado"));

        ResponseEntity<List<Favorite>> response = favoriteService.findByUserId("user123");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void findByUserId_genericError() {
        when(userRepository.findById("user123")).thenThrow(RuntimeException.class);

        ResponseEntity<List<Favorite>> response = favoriteService.findByUserId("user123");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void findByPropertyId_propertyNull() {
        when(propertyRepository.getById(100L)).thenReturn(null);

        ResponseEntity<List<Favorite>> response = favoriteService.findByPropertyId(100L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void findByPropertyId_genericError() {
        when(propertyRepository.getById(100L)).thenThrow(RuntimeException.class);

        ResponseEntity<List<Favorite>> response = favoriteService.findByPropertyId(100L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}

