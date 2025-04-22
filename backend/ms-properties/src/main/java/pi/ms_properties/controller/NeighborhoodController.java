package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.service.impl.NeighborhoodService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/neighborhood")
public class NeighborhoodController {

    private final NeighborhoodService neighborhoodService;

    @PostMapping("/create")
    public ResponseEntity<String> createNeighborhood(@RequestBody NeighborhoodDTO neighborhoodDTO) {
        return neighborhoodService.createNeighborhood(neighborhoodDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteNeighborhood(@PathVariable Long id) {
        return neighborhoodService.deleteNeighborhood(id);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<NeighborhoodDTO> updateNeighborhood(@PathVariable Long id, @RequestBody NeighborhoodDTO neighborhoodDTO) {
        return neighborhoodService.updateNeighborhood(id, neighborhoodDTO);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<NeighborhoodDTO>> getAll() {
        return neighborhoodService.getAll();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<NeighborhoodDTO> getById(@PathVariable Long id) {
        return neighborhoodService.getById(id);
    }
}
