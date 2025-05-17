package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Comment;
import pi.ms_properties.service.impl.CommentService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/comment")
public class CommentController {

    private final CommentService commentService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody Comment comment) {
        return commentService.create(comment);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody Comment comment) {
        return commentService.update(comment);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return commentService.delete(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Comment> getById(@PathVariable Long id) {
        return commentService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Comment>> getByPropertyId(@PathVariable Long propertyId) {
        return commentService.getByPropertyId(propertyId);
    }
}
