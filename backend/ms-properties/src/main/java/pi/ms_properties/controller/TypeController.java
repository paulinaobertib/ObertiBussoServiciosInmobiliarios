package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Type;
import pi.ms_properties.service.impl.TypeService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/type")
public class TypeController {

    private final TypeService typeService;

    // @PreAutAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createType(@RequestBody Type type) {
        return typeService.createType(type);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<Type> updateType(@RequestBody Type type) {
        return typeService.updateType(type);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteType(@PathVariable Long id) {
        return typeService.deleteType(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Type>> getAll() {
        return typeService.getAll();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Type> getById(@PathVariable Long id) {
        return typeService.getById(id);
    }
}