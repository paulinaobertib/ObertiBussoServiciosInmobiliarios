package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Comment;

import java.util.List;

public interface ICommentService {
    ResponseEntity<String> create(Comment comment);

    ResponseEntity<String> update(Comment comment);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<Comment> getById(Long id);

    ResponseEntity<List<Comment>> getByPropertyId(Long propertyId);
}
