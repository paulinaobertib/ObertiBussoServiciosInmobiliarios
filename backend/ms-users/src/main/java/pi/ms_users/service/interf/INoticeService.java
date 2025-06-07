package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Notice;

import java.util.List;

public interface INoticeService {
    ResponseEntity<String> create(Notice notice);

    ResponseEntity<String> update(Notice notice);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<Notice> getById(Long id);

    ResponseEntity<List<Notice>> getAll();

    ResponseEntity<List<Notice>> search(String search);
}
