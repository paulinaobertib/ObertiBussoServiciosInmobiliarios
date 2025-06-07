package pi.ms_properties.serviceTest;

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
import pi.ms_properties.repository.ICommentRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.impl.CommentService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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

    // casos de exito

    @Test
    void createComment_success() {
        CommentDTO dto = new CommentDTO(0, "Buen lugar", 1L);
        Property property = new Property();
        property.setId(1L);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        ResponseEntity<String> response = commentService.create(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado correctamente el comentario", response.getBody());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void updateComment_success() {
        CommentDTO dto = new CommentDTO(1L, "Actualizado", 1L);
        Property property = new Property();
        property.setId(1L);
        Comment comment = new Comment();

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

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
        Comment comment = new Comment(1L, "Descripción", property);

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
                new Comment(1L, "Comentario 1", property),
                new Comment(2L, "Comentario 2", property)
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
        CommentDTO dto = new CommentDTO(0, "Fallo", 99L);
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = commentService.create(dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("No se ha encontrado la propiedad con ese id", response.getBody());
    }

    @Test
    void updateComment_notFound() {
        CommentDTO dto = new CommentDTO(1L, "No existe", 1L);
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = commentService.update(dto);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No se ha encontrado el comentario", response.getBody());
    }

    @Test
    void updateComment_propertyNotFound() {
        CommentDTO dto = new CommentDTO(1L, "Fallo", 99L);
        when(commentRepository.findById(1L)).thenReturn(Optional.of(new Comment()));
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = commentService.update(dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("No se ha encontrado la propiedad con ese id", response.getBody());
    }

    @Test
    void deleteComment_notFound() {
        when(commentRepository.findById(100L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = commentService.delete(100L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("No se ha encontrado el comentario", response.getBody());
    }

    @Test
    void getById_notFound() {
        when(commentRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<CommentDTO> response = commentService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getByPropertyId_propertyNotFound() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<List<CommentDTO>> response = commentService.getByPropertyId(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void createComment_genericException() {
        CommentDTO dto = new CommentDTO(0, "Error", 1L);
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("Error"));

        ResponseEntity<String> response = commentService.create(dto);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void updateComment_genericException() {
        CommentDTO dto = new CommentDTO(1L, "Error", 1L);
        when(commentRepository.findById(1L)).thenThrow(new RuntimeException("Error"));

        ResponseEntity<String> response = commentService.update(dto);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void create_shouldReturnBadRequest_whenDataIntegrityViolationException() {
        CommentDTO commentDTO = new CommentDTO(1, "Comentario", 1L);
        Property property = new Property();
        property.setId(1L);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(commentRepository).save(any(Comment.class));

        ResponseEntity<String> response = commentService.create(commentDTO);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void update_shouldReturnBadRequest_whenDataIntegrityViolationException() {
        CommentDTO commentDTO = new CommentDTO(1L, "Comentario actualizado", 1L);
        Comment comment = new Comment();
        comment.setId(1L);
        Property property = new Property();
        property.setId(1L);

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(commentRepository).save(any(Comment.class));

        ResponseEntity<String> response = commentService.update(commentDTO);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void delete_shouldReturnBadRequest_whenDataIntegrityViolationException() {
        Comment comment = new Comment();
        comment.setId(1L);

        when(commentRepository.findById(1L)).thenReturn(Optional.of(comment));
        doThrow(new DataIntegrityViolationException("Violation"))
                .when(commentRepository).delete(comment);

        ResponseEntity<String> response = commentService.delete(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getById_shouldReturnBadRequest_whenDataIntegrityViolationException() {
        when(commentRepository.findById(1L)).thenThrow(new DataIntegrityViolationException("Violation"));

        ResponseEntity<CommentDTO> response = commentService.getById(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void getByPropertyId_shouldReturnBadRequest_whenDataIntegrityViolationException() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(new Property()));
        when(commentRepository.findByPropertyId(1L)).thenThrow(new DataIntegrityViolationException("Violation"));

        ResponseEntity<List<CommentDTO>> response = commentService.getByPropertyId(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}

