package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.dto.NeighborhoodDTO;

import java.util.List;

public interface INeighborhoodService {
    ResponseEntity<String> createNeighborhood(NeighborhoodDTO neighborhoodDTO);

    ResponseEntity<String> deleteNeighborhood(Long id);

    ResponseEntity<NeighborhoodDTO> updateNeighborhood(Long id, NeighborhoodDTO neighborhoodDTO);

    ResponseEntity<List<NeighborhoodDTO>> getAll();

    ResponseEntity<NeighborhoodDTO> getById(Long id);
}
