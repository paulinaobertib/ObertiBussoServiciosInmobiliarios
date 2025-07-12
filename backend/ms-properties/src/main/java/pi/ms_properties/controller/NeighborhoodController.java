package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.dto.NeighborhoodGetDTO;
import pi.ms_properties.service.interf.INeighborhoodService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/neighborhood")
public class NeighborhoodController {

    private final INeighborhoodService neighborhoodService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createNeighborhood(@RequestBody NeighborhoodDTO neighborhoodDTO) {
        return neighborhoodService.createNeighborhood(neighborhoodDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteNeighborhood(@PathVariable Long id) {
        return neighborhoodService.deleteNeighborhood(id);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{id}")
    public ResponseEntity<NeighborhoodGetDTO> updateNeighborhood(@PathVariable Long id, @RequestBody NeighborhoodDTO neighborhoodDTO) {
        return neighborhoodService.updateNeighborhood(id, neighborhoodDTO);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<NeighborhoodGetDTO>> getAll() {
        return neighborhoodService.getAll();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<NeighborhoodGetDTO> getById(@PathVariable Long id) {
        return neighborhoodService.getById(id);
    }
}
