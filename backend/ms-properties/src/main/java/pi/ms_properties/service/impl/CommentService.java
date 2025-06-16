package pi.ms_properties.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Comment;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.CommentDTO;
import pi.ms_properties.repository.ICommentRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.interf.ICommentService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {

    private final ICommentRepository commentRepository;
    private final IPropertyRepository propertyRepository;

    @Override
    public ResponseEntity<String> create(CommentDTO commentDTO) {
        Property property = propertyRepository.findById(commentDTO.getPropertyId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la propiedad con ese id"));

        Comment comment = new Comment();
        comment.setDescription(commentDTO.getDescription());
        comment.setProperty(property);
        commentRepository.save(comment);

        return ResponseEntity.ok("Se ha guardado correctamente el comentario");
    }

    @Override
    public ResponseEntity<String> update(CommentDTO commentDTO) {
        Comment existing = commentRepository.findById(commentDTO.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el comentario"));

        Property property = propertyRepository.findById(commentDTO.getPropertyId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la propiedad con ese id"));

        existing.setDescription(commentDTO.getDescription());
        existing.setProperty(property);
        commentRepository.save(existing);

        return ResponseEntity.ok("Se ha actualizado correctamente el comentario de la propiedad");
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el comentario"));

        commentRepository.delete(comment);
        return ResponseEntity.ok("Se ha eliminado el comentario");
    }

    @Override
    public ResponseEntity<CommentDTO> getById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el comentario"));

        CommentDTO commentDTO = new CommentDTO(comment.getId(), comment.getDescription(), comment.getProperty().getId());
        return ResponseEntity.ok(commentDTO);
    }

    @Override
    public ResponseEntity<List<CommentDTO>> getByPropertyId(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la propiedad con ese id"));

        List<Comment> comments = commentRepository.findByPropertyId(propertyId);
        List<CommentDTO> commentDTOS = comments.stream()
                .map(comment -> new CommentDTO(
                        comment.getId(),
                        comment.getDescription(),
                        comment.getProperty().getId()
                ))
                .toList();

        return ResponseEntity.ok(commentDTOS);
    }
}
