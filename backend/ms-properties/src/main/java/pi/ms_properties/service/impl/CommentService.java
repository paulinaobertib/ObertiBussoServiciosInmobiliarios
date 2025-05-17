package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Comment;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.Property;
import pi.ms_properties.repository.ICommentRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.interf.ICommentService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {

    private final ICommentRepository commentRepository;

    private final IPropertyRepository propertyRepository;

    @Override
    public ResponseEntity<String> create(Comment comment) {
        try {
            Optional<Property> property = propertyRepository.findById(comment.getProperty().getId());
            if (property.isEmpty()) {
                return ResponseEntity.badRequest().body("No se ha encontrado la propiedad con ese id");
            }
            commentRepository.save(comment);
            return ResponseEntity.ok("Se ha guardado correctamente el comentario");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> update(Comment comment) {
        try {
            Optional<Comment> search = commentRepository.findById(comment.getId());
            if (search.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el comentario");
            }

            Optional<Property> property = propertyRepository.findById(comment.getProperty().getId());
            if (property.isEmpty()) {
                return ResponseEntity.badRequest().body("No se ha encontrado la propiedad con ese id");
            }

            commentRepository.save(comment);
            return ResponseEntity.ok("Se ha actualizado correctamente el comentario de la propiedad");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        try {
            Optional<Comment> comment = commentRepository.findById(id);
            if (comment.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el comentario");
            }

            commentRepository.delete(comment.get());
            return ResponseEntity.ok("Se ha eliminado el comentario");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Comment> getById(Long id) {
        try {
            Optional<Comment> comment = commentRepository.findById(id);
            return comment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Comment>> getByPropertyId(Long propertyId) {
        try {
            Optional<Property> property = propertyRepository.findById(propertyId);
            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<Comment> comments = commentRepository.findByPropertyId(propertyId);
            return ResponseEntity.ok(comments);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
