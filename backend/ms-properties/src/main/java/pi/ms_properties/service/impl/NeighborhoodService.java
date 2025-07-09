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
import pi.ms_properties.dto.NeighborhoodGetDTO;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.service.interf.INeighborhoodService;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NeighborhoodService implements INeighborhoodService {

    private final INeighborhoodRepository neighborhoodRepository;

    private final ObjectMapper mapper;

    private final GeocodingNeighborhoodService geocodingNeighborhoodService;

    private void saveNeighborhood(NeighborhoodDTO neighborhoodDTO, Neighborhood neighborhood) {
        neighborhood.setName(neighborhoodDTO.getName());
        neighborhood.setType(NeighborhoodType.fromString(neighborhoodDTO.getType()));
        neighborhood.setCity(neighborhoodDTO.getCity());

        Optional<GeocodingNeighborhoodService.Coordinates> coordinates =
                geocodingNeighborhoodService.getCoordinates(neighborhoodDTO.getName(), neighborhoodDTO.getCity());

        if (coordinates.isEmpty()) {
            throw new IllegalArgumentException("No se pudieron obtener coordenadas para el barrio y ciudad especificados.");
        }

        neighborhood.setLatitude(coordinates.get().latitude());
        neighborhood.setLongitude(coordinates.get().longitude());
    }

    @Override
    public ResponseEntity<String> createNeighborhood(NeighborhoodDTO neighborhoodDTO) {
        if (neighborhoodDTO.getType() == null ||
                Arrays.stream(NeighborhoodType.values())
                        .noneMatch(t -> t.name().equalsIgnoreCase(neighborhoodDTO.getType()))) {
            throw new IllegalArgumentException("Tipo de barrio inválido: " + neighborhoodDTO.getType());
        }

        Neighborhood neighborhood = new Neighborhood();
        saveNeighborhood(neighborhoodDTO, neighborhood);

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
    public ResponseEntity<NeighborhoodGetDTO> updateNeighborhood(Long id, NeighborhoodDTO neighborhoodDTO) {
        Neighborhood neighborhood = neighborhoodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el barrio con ID: " + id));

        saveNeighborhood(neighborhoodDTO, neighborhood);

        Neighborhood update = neighborhoodRepository.save(neighborhood);
        NeighborhoodGetDTO updateDTO = mapper.convertValue(update, NeighborhoodGetDTO.class);

        return ResponseEntity.ok(updateDTO);
    }

    @Override
    public ResponseEntity<List<NeighborhoodGetDTO>> getAll() {
        List<Neighborhood> neighborhoods = neighborhoodRepository.findAll();

        if (neighborhoods.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<NeighborhoodGetDTO> neighborhoodDTOS = neighborhoods.stream()
                .map(neighborhood -> new NeighborhoodGetDTO(
                        neighborhood.getId(),
                        neighborhood.getName(),
                        String.valueOf(neighborhood.getType()),
                        neighborhood.getCity(),
                        neighborhood.getLatitude(),
                        neighborhood.getLongitude()))
                .toList();

        return ResponseEntity.ok(neighborhoodDTOS);
    }

    @Override
    public ResponseEntity<NeighborhoodGetDTO> getById(Long id) {
        Neighborhood neighborhood = neighborhoodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el barrio con ID: " + id));

        NeighborhoodGetDTO neighborhoodDTO = mapper.convertValue(neighborhood, NeighborhoodGetDTO.class);
        return ResponseEntity.ok(neighborhoodDTO);
    }
}
