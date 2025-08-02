package pi.ms_properties.serviceTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.ChatSessionDTO;
import pi.ms_properties.dto.ChatSessionGetDTO;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.IChatSessionRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.UserRepository;
import pi.ms_properties.service.impl.ChatSessionService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatSessionServiceTest {

    @InjectMocks
    private ChatSessionService chatSessionService;

    @Mock
    private IChatSessionRepository chatSessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private ObjectMapper objectMapper;

    private Property property;
    private ChatSessionDTO sessionDTO;
    private ChatSession chatSession;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        property = new Property();
        property.setId(1L);

        userDTO = new UserDTO();
        userDTO.setEmail("test@email.com");
        userDTO.setFirstName("John");
        userDTO.setLastName("Doe");
        userDTO.setPhone("123456");

        sessionDTO = new ChatSessionDTO();
        sessionDTO.setPropertyId(1L);
        sessionDTO.setEmail("test@email.com");
        sessionDTO.setFirstName("John");
        sessionDTO.setLastName("Doe");
        sessionDTO.setPhone("123456");

        chatSession = new ChatSession();
        chatSession.setId(1L);
        chatSession.setUserId("user123");
        chatSession.setEmail("test@email.com");
        chatSession.setFirstName("John");
        chatSession.setLastName("Doe");
        chatSession.setPhone("123456");
        chatSession.setDate(LocalDateTime.now());
        chatSession.setDerived(false);
        chatSession.setProperty(property);
    }

    // casos de exito

    @Test
    void testCreateFromUser_Success() {
        when(userRepository.exist("user123")).thenReturn(true);
        when(userRepository.findById("user123")).thenReturn(userDTO);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(invocation -> {
            ChatSession saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        chatSessionService.createFromUser("user123", 1L);

        ArgumentCaptor<ChatSession> captor = ArgumentCaptor.forClass(ChatSession.class);
        verify(chatSessionRepository).save(captor.capture());

        ChatSession saved = captor.getValue();
        assertEquals("user123", saved.getUserId());
        assertEquals("test@email.com", saved.getEmail());
        assertEquals("John", saved.getFirstName());
        assertEquals("Doe", saved.getLastName());
        assertEquals("123456", saved.getPhone());
        assertEquals(property, saved.getProperty());
        assertFalse(saved.getDerived());
    }

    @Test
    void testCreateWithoutUser_Success() {
        chatSession.setUserId(null);

        when(objectMapper.convertValue(sessionDTO, ChatSession.class)).thenReturn(chatSession);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(invocation -> {
            ChatSession saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Long id = chatSessionService.createWithoutUser(sessionDTO);

        ArgumentCaptor<ChatSession> captor = ArgumentCaptor.forClass(ChatSession.class);
        verify(chatSessionRepository).save(captor.capture());

        ChatSession saved = captor.getValue();
        assertNull(saved.getUserId());
        assertEquals("test@email.com", saved.getEmail());
        assertEquals("John", saved.getFirstName());
        assertEquals("Doe", saved.getLastName());
        assertEquals("123456", saved.getPhone());
        assertEquals(property, saved.getProperty());
        assertFalse(saved.getDerived());

        assertNotNull(id);
        assertTrue(id > 0);
    }

    @Test
    void testGetById_Success() {
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        ChatSessionGetDTO result = chatSessionService.getById(1L);

        assertEquals(chatSession.getId(), result.getId());
        assertEquals(chatSession.getUserId(), result.getUserId());
        assertEquals(chatSession.getEmail(), result.getEmail());
        assertEquals(chatSession.getPhone(), result.getPhone());
        assertEquals(chatSession.getFirstName(), result.getFirstName());
        assertEquals(chatSession.getLastName(), result.getLastName());
        assertEquals(chatSession.getProperty().getId(), result.getPropertyId());
    }

    @Test
    void testGetAll_Success() {
        List<ChatSession> sessions = List.of(chatSession);
        when(chatSessionRepository.findAll()).thenReturn(sessions);

        List<ChatSessionGetDTO> result = chatSessionService.getAll();

        assertEquals(1, result.size());

        ChatSessionGetDTO dto = result.get(0);
        assertEquals(chatSession.getId(), dto.getId());
        assertEquals(chatSession.getUserId(), dto.getUserId());
        assertEquals(chatSession.getEmail(), dto.getEmail());
        assertEquals(chatSession.getPhone(), dto.getPhone());
        assertEquals(chatSession.getFirstName(), dto.getFirstName());
        assertEquals(chatSession.getLastName(), dto.getLastName());
        assertEquals(chatSession.getProperty().getId(), dto.getPropertyId());
    }

    // casos de error

    @Test
    void testCreateFromUser_UserNotFound() {
        when(userRepository.exist("user123")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatSessionService.createFromUser("user123", 1L)
        );

        assertEquals("No se ha encontrado al usuario con ID: user123", exception.getMessage());
        verify(chatSessionRepository, never()).save(any());
    }

    @Test
    void testCreateFromUser_PropertyNotFound() {
        when(userRepository.exist("user123")).thenReturn(true);
        when(userRepository.findById("user123")).thenReturn(userDTO);
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                chatSessionService.createFromUser("user123", 1L)
        );

        assertEquals("No se ha encontrado la propiedad con ID: 1", exception.getMessage());
    }

    @Test
    void testCreateWithoutUser_MissingData() {
        sessionDTO.setEmail(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                chatSessionService.createWithoutUser(sessionDTO)
        );

        assertEquals("Faltan datos obligatorios para crear la sesión sin usuario.", exception.getMessage());
    }

    @Test
    void testCreateWithoutUser_PropertyNotFound() {
        when(objectMapper.convertValue(sessionDTO, ChatSession.class)).thenReturn(chatSession);
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                chatSessionService.createWithoutUser(sessionDTO)
        );

        assertEquals("No se ha encontrado la propiedad con ID: 1", exception.getMessage());
    }

    @Test
    void testGetById_NotFound() {
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                chatSessionService.getById(1L)
        );

        assertEquals("No se ha encontrado la sesion del chat", exception.getMessage());
    }

    @Test
    void testCreateFromUser_InternalError() {
        when(userRepository.exist("user123")).thenThrow(new RuntimeException("DB error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatSessionService.createFromUser("user123", 1L)
        );

        assertEquals("DB error", exception.getMessage());
    }

    @Test
    void testCreateWithoutUser_InternalError() {
        when(objectMapper.convertValue(sessionDTO, ChatSession.class)).thenThrow(new RuntimeException("Fail"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatSessionService.createWithoutUser(sessionDTO)
        );

        assertEquals("Fail", exception.getMessage());
    }

    @Test
    void testGetById_InternalError() {
        when(chatSessionRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatSessionService.getById(1L)
        );

        assertEquals("Unexpected", exception.getMessage());
    }

    @Test
    void testGetAll_InternalError() {
        when(chatSessionRepository.findAll()).thenThrow(new RuntimeException("Query failed"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatSessionService.getAll()
        );

        assertEquals("Query failed", exception.getMessage());
    }
}