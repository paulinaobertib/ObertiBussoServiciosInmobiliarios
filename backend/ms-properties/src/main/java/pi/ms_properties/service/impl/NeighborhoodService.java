package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.domain.NeighborhoodType;
import pi.ms_properties.dto.NeighborhoodDTO;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.service.interf.INeighborhoodService;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NeighborhoodService implements INeighborhoodService {

    private final INeighborhoodRepository neighborhoodRepository;
    private final ObjectMapper mapper;

    @Override
    public ResponseEntity<String> createNeighborhood(NeighborhoodDTO neighborhoodDTO) {
        if (neighborhoodDTO.getType() == null ||
                Arrays.stream(NeighborhoodType.values())
                        .noneMatch(t -> t.name().equalsIgnoreCase(neighborhoodDTO.getType()))) {
            throw new IllegalArgumentException("Tipo de barrio inválido: " + neighborhoodDTO.getType());
        }

        Neighborhood neighborhood = new Neighborhood();
        neighborhood.setName(neighborhoodDTO.getName());
        neighborhood.setType(NeighborhoodType.fromString(neighborhoodDTO.getType()));
        neighborhood.setCity(neighborhoodDTO.getCity());

        try {
            neighborhoodRepository.save(neighborhood);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("El barrio '" + neighborhoodDTO.getName() + "' ya existe");
        }

        return ResponseEntity.ok("Se ha guardado el barrio");
    }

    @Override
    public ResponseEntity<String> deleteNeighborhood(Long id) {
        Neighborhood neighborhood = neighborhoodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el barrio con ID: " + id));

        neighborhoodRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el barrio");
    }

    @Override
    public ResponseEntity<NeighborhoodDTO> updateNeighborhood(Long id, NeighborhoodDTO neighborhoodDTO) {
        Neighborhood neighborhood = neighborhoodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el barrio con ID: " + id));

        neighborhood.setName(neighborhoodDTO.getName());
        neighborhood.setType(NeighborhoodType.fromString(neighborhoodDTO.getType()));
        neighborhood.setCity(neighborhoodDTO.getCity());

        Neighborhood update = neighborhoodRepository.save(neighborhood);
        NeighborhoodDTO updateDTO = mapper.convertValue(update, NeighborhoodDTO.class);

        return ResponseEntity.ok(updateDTO);
    }

    @Override
    public ResponseEntity<List<NeighborhoodDTO>> getAll() {
        List<Neighborhood> neighborhoods = neighborhoodRepository.findAll();

        if (neighborhoods.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<NeighborhoodDTO> neighborhoodDTOS = neighborhoods.stream()
                .map(neighborhood -> new NeighborhoodDTO(
                        neighborhood.getId(),
                        neighborhood.getName(),
                        String.valueOf(neighborhood.getType()),
                        neighborhood.getCity()))
                .toList();

        return ResponseEntity.ok(neighborhoodDTOS);
    }

    @Override
    public ResponseEntity<NeighborhoodDTO> getById(Long id) {
        Neighborhood neighborhood = neighborhoodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el barrio con ID: " + id));

        NeighborhoodDTO neighborhoodDTO = mapper.convertValue(neighborhood, NeighborhoodDTO.class);
        return ResponseEntity.ok(neighborhoodDTO);
    }
}
