package pi.ms_users.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.Notice;
import pi.ms_users.domain.User;
import pi.ms_users.repository.INoticeRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.INoticeService;
import pi.ms_users.specification.NoticeSpecification;
import pi.ms_users.security.SecurityUtils;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("unused")
@Service
@RequiredArgsConstructor
public class NoticeService implements INoticeService {

    private final INoticeRepository noticeRepository;

    private final IUserRepository userRepository;

    @Override
    public ResponseEntity<String> create(Notice notice) {
        User user = userRepository.findById(notice.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario"));

        List<String> roles = userRepository.getUserRoles(notice.getUserId());
        if (!SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("No tiene permiso para crear una noticia.");
        }

        notice.setDate(LocalDateTime.now());
        noticeRepository.save(notice);
        return ResponseEntity.ok("Se ha guardado la noticia");
    }

    @Override
    public ResponseEntity<String> update(Notice notice) {
        User user = userRepository.findById(notice.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario"));

        Notice existingNotice = noticeRepository.findById(notice.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado una noticia con ese id"));

        List<String> roles = userRepository.getUserRoles(notice.getUserId());
        if (!SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("No tiene permiso para actualizar una noticia.");
        }

        notice.setDate(LocalDateTime.now());
        noticeRepository.save(notice);
        return ResponseEntity.ok("Se ha actualizado la noticia");
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado una noticia con ese id"));

        noticeRepository.delete(notice);
        return ResponseEntity.ok("Se ha eliminado la noticia");
    }

    @Override
    public ResponseEntity<Notice> getById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado una noticia con ese id"));

        return ResponseEntity.ok(notice);
    }

    @Override
    public ResponseEntity<List<Notice>> getAll() {
        List<Notice> notices = noticeRepository.findAll();
        return ResponseEntity.ok(notices);
    }

    @Override
    public ResponseEntity<List<Notice>> search(String search) {
        Specification<Notice> specification = NoticeSpecification.textSearch(search);
        List<Notice> notices = noticeRepository.findAll(specification);
        return ResponseEntity.ok(notices);
    }
}
