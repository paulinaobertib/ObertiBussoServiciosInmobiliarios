package pi.ms_users.serviceTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Notice;
import pi.ms_users.domain.User;
import pi.ms_users.repository.INoticeRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.impl.NoticeService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoticeServiceTest {

    @Mock
    private INoticeRepository noticeRepository;

    @Mock
    private IUserRepository userRepository;

    @InjectMocks
    private NoticeService noticeService;

    private Notice notice;

    @BeforeEach
    void setUp() {
        notice = new Notice();
        notice.setId(1L);
        notice.setUserId("user1");
        notice.setTitle("Título de prueba");
        notice.setDescription("Descripción de prueba");
        notice.setDate(LocalDateTime.now());
    }

    // casos de exito

    @Test
    void testCreateNoticeSuccess() {
        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(userRepository.getUserRoles("user1")).thenReturn(List.of("app_admin"));
        when(noticeRepository.save(any(Notice.class))).thenReturn(notice);

        ResponseEntity<String> response = noticeService.create(notice);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado la noticia", response.getBody());
    }

    @Test
    void testUpdateNoticeSuccess() {
        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));
        when(userRepository.getUserRoles("user1")).thenReturn(List.of("app_admin"));
        when(noticeRepository.save(any(Notice.class))).thenReturn(notice);

        ResponseEntity<String> response = noticeService.update(notice);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado la noticia", response.getBody());
    }

    @Test
    void testDeleteNoticeSuccess() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));

        ResponseEntity<String> response = noticeService.delete(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado la noticia", response.getBody());
        verify(noticeRepository).delete(notice);
    }

    @Test
    void testGetByIdSuccess() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));

        ResponseEntity<Notice> response = noticeService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(notice, response.getBody());
    }

    @Test
    void testGetAllSuccess() {
        when(noticeRepository.findAll()).thenReturn(List.of(notice));

        ResponseEntity<List<Notice>> response = noticeService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testSearchSuccess() {
        when(noticeRepository.findAll(any(Specification.class))).thenReturn(List.of(notice));

        ResponseEntity<List<Notice>> response = noticeService.search("test");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    // casos de error

    @Test
    void testCreateNotice_UserNotFound() {
        when(userRepository.findById("user1")).thenReturn(Optional.empty());

        ResponseEntity<String> response = noticeService.create(notice);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No se ha encontrado el usuario", response.getBody());
    }

    @Test
    void testCreateNotice_ForbiddenUser() {
        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(userRepository.getUserRoles("user1")).thenReturn(List.of("user"));

        ResponseEntity<String> response = noticeService.create(notice);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Este usuario no tiene permiso para crear una noticia", response.getBody());
    }

    @Test
    void testUpdateNotice_UserNotFound() {
        when(userRepository.findById("user1")).thenReturn(Optional.empty());

        ResponseEntity<String> response = noticeService.update(notice);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No se ha encontrado el usuario", response.getBody());
    }

    @Test
    void testUpdateNotice_NotFound() {
        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(noticeRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = noticeService.update(notice);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No se ha encontrado una noticia con ese id", response.getBody());
    }

    @Test
    void testUpdateNotice_ForbiddenUser() {
        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));
        when(userRepository.getUserRoles("user1")).thenReturn(List.of("user"));

        ResponseEntity<String> response = noticeService.update(notice);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Este usuario no tiene permiso para actualizar una noticia", response.getBody());
    }

    @Test
    void testDeleteNotice_NotFound() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = noticeService.delete(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No se ha encontrado una noticia con ese id", response.getBody());
    }

    @Test
    void testGetById_NotFound() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Notice> response = noticeService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void create_shouldReturnBadRequest_onDataIntegrityViolation() {
        Notice notice = new Notice();
        notice.setUserId("admin123");

        when(userRepository.findById("admin123")).thenThrow(new DataIntegrityViolationException("Error"));

        ResponseEntity<String> response = noticeService.create(notice);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void create_shouldReturnInternalServerError_onUnexpectedException() {
        Notice notice = new Notice();
        notice.setUserId("admin123");

        when(userRepository.findById("admin123")).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<String> response = noticeService.create(notice);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void update_shouldReturnBadRequest_onDataIntegrityViolation() {
        Notice notice = new Notice();
        notice.setUserId("admin123");
        notice.setId(1L);

        when(userRepository.findById("admin123")).thenThrow(new DataIntegrityViolationException("Error"));

        ResponseEntity<String> response = noticeService.update(notice);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void update_shouldReturnInternalServerError_onUnexpectedException() {
        Notice notice = new Notice();
        notice.setUserId("admin123");
        notice.setId(1L);

        when(userRepository.findById("admin123")).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<String> response = noticeService.update(notice);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void delete_shouldReturnBadRequest_onDataIntegrityViolation() {
        when(noticeRepository.findById(1L)).thenThrow(new DataIntegrityViolationException("Error"));

        ResponseEntity<String> response = noticeService.delete(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void delete_shouldReturnInternalServerError_onUnexpectedException() {
        when(noticeRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<String> response = noticeService.delete(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnBadRequest_onDataIntegrityViolation() {
        when(noticeRepository.findById(1L)).thenThrow(new DataIntegrityViolationException("Error"));

        ResponseEntity<Notice> response = noticeService.getById(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnInternalServerError_onUnexpectedException() {
        when(noticeRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<Notice> response = noticeService.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnBadRequest_onDataIntegrityViolation() {
        when(noticeRepository.findAll()).thenThrow(new DataIntegrityViolationException("Error"));

        ResponseEntity<List<Notice>> response = noticeService.getAll();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnInternalServerError_onUnexpectedException() {
        when(noticeRepository.findAll()).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<List<Notice>> response = noticeService.getAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void search_shouldReturnBadRequest_onDataIntegrityViolation() {
        when(noticeRepository.findAll(any(Specification.class)))
                .thenThrow(new DataIntegrityViolationException("Error"));

        ResponseEntity<List<Notice>> response = noticeService.search("test");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void search_shouldReturnInternalServerError_onUnexpectedException() {
        when(noticeRepository.findAll(any(Specification.class)))
                .thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<List<Notice>> response = noticeService.search("test");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}