package pi.ms_users.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.Notice;
import pi.ms_users.domain.User;
import pi.ms_users.dto.NoticeDTO;
import pi.ms_users.dto.NoticeGetDTO;
import pi.ms_users.repository.INoticeRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.ImageRepository;
import pi.ms_users.security.SecurityUtils;
import pi.ms_users.service.interf.INoticeService;
import pi.ms_users.specification.NoticeSpecification;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("unused")
@Service
@RequiredArgsConstructor
public class NoticeService implements INoticeService {

    private final INoticeRepository noticeRepository;

    private final IUserRepository userRepository;

    private final ImageRepository imageRepository;

    private final ObjectMapper objectMapper;

    @Override
    public ResponseEntity<String> create(NoticeDTO noticeDTO) {
        User user = userRepository.findById(noticeDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario"));

        if (!SecurityUtils.isAdmin()) {
            throw new IllegalArgumentException("Este usuario no tiene permiso para crear una noticia");
        }

        String image = imageRepository.uploadImage(noticeDTO.getMainImage());

        Notice notice = objectMapper.convertValue(noticeDTO, Notice.class);
        notice.setDate(LocalDateTime.now());
        notice.setMainImage(image);

        noticeRepository.save(notice);
        return ResponseEntity.ok("Se ha guardado la noticia");
    }

    @Override
    public ResponseEntity<String> update(NoticeDTO noticeDTO) {
        User user = userRepository.findById(noticeDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado el usuario"));

        Notice existingNotice = noticeRepository.findById(noticeDTO.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado una noticia con ese id"));

        if (!SecurityUtils.isAdmin()) {
            throw new IllegalArgumentException("Este usuario no tiene permiso para actualizar una noticia");
        }

        Notice notice = objectMapper.convertValue(noticeDTO, Notice.class);
        notice.setDate(LocalDateTime.now());

        if (noticeDTO.getMainImage() != null && !noticeDTO.getMainImage().isEmpty()) {
            String image = imageRepository.uploadImage(noticeDTO.getMainImage());
            notice.setMainImage(image);
        } else {
            notice.setMainImage(existingNotice.getMainImage());
        }

        noticeRepository.save(notice);
        return ResponseEntity.ok("Se ha actualizado la noticia");
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado una noticia con ese id"));

        if (!SecurityUtils.isAdmin()) {
            throw new IllegalArgumentException("Este usuario no tiene permiso para eliminar una noticia");
        }

        noticeRepository.delete(notice);
        return ResponseEntity.ok("Se ha eliminado la noticia");
    }

    @Override
    public ResponseEntity<NoticeGetDTO> getById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado una noticia con ese id"));

        NoticeGetDTO noticeGetDTO = objectMapper.convertValue(notice, NoticeGetDTO.class);
        noticeGetDTO.setMainImage(imageRepository.imageURL(notice.getMainImage()));

        return ResponseEntity.ok(noticeGetDTO);
    }

    @Override
    public ResponseEntity<List<NoticeGetDTO>> getAll() {
        List<Notice> notices = noticeRepository.findAll();

        List<NoticeGetDTO> dtoList = notices.stream()
                .map(notice -> {
                    NoticeGetDTO dto = objectMapper.convertValue(notice, NoticeGetDTO.class);
                    dto.setMainImage(imageRepository.imageURL(notice.getMainImage()));
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(dtoList);
    }

    @Override
    public ResponseEntity<List<NoticeGetDTO>> search(String search) {
        Specification<Notice> specification = NoticeSpecification.textSearch(search);
        List<Notice> notices = noticeRepository.findAll(specification);

        List<NoticeGetDTO> dtoList = notices.stream()
                .map(notice -> {
                    NoticeGetDTO dto = objectMapper.convertValue(notice, NoticeGetDTO.class);
                    dto.setMainImage(imageRepository.imageURL(notice.getMainImage()));
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(dtoList);
    }
}
