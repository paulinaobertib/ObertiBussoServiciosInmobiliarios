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

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createOwner(@RequestBody Owner owner) {
        return ownerService.createOwner(owner);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteOwner(@PathVariable Long id) {
        return ownerService.deleteOwner(id);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<Owner> updateOwner(@RequestBody Owner owner) {
        return ownerService.updateOwner(owner);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByProperty/{id}")
    public ResponseEntity<Owner> getByPropertyId(@PathVariable Long id) {
        return ownerService.getByPropertyId(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Owner>> getAll() {
        return ownerService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Owner> getById(@PathVariable Long id) {
        return ownerService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/search")
    public ResponseEntity<List<Owner>> searchOwners(@RequestParam String search) {
        return ownerService.findBy(search);
    }
}