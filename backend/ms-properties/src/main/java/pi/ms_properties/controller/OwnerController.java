package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.service.impl.OwnerService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/owner")
public class OwnerController {

    private final OwnerService ownerService;

    @PostMapping("/create")
    public ResponseEntity<String> createOwner(@RequestBody Owner owner) {
        return ownerService.createOwner(owner);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteOwner(@PathVariable Long id) {
        return ownerService.deleteOwner(id);
    }

    @PutMapping("/update")
    public ResponseEntity<Owner> updateOwner(@RequestBody Owner owner) {
        return ownerService.updateOwner(owner);
    }

    @GetMapping("/getByProperty/{id}")
    public ResponseEntity<Owner> getByPropertyId(@PathVariable Long id) {
        return ownerService.getByPropertyId(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Owner>> getAll() {
        return ownerService.getAll();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Owner> getById(@PathVariable Long id) {
        return ownerService.getById(id);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Owner>> searchOwners(@RequestParam String search) {
        return ownerService.findBy(search);
    }

}