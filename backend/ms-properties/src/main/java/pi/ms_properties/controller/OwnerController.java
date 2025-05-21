package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.service.impl.OwnerService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/owner")
public class OwnerController {

    private final OwnerService ownerService;

    // @PreAutAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createOwner(@RequestBody Owner owner) {
        return ownerService.createOwner(owner);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteOwner(@PathVariable Long id) {
        return ownerService.deleteOwner(id);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<Owner> updateOwner(@RequestBody Owner owner) {
        return ownerService.updateOwner(owner);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/getByProperty/{id}")
    public ResponseEntity<Owner> getByPropertyId(@PathVariable Long id) {
        return ownerService.getByPropertyId(id);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Owner>> getAll() {
        return ownerService.getAll();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Owner> getById(@PathVariable Long id) {
        return ownerService.getById(id);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/search")
    public ResponseEntity<List<Owner>> searchOwners(@RequestParam String search) {
        return ownerService.findBy(search);
    }
}