package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.dto.NeighborhoodGetDTO;

import java.util.List;

public interface INeighborhoodService {
    ResponseEntity<String> createNeighborhood(NeighborhoodDTO neighborhoodDTO);

    ResponseEntity<String> deleteNeighborhood(Long id);

    ResponseEntity<NeighborhoodGetDTO> updateNeighborhood(Long id, NeighborhoodDTO neighborhoodDTO);

    ResponseEntity<List<NeighborhoodGetDTO>> getAll();

    ResponseEntity<NeighborhoodGetDTO> getById(Long id);

    ResponseEntity<List<NeighborhoodGetDTO>> findBy(String search);
}
