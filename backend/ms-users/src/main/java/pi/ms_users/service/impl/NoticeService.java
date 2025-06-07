package pi.ms_users.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.Notice;
import pi.ms_users.domain.User;
import pi.ms_users.repository.INoticeRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.INoticeService;
import pi.ms_users.specification.NoticeSpecification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NoticeService implements INoticeService {

    private final INoticeRepository noticeRepository;

    private final IUserRepository userRepository;

    @Override
    public ResponseEntity<String> create(Notice notice) {
        try {
            Optional<User> user = userRepository.findById(notice.getUserId());
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el usuario");
            }
            List<String> role = userRepository.getUserRoles(notice.getUserId());
            if (role.contains("app_admin")) {
                notice.setDate(LocalDateTime.now());
                noticeRepository.save(notice);
                return ResponseEntity.ok("Se ha guardado la noticia");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Este usuario no tiene permiso para crear una noticia");
            }
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> update(Notice notice) {
        try {
            Optional<User> user = userRepository.findById(notice.getUserId());
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado el usuario");
            }

            Optional<Notice> noticeOptional = noticeRepository.findById(notice.getId());
            if (noticeOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado una noticia con ese id");
            }
            List<String> role = userRepository.getUserRoles(notice.getUserId());
            if (role.contains("app_admin")) {
                notice.setDate(LocalDateTime.now());
                noticeRepository.save(notice);
                return ResponseEntity.ok("Se ha actualizado la noticia");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Este usuario no tiene permiso para actualizar una noticia");
            }
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        try {
            Optional<Notice> noticeOptional = noticeRepository.findById(id);
            if (noticeOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado una noticia con ese id");
            }

            Notice notice = noticeOptional.get();
            noticeRepository.delete(notice);
            return ResponseEntity.ok("Se ha eliminado la noticia");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Notice> getById(Long id) {
        try {
            Optional<Notice> noticeOptional = noticeRepository.findById(id);
            if (noticeOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            } else {
                Notice notice = noticeOptional.get();
                return ResponseEntity.ok(notice);
            }
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Notice>> getAll() {
        try {
            List<Notice> notices = noticeRepository.findAll();
            return ResponseEntity.ok(notices);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Notice>> search(String search) {
        try {
            Specification<Notice> specification = NoticeSpecification.textSearch(search);
            List<Notice> notices = noticeRepository.findAll(specification);
            return ResponseEntity.ok(notices);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
