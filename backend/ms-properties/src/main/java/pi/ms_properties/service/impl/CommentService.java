package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Comment;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.CommentDTO;
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
    public ResponseEntity<String> create(CommentDTO commentDTO) {
        try {
            Optional<Property> property = propertyRepository.findById(commentDTO.getPropertyId());
            if (property.isEmpty()) {
                return ResponseEntity.badRequest().body("No se ha encontrado la propiedad con ese id");
            }
            Comment comment = new Comment();
            comment.setDescription(commentDTO.getDescription());
            comment.setProperty(property.get());
            commentRepository.save(comment);
            return ResponseEntity.ok("Se ha guardado correctamente el comentario");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> update(CommentDTO commentDTO) {
        try {
            Optional<Comment> search = commentRepository.findById(commentDTO.getId());
            if (search.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el comentario");
            }

            Optional<Property> property = propertyRepository.findById(commentDTO.getPropertyId());
            if (property.isEmpty()) {
                return ResponseEntity.badRequest().body("No se ha encontrado la propiedad con ese id");
            }
            Comment comment = search.get();
            comment.setId(commentDTO.getId());
            comment.setDescription(commentDTO.getDescription());
            comment.setProperty(property.get());
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
    public ResponseEntity<CommentDTO> getById(Long id) {
        try {
            Optional<Comment> comment = commentRepository.findById(id);
            if (comment.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Comment get = comment.get();
            CommentDTO commentDTO = new CommentDTO(get.getId(), get.getDescription(), get.getProperty().getId());
            return ResponseEntity.ok(commentDTO);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<CommentDTO>> getByPropertyId(Long propertyId) {
        try {
            Optional<Property> property = propertyRepository.findById(propertyId);
            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            List<Comment> comments = commentRepository.findByPropertyId(propertyId);
            List<CommentDTO> commentDTOS = comments
                    .stream()
                    .map(comment -> new CommentDTO(
                            comment.getId(),
                            comment.getDescription(),
                            comment.getProperty().getId()
                    ))
                    .toList();
            return ResponseEntity.ok(commentDTOS);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
