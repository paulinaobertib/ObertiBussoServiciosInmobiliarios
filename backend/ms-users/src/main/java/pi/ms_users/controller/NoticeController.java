package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_users.dto.NoticeDTO;
import pi.ms_users.dto.NoticeGetDTO;
import pi.ms_users.service.interf.INoticeService;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("notices")
@RequiredArgsConstructor
public class NoticeController {

    private final INoticeService noticeService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestParam("userId") String userId, @RequestParam("title") String title, @RequestParam("mainImage") MultipartFile mainImage, @RequestParam("description") String description) {
        NoticeDTO noticeDTO = new NoticeDTO(null, userId, LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")), title, mainImage, description);
        return noticeService.create(noticeDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestParam("userId") String userId, @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date, @RequestParam("title") String title, @RequestParam(value = "mainImage", required = false) MultipartFile mainImage, @RequestParam("description") String description) {
        NoticeDTO noticeDTO = new NoticeDTO(id, userId, date, title, mainImage, description);
        return noticeService.update(noticeDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return noticeService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<NoticeGetDTO> getById(@PathVariable Long id) {
        return noticeService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<NoticeGetDTO>> getAll() {
        return noticeService.getAll();
    }

    @GetMapping("/search")
    public ResponseEntity<List<NoticeGetDTO>> search(@RequestParam String text) {
        return noticeService.search(text);
    }
}