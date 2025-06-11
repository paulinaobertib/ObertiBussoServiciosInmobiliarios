package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Notice;
import pi.ms_users.service.impl.NoticeService;

import java.util.List;

@RestController
@RequestMapping("notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Notice notice) {
        return noticeService.create(notice);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<?> update(@RequestBody Notice notice) {
        return noticeService.update(notice);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return noticeService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return noticeService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        return noticeService.getAll();
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String text) {
        return noticeService.search(text);
    }
}