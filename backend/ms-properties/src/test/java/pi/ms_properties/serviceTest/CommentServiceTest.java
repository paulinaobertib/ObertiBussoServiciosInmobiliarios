package pi.ms_properties.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Comment;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.CommentDTO;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.ICommentRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.UserRepository;
import pi.ms_properties.service.impl.CommentService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {

    @InjectMocks
    private CommentService commentService;

    @Mock
    private ICommentRepository commentRepository;

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private UserRepository userRepository;

    // casos de exito

    @Test
    void createComment_success() {
        CommentDTO dto = new CommentDTO(0L, "userId", "Buen lugar" , LocalDateTime.now(), 1L);
        Property property = new Property();
        property.setId(1L);
        var userDTO = new UserDTO();
        userDTO.setId("userId");

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(userRepository.findById("userId")).thenReturn(userDTO);

        ResponseEntity<String> response = commentService.create(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado correctamente el comentario", response.getBody());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void updateComment_success() {
        CommentDTO dto = new CommentDTO(1L, "userId", "Buen lugar" , LocalDateTime.now(), 1L);
        Property property = new Property();
        property.setId(1L);
        var userDTO = new UserDTO();
        userDTO.setId("userId");

        Comment comment = new Comment();

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(userRepository.findById("userId")).thenReturn(userDTO);

        ResponseEntity<String> response = commentService.update(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha actualizado correctamente el comentario de la propiedad", response.getBody());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void deleteComment_success() {
        Comment comment = new Comment();
        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        ResponseEntity<String> response = commentService.delete(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el comentario", response.getBody());
        verify(commentRepository).delete(comment);
    }

    @Test
    void getById_success() {
        Property property = new Property();
        property.setId(1L);
        Comment comment = new Comment(1L, "userId", "Descripción", LocalDateTime.now(), property);

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));

        ResponseEntity<CommentDTO> response = commentService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Descripción", response.getBody().getDescription());
        assertEquals(1L, response.getBody().getPropertyId());
    }

    @Test
    void getByPropertyId_success() {
        Property property = new Property();
        property.setId(1L);
        List<Comment> comments = List.of(
                new Comment(1L, "userId", "Comentario 1", LocalDateTime.now(), property),
                new Comment(2L, "userId", "Comentario 2", LocalDateTime.now(), property)
        );

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(commentRepository.findByPropertyId(1L)).thenReturn(comments);

        ResponseEntity<List<CommentDTO>> response = commentService.getByPropertyId(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    // casos de error

    @Test
    void createComment_propertyNotFound() {
        CommentDTO dto = new CommentDTO(0L, "userId", "Fallo", LocalDateTime.now(), 99L);
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            commentService.create(dto));

        assertEquals("No se ha encontrado la propiedad con ese id", ex.getMessage());
    }

    @Test
    void updateComment_notFound() {
        CommentDTO dto = new CommentDTO(1L, "userId", "No existe", LocalDateTime.now(), 1L);
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            commentService.update(dto));

        assertEquals("No se ha encontrado el comentario", ex.getMessage());
    }

    @Test
    void updateComment_propertyNotFound() {
        CommentDTO dto = new CommentDTO(1L, "userId", "Fallo", LocalDateTime.now(), 99L);
        when(commentRepository.findById(1L)).thenReturn(Optional.of(new Comment()));
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            commentService.update(dto));

        assertEquals("No se ha encontrado la propiedad con ese id", ex.getMessage());
    }

    @Test
    void deleteComment_notFound() {
        when(commentRepository.findById(100L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            commentService.delete(100L));

        assertEquals("No se ha encontrado el comentario", ex.getMessage());
    }

    @Test
    void getById_notFound() {
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            commentService.getById(1L));

        assertEquals("No se ha encontrado el comentario", ex.getMessage());
    }

    @Test
    void getByPropertyId_propertyNotFound() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
            commentService.getByPropertyId(99L));

        assertEquals("No se ha encontrado la propiedad con ese id", ex.getMessage());
    }

    @Test
    void createComment_genericException() {
        CommentDTO dto = new CommentDTO(0L, "userId", "Error", LocalDateTime.now(), 1L);
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            commentService.create(dto));

        assertEquals("Error", ex.getMessage());
    }

    @Test
    void updateComment_genericException() {
        CommentDTO dto = new CommentDTO(1L, "userId", "Error", LocalDateTime.now(), 1L);
        when(commentRepository.findById(1L)).thenThrow(new RuntimeException("Error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            commentService.update(dto));

        assertEquals("Error", ex.getMessage());
    }

    @Test
    void create_shouldThrowDataIntegrityViolation() {
        CommentDTO commentDTO = new CommentDTO(1L, "userId", "Comentario", LocalDateTime.now(), 1L);
        Property property = new Property();
        property.setId(1L);
        var userDTO = new UserDTO();
        userDTO.setId("userId");

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(userRepository.findById("userId")).thenReturn(userDTO);
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(commentRepository).save(any(Comment.class));

        assertThrows(DataIntegrityViolationException.class, () ->
            commentService.create(commentDTO));
    }

    @Test
    void update_shouldThrowDataIntegrityViolation() {
        CommentDTO commentDTO = new CommentDTO(1L, "userId", "Comentario actualizado", LocalDateTime.now(), 1L);
        Comment comment = new Comment();
        comment.setId(1L);
        Property property = new Property();
        property.setId(1L);
        var userDTO = new UserDTO();
        userDTO.setId("userId");

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(userRepository.findById("userId")).thenReturn(userDTO);
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(commentRepository).save(any(Comment.class));

        assertThrows(DataIntegrityViolationException.class, () ->
            commentService.update(commentDTO));
    }

    @Test
    void delete_shouldThrowDataIntegrityViolation() {
        Comment comment = new Comment();
        comment.setId(1L);

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(commentRepository).delete(comment);

        assertThrows(DataIntegrityViolationException.class, () ->
            commentService.delete(1L));
    }

    @Test
    void getById_shouldThrowDataIntegrityViolation() {
        when(commentRepository.findById(1L)).thenThrow(new DataIntegrityViolationException("Violation"));

        assertThrows(DataIntegrityViolationException.class, () ->
            commentService.getById(1L));
    }

    @Test
    void getByPropertyId_shouldThrowDataIntegrityViolation() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(new Property()));
        when(commentRepository.findByPropertyId(1L)).thenThrow(new DataIntegrityViolationException("Violation"));

        assertThrows(DataIntegrityViolationException.class, () ->
            commentService.getByPropertyId(1L));
    }

    @Test
    void create_userNoFound() {
        CommentDTO dto = new CommentDTO(0L, "userId", "Buen lugar", LocalDateTime.now(), 1L);

        Property property = new Property();
        property.setId(1L);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(userRepository.findById("userId")).thenReturn(null); // 👈 simulamos que NO existe el usuario

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> commentService.create(dto)
        );

        assertEquals("No se ha encontrado al usuario.", ex.getMessage());

        verify(commentRepository, never()).save(any());
    }

    @Test
    void update_userNoFound() {
        CommentDTO dto = new CommentDTO(99L, "userId", "Nuevo texto", LocalDateTime.now(), 1L);

        when(commentRepository.findById(99L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> commentService.update(dto)
        );

        assertEquals("No se ha encontrado el comentario", ex.getMessage());
    }
}

