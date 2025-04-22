package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.domain.NeighborhoodType;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.repository.NeighborhoodRepository;
import pi.ms_properties.service.interf.INeighborhoodService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NeighborhoodService implements INeighborhoodService {

    private final NeighborhoodRepository neighborhoodRepository;

    private final ObjectMapper mapper;

    @Override
    public ResponseEntity<String> createNeighborhood(NeighborhoodDTO neighborhoodDTO) {
        try {
            Neighborhood neighborhood = new Neighborhood();
            neighborhood.setName(neighborhoodDTO.getName());
            neighborhood.setType(NeighborhoodType.fromString(neighborhoodDTO.getType()));
            neighborhood.setCity(neighborhoodDTO.getCity());
            neighborhoodRepository.save(neighborhood);

            return ResponseEntity.ok("Se ha guardado el barrio");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido guardar el barrio" + e);
        }
    }

    @Override
    public ResponseEntity<String> deleteNeighborhood(Long id) {
        try {
            Optional<Neighborhood> neighborhood = neighborhoodRepository.findById(id);

            if (neighborhood.isEmpty()) {
                return ResponseEntity.badRequest().body("No existe el barrio");
            } else {
                neighborhoodRepository.deleteById(id);
                return ResponseEntity.ok("Se ha eliminado el barrio");
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido eliminar el barrio" + e);
        }
    }

    @Override
    public ResponseEntity<NeighborhoodDTO> updateNeighborhood(Long id, NeighborhoodDTO neighborhoodDTO) {
        try {
            Optional<Neighborhood> optionalNeighborhood = neighborhoodRepository.findById(id);

            if (optionalNeighborhood.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Neighborhood neighborhood = optionalNeighborhood.get();
            neighborhood.setName(neighborhoodDTO.getName());
            neighborhood.setType(NeighborhoodType.fromString(neighborhoodDTO.getType()));
            neighborhood.setCity(neighborhoodDTO.getCity());

            Neighborhood update = neighborhoodRepository.save(neighborhood);

            NeighborhoodDTO updateDTO = mapper.convertValue(update, NeighborhoodDTO.class);

            return ResponseEntity.ok(updateDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<NeighborhoodDTO>> getAll() {
        try {
            List<Neighborhood> neighborhoods = neighborhoodRepository.findAll();

            if (neighborhoods.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            List<NeighborhoodDTO> neighborhoodDTOS = neighborhoods.stream()
                    .map(neighborhood -> new NeighborhoodDTO(neighborhood.getName(), String.valueOf(neighborhood.getType()), neighborhood.getCity()))
                    .toList();

            return ResponseEntity.ok(neighborhoodDTOS);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<NeighborhoodDTO> getById(Long id) {
        try {
            Optional<Neighborhood> neighborhood = neighborhoodRepository.findById(id);

            if (neighborhood.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            NeighborhoodDTO neighborhoodDTO = mapper.convertValue(neighborhood.get(), NeighborhoodDTO.class);

            return ResponseEntity.ok(neighborhoodDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
