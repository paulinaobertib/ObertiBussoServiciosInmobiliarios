package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Notice;
import pi.ms_users.service.interf.INoticeService;

import java.util.List;

@RestController
@RequestMapping("notices")
@RequiredArgsConstructor
public class NoticeController {

    private final INoticeService noticeService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody Notice notice) {
        return noticeService.create(notice);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody Notice notice) {
        return noticeService.update(notice);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return noticeService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Notice> getById(@PathVariable Long id) {
        return noticeService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Notice>> getAll() {
        return noticeService.getAll();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Notice>> search(@RequestParam String text) {
        return noticeService.search(text);
    }
}