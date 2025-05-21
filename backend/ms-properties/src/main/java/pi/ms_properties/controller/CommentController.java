package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Comment;
import pi.ms_properties.dto.CommentDTO;
import pi.ms_properties.service.impl.CommentService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/comment")
public class CommentController {

    private final CommentService commentService;

    // @PreAutAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody CommentDTO commentDTO) {
        return commentService.create(commentDTO);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody CommentDTO commentDTO) {
        return commentService.update(commentDTO);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return commentService.delete(id);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<CommentDTO> getById(@PathVariable Long id) {
        return commentService.getById(id);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<CommentDTO>> getByPropertyId(@PathVariable Long propertyId) {
        return commentService.getByPropertyId(propertyId);
    }
}
