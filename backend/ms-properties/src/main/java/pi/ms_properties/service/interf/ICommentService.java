package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Comment;
import pi.ms_properties.dto.CommentDTO;

import java.util.List;

public interface ICommentService {
    ResponseEntity<String> create(CommentDTO commentDTO);

    ResponseEntity<String> update(CommentDTO commentDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<CommentDTO> getById(Long id);

    ResponseEntity<List<CommentDTO>> getByPropertyId(Long propertyId);
}
