package pi.ms_users.serviceTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_users.domain.Notice;
import pi.ms_users.domain.User;
import pi.ms_users.dto.NoticeDTO;
import pi.ms_users.dto.NoticeGetDTO;
import pi.ms_users.repository.INoticeRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.ImageRepository;
import pi.ms_users.security.SecurityUtils;
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

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NoticeService noticeService;

    private Notice notice;
    private NoticeDTO noticeDTO;
    private NoticeGetDTO noticeGetDTO;

    @BeforeEach
    void setUp() {
        notice = new Notice();
        notice.setId(1L);
        notice.setUserId("user1");
        notice.setTitle("Título de prueba");
        notice.setDescription("Descripción de prueba");
        notice.setDate(LocalDateTime.now());
        notice.setMainImage("123.jpg");

        noticeDTO = new NoticeDTO();
        noticeDTO.setId(1L);
        noticeDTO.setUserId("user1");
        noticeDTO.setTitle("Título de prueba");
        noticeDTO.setDescription("Descripción de prueba");
        noticeDTO.setMainImage(new MockMultipartFile("file", "test.jpg", "image/jpeg", "data".getBytes()));

        noticeGetDTO = new NoticeGetDTO();
        noticeGetDTO.setId(1L);
        noticeGetDTO.setUserId("user1");
        noticeGetDTO.setTitle("Título de prueba");
        noticeGetDTO.setDescription("Descripción de prueba");
        noticeGetDTO.setDate(notice.getDate());
        noticeGetDTO.setMainImage("https://storage.com/123.jpg");
    }

    // casos de exito

    @Test
    void testCreateNoticeSuccess() {
        noticeDTO.setUserId("user1");

        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(imageRepository.uploadImage(any(MultipartFile.class))).thenReturn("123.jpg");
        when(objectMapper.convertValue(any(), eq(Notice.class))).thenReturn(notice);
        when(noticeRepository.save(any(Notice.class))).thenReturn(notice);

        try (MockedStatic<SecurityUtils> mockedStatic = Mockito.mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::isAdmin).thenReturn(true);

            ResponseEntity<String> response = noticeService.create(noticeDTO);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals("Se ha guardado la noticia", response.getBody());
        }
    }

    @Test
    void testUpdateNoticeSuccess() {
        noticeDTO.setUserId("user1");

        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));
        when(imageRepository.uploadImage(any(MultipartFile.class))).thenReturn("123.jpg");
        when(objectMapper.convertValue(any(), eq(Notice.class))).thenReturn(notice);
        when(noticeRepository.save(any(Notice.class))).thenReturn(notice);

        try (MockedStatic<SecurityUtils> mockedStatic = Mockito.mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::isAdmin).thenReturn(true);

            ResponseEntity<String> response = noticeService.update(noticeDTO);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals("Se ha actualizado la noticia", response.getBody());
        }
    }

    @Test
    void testDeleteNoticeSuccess() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));

        try (MockedStatic<SecurityUtils> mockedStatic = Mockito.mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::isAdmin).thenReturn(true);

            ResponseEntity<String> response = noticeService.delete(1L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals("Se ha eliminado la noticia", response.getBody());
            verify(noticeRepository).delete(notice);
        }
    }

    @Test
    void testGetByIdSuccess() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));
        when(objectMapper.convertValue(notice, NoticeGetDTO.class)).thenReturn(noticeGetDTO);
        when(imageRepository.imageURL("123.jpg")).thenReturn("https://storage.com/123.jpg");

        ResponseEntity<NoticeGetDTO> response = noticeService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(noticeGetDTO, response.getBody());
    }

    @Test
    void testGetAllSuccess() {
        when(noticeRepository.findAll()).thenReturn(List.of(notice));
        when(objectMapper.convertValue(notice, NoticeGetDTO.class)).thenReturn(noticeGetDTO);
        when(imageRepository.imageURL("123.jpg")).thenReturn("https://storage.com/123.jpg");

        ResponseEntity<List<NoticeGetDTO>> response = noticeService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testSearchSuccess() {
        when(noticeRepository.findAll(any(Specification.class))).thenReturn(List.of(notice));
        when(objectMapper.convertValue(notice, NoticeGetDTO.class)).thenReturn(noticeGetDTO);
        when(imageRepository.imageURL("123.jpg")).thenReturn("https://storage.com/123.jpg");

        ResponseEntity<List<NoticeGetDTO>> response = noticeService.search("test");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    // casos de error

    @Test
    void testCreateNotice_UserNotFound() {
        when(userRepository.findById("user1")).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> noticeService.create(noticeDTO));

        assertEquals("No se ha encontrado el usuario", exception.getMessage());
    }

    @Test
    void testCreateNotice_ForbiddenUser() {
        noticeDTO.setUserId("user1");

        User mockUser = new User();
        mockUser.setId("user1");

        when(userRepository.findById("user1")).thenReturn(Optional.of(mockUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> noticeService.create(noticeDTO));

        assertEquals("Este usuario no tiene permiso para crear una noticia", exception.getMessage());
    }

    @Test
    void testUpdateNotice_UserNotFound() {
        when(userRepository.findById("user1")).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> noticeService.update(noticeDTO));

        assertEquals("No se ha encontrado el usuario", exception.getMessage());
    }

    @Test
    void testUpdateNotice_NotFound() {
        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(noticeRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> noticeService.update(noticeDTO));

        assertEquals("No se ha encontrado una noticia con ese id", exception.getMessage());
    }

    @Test
    void testUpdateNotice_ForbiddenUser() {
        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(noticeRepository.findById(1L)).thenReturn(Optional.of(notice));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> noticeService.update(noticeDTO));

        assertEquals("Este usuario no tiene permiso para actualizar una noticia", exception.getMessage());
    }

    @Test
    void testDeleteNotice_NotFound() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> noticeService.delete(1L));

        assertEquals("No se ha encontrado una noticia con ese id", exception.getMessage());
    }

    @Test
    void testGetById_NotFound() {
        when(noticeRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> noticeService.getById(1L));

        assertEquals("No se ha encontrado una noticia con ese id", exception.getMessage());
    }

    @Test
    void create_shouldThrowDataIntegrityViolationException() {
        noticeDTO.setUserId("admin123");

        when(userRepository.findById("admin123")).thenThrow(new DataIntegrityViolationException("Error"));

        assertThrows(DataIntegrityViolationException.class,
                () -> noticeService.create(noticeDTO));
    }

    @Test
    void create_shouldThrowUnexpectedException() {
        noticeDTO.setUserId("admin123");

        when(userRepository.findById("admin123")).thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class,
                () -> noticeService.create(noticeDTO));
    }

    @Test
    void update_shouldThrowDataIntegrityViolationException() {
        noticeDTO.setUserId("admin123");
        noticeDTO.setId(1L);

        when(userRepository.findById("admin123")).thenThrow(new DataIntegrityViolationException("Error"));

        assertThrows(DataIntegrityViolationException.class,
                () -> noticeService.update(noticeDTO));
    }

    @Test
    void update_shouldThrowUnexpectedException() {
        noticeDTO.setUserId("admin123");
        noticeDTO.setId(1L);

        when(userRepository.findById("admin123")).thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class,
                () -> noticeService.update(noticeDTO));
    }

    @Test
    void delete_shouldThrowDataIntegrityViolationException() {
        when(noticeRepository.findById(1L)).thenThrow(new DataIntegrityViolationException("Error"));

        assertThrows(DataIntegrityViolationException.class,
                () -> noticeService.delete(1L));
    }

    @Test
    void delete_shouldThrowUnexpectedException() {
        when(noticeRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class,
                () -> noticeService.delete(1L));
    }

    @Test
    void getById_shouldThrowDataIntegrityViolationException() {
        when(noticeRepository.findById(1L)).thenThrow(new DataIntegrityViolationException("Error"));

        assertThrows(DataIntegrityViolationException.class,
                () -> noticeService.getById(1L));
    }

    @Test
    void getById_shouldThrowUnexpectedException() {
        when(noticeRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class,
                () -> noticeService.getById(1L));
    }

    @Test
    void getAll_shouldThrowDataIntegrityViolationException() {
        when(noticeRepository.findAll()).thenThrow(new DataIntegrityViolationException("Error"));

        assertThrows(DataIntegrityViolationException.class,
                () -> noticeService.getAll());
    }

    @Test
    void getAll_shouldThrowUnexpectedException() {
        when(noticeRepository.findAll()).thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class,
                () -> noticeService.getAll());
    }

    @Test
    void search_shouldThrowDataIntegrityViolationException() {
        when(noticeRepository.findAll(any(Specification.class)))
                .thenThrow(new DataIntegrityViolationException("Error"));

        assertThrows(DataIntegrityViolationException.class,
                () -> noticeService.search("test"));
    }

    @Test
    void search_shouldThrowUnexpectedException() {
        when(noticeRepository.findAll(any(Specification.class)))
                .thenThrow(new RuntimeException("Unexpected"));

        assertThrows(RuntimeException.class,
                () -> noticeService.search("test"));
    }
}