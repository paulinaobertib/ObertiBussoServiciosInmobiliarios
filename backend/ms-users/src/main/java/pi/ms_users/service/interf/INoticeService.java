package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Notice;
import pi.ms_users.dto.NoticeDTO;
import pi.ms_users.dto.NoticeGetDTO;

import java.util.List;

public interface INoticeService {
    ResponseEntity<String> create(NoticeDTO noticeDTO);

    ResponseEntity<String> update(NoticeDTO noticeDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<NoticeGetDTO> getById(Long id);

    ResponseEntity<List<NoticeGetDTO>> getAll();

    ResponseEntity<List<NoticeGetDTO>> search(String search);
}
