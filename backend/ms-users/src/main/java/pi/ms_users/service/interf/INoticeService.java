package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Notice;

import java.util.List;

public interface INoticeService {
    ResponseEntity<?> create(Notice notice);

    ResponseEntity<?> update(Notice notice);

    ResponseEntity<?> delete(Long id);

    ResponseEntity<?> getById(Long id);

    ResponseEntity<?> getAll();

    ResponseEntity<?> search(String search);
}
